import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const API = "https://api.heygen.com";

interface HeygenConfig {
  apiKey: string;
  avatarId: string;
  voiceId: string;
  avatarType: "avatar" | "talking_photo";
}

export function heygenConfigFromEnv(): HeygenConfig | null {
  const apiKey = process.env.HEYGEN_API_KEY;
  const avatarId = process.env.HEYGEN_AVATAR_ID;
  const voiceId = process.env.HEYGEN_VOICE_ID;
  if (!apiKey || !avatarId || !voiceId) return null;
  return {
    apiKey,
    avatarId,
    voiceId,
    avatarType: process.env.HEYGEN_AVATAR_TYPE === "talking_photo" ? "talking_photo" : "avatar",
  };
}

async function heygenFetch(cfg: HeygenConfig, path: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "X-Api-Key": cfg.apiKey,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`HeyGen ${path} -> ${res.status}: ${JSON.stringify(body)}`);
  return body;
}

/**
 * Generate a 720x1280 avatar video speaking the full narration, poll until it
 * completes, and download it to `outFile`. Returns the video duration in
 * seconds when HeyGen reports one.
 */
export async function renderAvatarVideo(cfg: HeygenConfig, narration: string, outFile: string): Promise<{ durationSec?: number }> {
  const character =
    cfg.avatarType === "talking_photo"
      ? { type: "talking_photo", talking_photo_id: cfg.avatarId }
      : { type: "avatar", avatar_id: cfg.avatarId, avatar_style: "normal" };

  const create = await heygenFetch(cfg, "/v2/video/generate", {
    method: "POST",
    body: JSON.stringify({
      video_inputs: [
        {
          character,
          voice: { type: "text", input_text: narration, voice_id: cfg.voiceId },
          background: { type: "color", value: "#f6f4ef" },
        },
      ],
      dimension: { width: 720, height: 1280 },
    }),
  });

  const videoId: string | undefined = create?.data?.video_id;
  if (!videoId) throw new Error(`HeyGen did not return a video_id: ${JSON.stringify(create)}`);
  console.log(`  HeyGen video queued: ${videoId}`);

  // Poll status (HeyGen renders typically take 1-5 minutes)
  const deadline = Date.now() + 20 * 60 * 1000;
  let videoUrl: string | undefined;
  let durationSec: number | undefined;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 8000));
    const status = await heygenFetch(cfg, `/v1/video_status.get?video_id=${videoId}`);
    const st = status?.data?.status;
    if (st === "completed") {
      videoUrl = status.data.video_url;
      durationSec = typeof status.data.duration === "number" ? status.data.duration : undefined;
      break;
    }
    if (st === "failed") throw new Error(`HeyGen render failed: ${JSON.stringify(status?.data?.error ?? status)}`);
    process.stdout.write(".");
  }
  if (!videoUrl) throw new Error("HeyGen render timed out after 20 minutes");
  console.log("\n  HeyGen render complete, downloading…");

  await mkdir(dirname(outFile), { recursive: true });
  const dl = await fetch(videoUrl);
  if (!dl.ok || !dl.body) throw new Error(`Failed to download HeyGen video: ${dl.status}`);
  await pipeline(Readable.fromWeb(dl.body as any), createWriteStream(outFile));
  return { durationSec };
}
