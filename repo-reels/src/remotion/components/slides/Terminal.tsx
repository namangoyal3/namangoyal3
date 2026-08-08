import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { PixelMascot } from "./shared";

// ---------------------------------------------------------------------------
// 8. Terminal window — macOS chrome, typed lines, pixel mascot perched on top
//    Matched against reference frames f_001/f_002 (chrome, mascot, cursor),
//    f_012 (footer hint line) and f_025 (dim status label in the title bar).
// ---------------------------------------------------------------------------

const WIN_W = 565;
const MASCOT_W = 148;
const MASCOT_H = (MASCOT_W / 12) * 7;

const CheckGlyph: React.FC<{ color: string }> = ({ color }) => (
  <svg width={13} height={13} viewBox="0 0 14 14" style={{ display: "inline-block", verticalAlign: "-1px", marginRight: 7 }}>
    <polyline points="2,7.5 5.5,11 12,3" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Cursor: React.FC<{ opacity: number }> = ({ opacity }) => (
  <span
    style={{
      display: "inline-block",
      width: 9,
      height: 16,
      background: theme.clay,
      transform: "translateY(3px)",
      marginLeft: 2,
      opacity,
    }}
  />
);

export const Terminal: React.FC<{ title: string; lines: string[] }> = ({ title, lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // window rises softly into place
  const rise = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 14 });
  // mascot idle bob (deterministic)
  const bob = Math.sin(frame / 11) * 1.3;

  const totalChars = lines.reduce((a, l) => a + l.length + 1, 0);
  const typeStart = 8;
  const typeDur = Math.max(18, Math.min(fps * 2.7, totalChars * 0.85));
  const charsShown = Math.floor(
    interpolate(frame, [typeStart, typeStart + typeDur], [0, totalChars], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const doneTyping = charsShown >= totalChars;
  const blinkOn = Math.floor(frame / (fps * 0.42)) % 2 === 0;

  let budget = charsShown;
  const rendered = lines.map((raw, i) => {
    const before = budget;
    const take = Math.max(0, Math.min(raw.length, budget));
    budget -= raw.length + 1;
    if (before < 0) return null; // not reached yet
    const typingHere = before >= 0 && take < raw.length;
    const shown = raw.slice(0, take);

    const isCmd = raw.startsWith("$");
    const isOk = raw.startsWith("✓");
    let content: React.ReactNode;
    if (isCmd) {
      content = (
        <>
          <span style={{ color: theme.clay }}>$</span>
          <span style={{ color: "#EAEAEE" }}>{shown.slice(1)}</span>
        </>
      );
    } else if (isOk) {
      content = (
        <>
          <CheckGlyph color="#7EC98F" />
          <span style={{ color: "#7EC98F" }}>{shown.slice(1).replace(/^\s/, "")}</span>
        </>
      );
    } else {
      content = <span style={{ color: "#9A9AA6" }}>{shown}</span>;
    }
    return (
      <div key={i} style={{ fontFamily: theme.mono, fontSize: 15, lineHeight: "27px", whiteSpace: "pre-wrap" }}>
        {content}
        {typingHere ? <Cursor opacity={1} /> : null}
      </div>
    );
  });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.cream, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          width: WIN_W,
          opacity: rise,
          transform: `translateY(${-64 + (1 - rise) * 30}px)`,
        }}
      >
        {/* mascot perched on the window's top edge */}
        <div
          style={{
            position: "absolute",
            top: -MASCOT_H + 3,
            left: "50%",
            transform: `translateX(-50%) translateY(${bob}px)`,
          }}
        >
          <PixelMascot size={MASCOT_W} />
        </div>

        {/* window */}
        <div
          style={{
            position: "relative",
            background: "#131317",
            borderRadius: 13,
            overflow: "hidden",
            boxShadow: "0 30px 70px rgba(20,14,6,0.35), 0 8px 22px rgba(20,14,6,0.18)",
          }}
        >
          {/* title bar */}
          <div
            style={{
              position: "relative",
              height: 34,
              display: "flex",
              alignItems: "center",
              background: "#1D1D22",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", gap: 7, marginLeft: 14 }}>
              {["#FF5F57", "#FEBC2E", "#29C740"].map((c) => (
                <span key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                pointerEvents: "none",
              }}
            >
              <svg width={13} height={11} viewBox="0 0 13 11" style={{ display: "block" }}>
                <path d="M0.5 2.2 Q0.5 1 1.7 1 H4.8 L5.9 2.3 H11.3 Q12.5 2.3 12.5 3.5 V8.8 Q12.5 10 11.3 10 H1.7 Q0.5 10 0.5 8.8 Z" fill="#4E9BD5" />
              </svg>
              <span
                style={{
                  fontFamily: theme.mono,
                  fontSize: 11.5,
                  color: "#8C8C94",
                  letterSpacing: 0.3,
                  maxWidth: 300,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {title.trim() || "Claude Code"}
              </span>
            </div>
            {!doneTyping ? (
              <div style={{ position: "absolute", right: 14, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: theme.clay, opacity: blinkOn ? 1 : 0.35 }} />
                <span style={{ fontFamily: theme.mono, fontSize: 10.5, color: "#77777F" }}>running…</span>
              </div>
            ) : null}
          </div>

          {/* typed lines */}
          <div style={{ padding: "18px 22px 14px", minHeight: 150 }}>{rendered}</div>

          {/* input row */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <svg width={10} height={12} viewBox="0 0 10 12" style={{ display: "block" }}>
              <path d="M1.5 1.5 L8 6 L1.5 10.5" fill="none" stroke={theme.clay} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Cursor opacity={doneTyping ? (blinkOn ? 1 : 0.15) : 0.3} />
          </div>

          {/* dim footer hint — f_012 */}
          <div
            style={{
              padding: "8px 18px 12px",
              fontFamily: theme.mono,
              fontSize: 11.5,
              letterSpacing: 0.2,
              color: "#68686F",
            }}
          >
            enter to open · space to reply · ctrl+x to delete
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
