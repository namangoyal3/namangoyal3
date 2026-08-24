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
          // The source desaturates the pane for the first few frames of the cut.
          filter: frame < 6 ? 'grayscale(1) brightness(1.35)' : 'none',
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

  // The source holds two static framings and hard-cuts between them at f504;
  // there is no camera move inside either one.
  //   f472..f503  x=107..647  y=266..779
  //   f504..f552  x= 72..648  y=237..779
  const wide = frame >= 32;
  const view = wide
    ? {x: 72, y: 237, w: 576, h: 380}
    : {x: 107, y: 266, w: 540, h: 351};
  const cursorX = interpolate(frame, [0, 80], [0.22, 0.38], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }) * view.w;

  // Bar heights read off the source's chart; a few carry a red error base.
  const BARS: [number, number][] = [
    [0, 0], [26, 0], [16, 0], [52, 4], [0, 0], [62, 6], [30, 0], [8, 0],
    [34, 4], [22, 0], [48, 0], [12, 0], [44, 5], [0, 0], [58, 0], [10, 0],
  ];

  const pad = view.w / 576;
  const px = (n: number) => n * pad;

  return (
    <AbsoluteFill>
      <DarkBg />
      <div style={{position: 'absolute', left: view.x, top: view.y}}>
        <Window
          width={view.w}
          height={view.h}
          radius={12}
          bar="none"
          dark
          style={{background: '#0a0a0a', border: '1px solid #1c1c1c'}}
        >
          <div style={{padding: px(16), height: '100%', color: '#ededed'}}>
            <div style={{fontFamily: F.sans, fontSize: px(7), color: '#6b6b6b'}}>
              Edge Functions › my-api
            </div>

            <div style={{display: 'flex', alignItems: 'flex-start', marginTop: px(6)}}>
              <div>
                <div style={{fontFamily: F.sans, fontWeight: 500, fontSize: px(22), letterSpacing: '-0.02em'}}>
                  my-api
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: px(7), marginTop: px(5), fontFamily: F.sans, fontSize: px(8), color: '#8f8f8f'}}>
                  <span>https://secgprpeqhvdcnvzkomu.supabase.co/functions/v1/my-api</span>
                  <span>⧉</span>
                  <span>🕐</span>
                  <span style={{textDecoration: 'underline'}}>18 hours ago</span>
                </div>
              </div>
              <div style={{marginLeft: 'auto', display: 'flex', gap: px(6)}}>
                {['Docs', 'Download', 'Test'].map((t) => (
                  <span
                    key={t}
                    style={{
                      border: '1px solid #2a2a2a',
                      borderRadius: px(5),
                      padding: `${px(4)}px ${px(8)}px`,
                      fontFamily: F.sans,
                      fontSize: px(8),
                      color: '#d4d4d4',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div style={{display: 'flex', gap: px(20), marginTop: px(12), fontFamily: F.sans, fontSize: px(8.5), color: '#8f8f8f'}}>
              {['Overview', 'Invocations', 'Logs', 'Code', 'Settings'].map((t, i) => (
                <span
                  key={t}
                  style={{
                    color: i === 0 ? '#ededed' : undefined,
                    paddingBottom: px(5),
                    borderBottom: i === 0 ? '1.5px solid #ededed' : 'none',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div style={{borderTop: '1px solid #1c1c1c', marginTop: -1}} />

            <div style={{display: 'flex', alignItems: 'flex-start', marginTop: px(12)}}>
              {([
                ['TOTAL INVOCATIONS', '523', '#8f8f8f'],
                ['5XX RATE', '3.3%', '#e5484d'],
                ['4XX RATE', '0%', '#f5a524'],
              ] as const).map(([k, v, dot], i) => (
                <div key={k} style={{marginRight: px(26)}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: px(4), fontFamily: F.sans, fontSize: px(6.4), color: '#8f8f8f', letterSpacing: '0.06em'}}>
                    <span style={{width: px(4), height: px(4), borderRadius: px(2), background: dot, display: 'inline-block'}} />
                    {k} <span style={{opacity: 0.5}}>ⓘ</span>
                  </div>
                  <div style={{fontFamily: F.sans, fontSize: px(16), marginTop: px(3), color: i === 0 ? '#ededed' : '#ededed'}}>{v}</div>
                </div>
              ))}
              <div style={{marginLeft: 'auto', display: 'flex', border: '1px solid #2a2a2a', borderRadius: px(5), overflow: 'hidden'}}>
                {['15 min', '1 hour', '3 hours', '1 day'].map((t, i) => (
                  <span
                    key={t}
                    style={{
                      padding: `${px(4)}px ${px(8)}px`,
                      fontFamily: F.sans,
                      fontSize: px(7.5),
                      background: i === 0 ? '#ededed' : 'transparent',
                      color: i === 0 ? '#0a0a0a' : '#8f8f8f',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* invocation chart */}
            <div style={{position: 'relative', marginTop: px(14), height: px(84)}}>
              <div style={{display: 'flex', alignItems: 'flex-end', gap: px(9), height: '100%'}}>
                {BARS.map(([h, err], i) => (
                  <div key={i} style={{width: px(17), display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%'}}>
                    {h > 0 && (
                      <>
                        <div style={{height: px(h - err), background: '#3ecf8e', borderRadius: `${px(1)}px ${px(1)}px 0 0`}} />
                        {err > 0 && <div style={{height: px(err), background: '#e5484d'}} />}
                      </>
                    )}
                  </div>
                ))}
              </div>
              {/* hover tooltip, as in the source */}
              <div style={{position: 'absolute', left: px(150), top: px(2), fontFamily: F.sans, fontSize: px(7), color: '#ededed'}}>
                <div>Jul 24, 5:12:00pm</div>
                {([['Errors', '2', '#e5484d'], ['Warnings', '0', '#f5a524'], ['Ok', '80', '#3ecf8e']] as const).map(([k, v, c]) => (
                  <div key={k} style={{display: 'flex', alignItems: 'center', gap: px(4), marginTop: px(2)}}>
                    <span style={{width: px(5), height: px(5), background: c, display: 'inline-block'}} />
                    <span style={{color: '#c9c9c9'}}>{k}</span>
                    <span style={{marginLeft: px(24)}}>{v}</span>
                  </div>
                ))}
              </div>
              <svg width={px(12)} height={px(16)} viewBox="0 0 12 16" style={{position: 'absolute', left: cursorX, top: px(46)}}>
                <path d="M 1 1 L 1 13 L 4 10 L 6 15 L 8 14 L 6 9 L 10 9 Z" fill="#fff" stroke="#000" strokeWidth={0.8} />
              </svg>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: px(5), fontFamily: F.mono, fontSize: px(6.4), color: '#6b6b6b'}}>
              <span>Jul 24, 5:07:00pm</span>
              <span>Jul 24, 5:22:00pm</span>
            </div>

            {/* errors table */}
            <div style={{borderTop: '1px solid #1c1c1c', marginTop: px(12), paddingTop: px(11), display: 'flex', alignItems: 'center'}}>
              <span style={{fontFamily: F.sans, fontSize: px(11), color: '#ededed'}}>Errors in the last 24h</span>
              <span style={{marginLeft: 'auto', border: '1px solid #2a2a2a', borderRadius: px(5), padding: `${px(3)}px ${px(7)}px`, fontFamily: F.sans, fontSize: px(7.5), color: '#d4d4d4'}}>
                ⧉ View logs
              </span>
            </div>
            <div style={{marginTop: px(8), border: '1px solid #1c1c1c', borderRadius: px(6), overflow: 'hidden'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 8% 14% 10% 10% 12% 16%', padding: `${px(7)}px ${px(9)}px`, fontFamily: F.mono, fontSize: px(6), color: '#8f8f8f', letterSpacing: '0.1em', borderBottom: '1px solid #1c1c1c'}}>
                {['ERROR', 'COUNT', 'LAST SEEN', 'METHOD', 'STATUS', 'DURATION', 'TROUBLESHOOT'].map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 8% 14% 10% 10% 12% 16%', alignItems: 'center', padding: `${px(8)}px ${px(9)}px`, fontFamily: F.sans, fontSize: px(7.5), color: '#d4d4d4'}}>
                <span style={{fontFamily: F.mono, overflow: 'hidden', whiteSpace: 'nowrap'}}>
                  {'{"event":"workflow.failed","request_id":"1dc6814c-bf15-4e0…'}
                </span>
                <span>50</span>
                <span>2 minutes ago</span>
                <span>POST</span>
                <span>
                  <span style={{border: '1px solid #5c2326', color: '#e5484d', borderRadius: px(8), padding: `${px(1)}px ${px(5)}px`, fontSize: px(6.4)}}>500</span>
                </span>
                <span>358ms</span>
                <span style={{border: '1px solid #2a2a2a', borderRadius: px(5), padding: `${px(3)}px ${px(6)}px`, fontSize: px(6.8), textAlign: 'center'}}>
                  ◈ Ask Assistant
                </span>
              </div>
            </div>
          </div>
        </Window>
      </div>
    </AbsoluteFill>
  );
};
