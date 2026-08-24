import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {TalkingHead} from '../components/AvatarPlaceholder';
import {DarkBg, LeafWallBg} from '../components/Backdrops';
import {CodeBody, Window} from '../components/Chrome';

/**
 * Scene 8 (f414–471). A code pane on the wall backdrop types out a Supabase
 * realtime subscription, line by line, and pushes a file sidebar in at the end.
 */
const REALTIME = [
  {t: "supabase.channel('team-inbox')", c: '#9ecbff'},
  {t: '  .on(', c: '#c9d5e2'},
  {t: "    'postgres_changes',", c: '#a5d6a7'},
  {t: '    {', c: '#c9d5e2'},
  {t: "      event: '*',", c: '#ffab70'},
  {t: "      schema: 'public',", c: '#ffab70'},
  {t: "      table: 'tickets',", c: '#ffab70'},
  {t: '      // Chain multiple filters', c: '#5f6b7a'},
  {t: "      filter: 'status=eq.open,tea'", c: '#ffab70'},
];

export const RealtimeCode: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = spring({frame, fps, config: {damping: 16, mass: 0.7}});
  const shown = Math.min(
    REALTIME.length,
    Math.max(1, Math.round(interpolate(frame, [4, 44], [1, REALTIME.length])))
  );
  // A file sidebar slides in for the last beat of the shot.
  const sidebar = interpolate(frame, [40, 50], [0, 150], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <LeafWallBg />
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 199,
          transform: `scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
          opacity: enter,
          filter: frame < 6 ? 'grayscale(1) brightness(1.4)' : 'none',
        }}
      >
        <Window width={576} height={325} radius={18} bar="mac" url="realtime.ts">
          <div style={{display: 'flex', height: '100%'}}>
            <div
              style={{
                width: sidebar,
                background: '#0b0f15',
                borderRight: sidebar > 2 ? '1px solid #1d232c' : 'none',
                padding: sidebar > 2 ? 8 : 0,
                overflow: 'hidden',
                fontFamily: F.mono,
                fontSize: 11,
                color: '#5f6b7a',
                whiteSpace: 'nowrap',
              }}
            >
              {['src', '  realtime.ts', '  client.ts', 'supabase', '  schema.sql'].map((t) => (
                <div key={t}>{t}</div>
              ))}
            </div>
            <div style={{flex: 1}}>
              <CodeBody
                lines={REALTIME.slice(0, shown)}
                fontSize={13}
                gutter
                caretLine={shown - 1}
              />
            </div>
          </div>
        </Window>
      </div>
      <TalkingHead cardTop={804} tone="light" />
    </AbsoluteFill>
  );
};

/**
 * Scene 9 (f472–552). The Supabase dashboard shot: a dark screen recording
 * that starts small and tilted, straightens out, and scrolls its bar chart.
 */
export const SupabaseDash: React.FC = () => {
  const frame = useCurrentFrame();

  const settle = interpolate(frame, [0, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rotate = interpolate(settle, [0, 1], [-7, 0]);
  const scale = interpolate(settle, [0, 1], [0.72, 1]);
  const y = interpolate(settle, [0, 1], [-38, 0]);
  const cursorX = interpolate(frame, [26, 80], [128, 216], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bars = [22, 14, 30, 12, 46, 26, 34, 20, 40, 28, 52, 18, 36, 24, 44];

  return (
    <AbsoluteFill>
      <DarkBg />
      <div
        style={{
          position: 'absolute',
          left: 360,
          top: 427,
          transform: `translate(-50%,-50%) translateY(${y}px) rotate(${rotate}deg) scale(${scale})`,
        }}
      >
        <Window width={576} height={380} radius={14} bar="browser" url="supabase.com/dashboard/project/my-api">
          <div style={{padding: 14, background: '#12161d', height: '100%'}}>
            <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 13, color: '#e6edf3'}}>
              my-api
            </div>
            <div style={{fontFamily: F.mono, fontSize: 6.5, color: '#6e7781', marginTop: 3}}>
              https://xecgpvpeqhsbcmvbdmu.supabase.co/functions/v1/my-api · 18 hours ago
            </div>
            <div style={{display: 'flex', gap: 16, marginTop: 10, fontFamily: F.sans, fontSize: 7, color: '#8b949e'}}>
              {['Overview', 'Invocations', 'Logs', 'Code', 'Settings'].map((t, i) => (
                <span key={t} style={{color: i === 0 ? '#e6edf3' : undefined, borderBottom: i === 0 ? '1px solid #3ecf8e' : 'none', paddingBottom: 3}}>
                  {t}
                </span>
              ))}
            </div>
            <div style={{display: 'flex', gap: 34, marginTop: 12}}>
              {[
                ['TOTAL INVOCATIONS', '523'],
                ['ERROR RATE', '3.3%'],
                ['404 RATE', '0%'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{fontFamily: F.sans, fontSize: 5.6, color: '#6e7781', letterSpacing: '0.1em'}}>
                    ◆ {k}
                  </div>
                  <div style={{fontFamily: F.sans, fontSize: 13, color: '#e6edf3', marginTop: 2}}>{v}</div>
                </div>
              ))}
              <div style={{marginLeft: 'auto', display: 'flex', gap: 4}}>
                {['15 min', '1 hour', '3 hours', '1 day'].map((t, i) => (
                  <span
                    key={t}
                    style={{
                      fontFamily: F.sans,
                      fontSize: 6,
                      padding: '3px 6px',
                      borderRadius: 4,
                      background: i === 0 ? '#21262d' : 'transparent',
                      color: i === 0 ? '#e6edf3' : '#6e7781',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 84, marginTop: 16, paddingLeft: 6}}>
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 15,
                    height: h + Math.sin((frame + i * 4) / 9) * 2,
                    background: C.supabaseGreen,
                    borderRadius: 1,
                  }}
                />
              ))}
            </div>

            <div style={{borderTop: '1px solid #21262d', marginTop: 14, paddingTop: 8}}>
              <div style={{fontFamily: F.sans, fontSize: 8, color: '#e6edf3'}}>Errors in the last 24h</div>
              <div style={{display: 'flex', gap: 20, marginTop: 6, fontFamily: F.sans, fontSize: 5.4, color: '#6e7781', letterSpacing: '0.08em'}}>
                {['ERROR', 'COUNT', 'LAST SEEN', 'METHOD', 'STATUS', 'DURATION', 'TRACEABLE'].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div style={{display: 'flex', gap: 20, marginTop: 6, fontFamily: F.mono, fontSize: 5.4, color: '#8b949e'}}>
                <span>{'{"event":"workflow.failed","request_id":"6b4874c-bf70-4e0..."}'}</span>
                <span>30</span>
                <span>2 minutes ago</span>
                <span>POST</span>
                <span style={{color: '#f85149'}}>500</span>
                <span>359ms</span>
              </div>
            </div>
          </div>
          {/* mouse pointer moving over the chart */}
          <svg width={12} height={16} viewBox="0 0 12 16" style={{position: 'absolute', left: cursorX, top: 196}}>
            <path d="M 1 1 L 1 13 L 4 10 L 6 15 L 8 14 L 6 9 L 10 9 Z" fill="#fff" stroke="#000" strokeWidth={0.8} />
          </svg>
        </Window>
      </div>
    </AbsoluteFill>
  );
};
