import type { ScriptDoc, TimedWord, Timeline, TimelineSegment } from "../types";

const FPS = 30;
const WIDTH = 720;
const HEIGHT = 1280;

/** Average speaking rate used when no real audio alignment is available. */
const WORDS_PER_SEC = 2.6;
/** Breathing room appended to each segment (cut rhythm). */
const SEGMENT_PAD_SEC = 0.35;
/** Extra hold on slides that need a beat to land. */
const SLIDE_EXTRA: Record<string, number> = { kinetic: 0.2, cta: 1.2, repoCard: 0.3 };

export interface WordAligner {
  /** Returns word timings (seconds, absolute) for the full narration audio. */
  align(fullNarration: string): Promise<TimedWord[] | null>;
}

/**
 * Try word-level alignment with whisper.cpp if @remotion/install-whisper-cpp
 * is installed (optional dependency — see README). Returns null otherwise.
 */
export function whisperAligner(audioPath: string): WordAligner {
  return {
    async align(): Promise<TimedWord[] | null> {
      try {
        const mod: any = await import("@remotion/install-whisper-cpp" as string);
        const { installWhisperCpp, downloadWhisperModel, transcribe, toCaptions } = mod;
        const to = ".whisper";
        await installWhisperCpp({ to, version: "1.5.5" });
        await downloadWhisperModel({ model: "base.en", folder: to });
        const { transcription } = await transcribe({
          inputPath: audioPath,
          whisperPath: to,
          model: "base.en",
          tokenLevelTimestamps: true,
        });
        const { captions } = toCaptions({ whisperCppOutput: transcription });
        return captions.map((c: any) => ({
          text: String(c.text).trim(),
          start: c.startMs / 1000,
          end: c.endMs / 1000,
        }));
      } catch (err) {
        console.warn(`  whisper alignment unavailable (${(err as Error).message}); falling back to estimated timing`);
        return null;
      }
    },
  };
}

function splitWords(narration: string): string[] {
  return narration.split(/\s+/).filter(Boolean);
}

/**
 * Group words into caption "beats" of 1-2 words (matching the reference
 * video's karaoke rhythm) without breaking quoted phrases.
 */
function groupBeats(words: TimedWord[]): TimedWord[] {
  const beats: TimedWord[] = [];
  let i = 0;
  while (i < words.length) {
    const w = words[i];
    const next = words[i + 1];
    const shouldPair = next && (w.text.length <= 4 || next.text.length <= 3) && w.text.length + next.text.length <= 12;
    if (shouldPair) {
      beats.push({ text: `${w.text} ${next.text}`, start: w.start, end: next.end });
      i += 2;
    } else {
      beats.push(w);
      i += 1;
    }
  }
  return beats;
}

/**
 * Build the render timeline. When `aligned` word timings exist (from whisper
 * over the HeyGen audio) they drive both captions and segment boundaries;
 * otherwise everything is estimated at WORDS_PER_SEC and, if HeyGen reported
 * a total duration, scaled to match it.
 */
export function buildTimeline(script: ScriptDoc, opts: { avatarSrc?: string; aligned?: TimedWord[] | null; totalDurationSec?: number }): Timeline {
  const perSegmentWords = script.segments.map((s) => splitWords(s.narration));
  const totalWords = perSegmentWords.reduce((a, w) => a + w.length, 0);

  let segments: TimelineSegment[];

  if (opts.aligned && opts.aligned.length >= totalWords * 0.8) {
    // Distribute the aligned word stream over segments by word count.
    const stream = [...opts.aligned];
    let cursor = 0;
    segments = script.segments.map((seg, idx) => {
      const n = perSegmentWords[idx].length;
      const take = stream.slice(cursor, cursor + n);
      cursor += n;
      const start = take[0]?.start ?? (idx === 0 ? 0 : 0);
      const end = take[take.length - 1]?.end ?? start + 1;
      // Use the script's own words (aligned text can differ slightly)
      const words = perSegmentWords[idx].map((text, i) => ({
        text,
        start: take[i]?.start ?? start,
        end: take[i]?.end ?? end,
      }));
      return { ...seg, start, end, words: groupBeats(words) };
    });
    // Extend each segment to meet the next (no gaps while the voice runs on)
    for (let i = 0; i < segments.length - 1; i++) segments[i].end = Math.max(segments[i].end, segments[i + 1].start);
    if (opts.totalDurationSec) segments[segments.length - 1].end = Math.max(segments[segments.length - 1].end, opts.totalDurationSec);
  } else {
    // Estimated timing
    let t = 0;
    segments = script.segments.map((seg, idx) => {
      const ws = perSegmentWords[idx];
      const speech = ws.length / WORDS_PER_SEC;
      const extra = seg.slide ? (SLIDE_EXTRA[seg.slide.kind] ?? 0) : 0;
      const dur = Math.max(1.2, speech + SEGMENT_PAD_SEC + extra);
      const words: TimedWord[] = ws.map((text, i) => ({
        text,
        start: t + (i / WORDS_PER_SEC),
        end: t + ((i + 1) / WORDS_PER_SEC),
      }));
      const s: TimelineSegment = { ...seg, start: t, end: t + dur, words: groupBeats(words) };
      t += dur;
      return s;
    });
    // If HeyGen told us the real audio length, scale everything to match it.
    if (opts.totalDurationSec && t > 0) {
      const k = opts.totalDurationSec / t;
      for (const s of segments) {
        s.start *= k;
        s.end *= k;
        for (const w of s.words) {
          w.start *= k;
          w.end *= k;
        }
      }
    }
  }

  const durationSec = segments[segments.length - 1].end + 0.4;
  return {
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    durationInFrames: Math.ceil(durationSec * FPS),
    avatarSrc: opts.avatarSrc,
    segments,
  };
}
