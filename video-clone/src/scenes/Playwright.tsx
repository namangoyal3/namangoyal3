import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {TalkingHead} from '../components/AvatarPlaceholder';
import {BlurredDeskBg, LeafWallBg} from '../components/Backdrops';
import {Cursor, Window} from '../components/Chrome';
import {PixelCrab} from '../components/Icons';

/**
 * Scene 4 (f170–240). A beige illustration panel where a monitor turns into a
 * browser window that gets dragged open, then the whole panel tips away.
 */
export const OpenBrowser: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Panel tips and slides left over the final beat, matching the source.
  const tip = interpolate(frame, [46, 62], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // The browser window slides out from behind the panel's left edge.
  const open = spring({frame: frame - 12, fps, config: {damping: 18, mass: 0.9}});
  const winW = interpolate(open, [0, 1], [0, 434]);
  const cursorX = interpolate(open, [0, 1], [396, 528]);

  return (
    <AbsoluteFill>
      <LeafWallBg />
      <div
        style={{
          position: 'absolute',
          left: 74 - tip * 10,
          top: 199 + tip * 34,
          width: 574,
          height: 325,
          borderRadius: 30,
          background: C.panelBeige,
          boxShadow: '0 24px 50px rgba(90,90,90,0.22)',
          transform: `rotate(${tip * -4}deg)`,
          overflow: 'hidden',
        }}
      >
        {/* the monitor drawing that the browser replaces */}
        <svg
          width={574}
          height={325}
          viewBox="0 0 574 325"
          style={{position: 'absolute', inset: 0, opacity: 1 - Math.min(open * 3, 1)}}
        >
          <rect x={172} y={70} width={230} height={158} rx={8} fill={C.paper} />
          <path
            d="M 232 240 L 342 240 L 366 272 L 208 272 Z"
            fill="none"
            stroke={C.ink}
            strokeWidth={5}
          />
        </svg>

        {/* browser window being pulled open */}
        <div
          style={{
            position: 'absolute',
            left: 14,
            top: 36,
            width: winW,
            height: 254,
            borderRadius: 12,
            background: C.paper,
            overflow: 'hidden',
            boxShadow: '0 10px 24px rgba(0,0,0,0.16)',
          }}
        >
          <div
            style={{
              height: 44,
              background: '#26262a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 9,
              paddingRight: 12,
            }}
          >
            {['#6c6c72', C.claudeOrange, '#6c6c72', '#8f8f96'].map((c, i) => (
              <span
                key={i}
                style={{width: 11, height: 11, borderRadius: 6, background: c}}
              />
            ))}
          </div>
        </div>
      </div>

      <Cursor
        size={78}
        style={{
          position: 'absolute',
          left: cursorX,
          top: 214,
          opacity: interpolate(frame, [40, 50], [1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />

      <TalkingHead cardTop={804} tone="light" />
    </AbsoluteFill>
  );
};

/**
 * Scene 5 (f241–295). White field. The crab walks up to a browser mockup,
 * pushes it, then a camera pops out and fires off two screenshots.
 */
export const Screenshot: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const crabIn = spring({frame, fps, config: {damping: 15, mass: 0.6}});
  const camIn = spring({frame: frame - 22, fps, config: {damping: 13, mass: 0.5}});
  const shot1 = spring({frame: frame - 30, fps, config: {damping: 14, mass: 0.6}});
  const shot2 = spring({frame: frame - 36, fps, config: {damping: 14, mass: 0.6}});
  const nudge = interpolate(frame, [12, 20], [0, 10], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: C.white}}>
      {/* browser mockup */}
      <div
        style={{
          position: 'absolute',
          left: 226 + nudge,
          top: 380,
          width: 386,
          height: 210,
          borderRadius: 10,
          background: '#fbf8f3',
          boxShadow: '0 18px 40px rgba(0,0,0,0.10)',
          overflow: 'hidden',
        }}
      >
        <div style={{height: 20, background: '#efece6', display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 8}}>
          {['#e06c60', '#e3b34e', '#69b95c'].map((c) => (
            <span key={c} style={{width: 6, height: 6, borderRadius: 3, background: c}} />
          ))}
          <div style={{marginLeft: 10, height: 7, width: 200, borderRadius: 4, background: '#e2ded6'}} />
        </div>
        <div style={{padding: 14}}>
          <div style={{height: 8, width: 74, borderRadius: 4, background: C.claudeOrange}} />
          <div style={{height: 7, width: 210, borderRadius: 4, background: '#ded9d0', marginTop: 10}} />
          <div style={{height: 7, width: 168, borderRadius: 4, background: '#e6e1d8', marginTop: 7}} />
          <div style={{height: 7, width: 190, borderRadius: 4, background: '#e6e1d8', marginTop: 7}} />
          <div style={{height: 14, width: 58, borderRadius: 5, background: C.claudeOrange, marginTop: 14}} />
          <div style={{height: 44, width: 288, borderRadius: 6, background: '#eeeae2', marginTop: 16}} />
        </div>
      </div>

      {/* crab */}
      <div
        style={{
          position: 'absolute',
          left: 34,
          top: 519,
          transform: `scale(${crabIn})`,
          transformOrigin: 'bottom center',
        }}
      >
        <PixelCrab size={138} />
      </div>

      {/* pushing hand */}
      <div
        style={{
          position: 'absolute',
          left: 166,
          top: 556,
          opacity: interpolate(frame, [10, 14, 20, 24], [0, 1, 1, 0]),
          fontSize: 34,
        }}
      >
        <svg width={34} height={34} viewBox="0 0 34 34">
          <rect x={4} y={8} width={26} height={20} rx={9} fill="#c9c4bb" />
        </svg>
      </div>

      {/* camera */}
      <div
        style={{
          position: 'absolute',
          left: 158,
          top: 496,
          transform: `scale(${camIn}) rotate(${(1 - camIn) * -20}deg)`,
          opacity: camIn,
        }}
      >
        <svg width={78} height={60} viewBox="0 0 62 48">
          <rect x={0} y={8} width={62} height={38} rx={6} fill="#1d1d1f" />
          <rect x={16} y={0} width={22} height={10} rx={3} fill="#1d1d1f" />
          <circle cx={31} cy={27} r={12} fill="#3a3a3d" />
          <circle cx={31} cy={27} r={6} fill="#0c0c0d" />
          <circle cx={52} cy={16} r={3} fill={C.claudeOrange} />
        </svg>
      </div>

      {/* the screenshots that pop out */}
      {[
        {s: shot1, x: 176, y: 566, r: -9, w: 104},
        {s: shot2, x: 236, y: 586, r: 6, w: 96},
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.w,
            height: p.w * 0.66,
            background: '#fdfbf7',
            border: '1px solid #e8e3da',
            borderRadius: 3,
            boxShadow: '0 6px 16px rgba(0,0,0,0.10)',
            transform: `scale(${p.s}) rotate(${p.r}deg)`,
            opacity: p.s,
            padding: 7,
          }}
        >
          <div style={{height: 4, width: '54%', background: C.claudeOrange, borderRadius: 2}} />
          <div style={{height: 3, width: '84%', background: '#e0dbd2', borderRadius: 2, marginTop: 5}} />
          <div style={{height: 3, width: '70%', background: '#e0dbd2', borderRadius: 2, marginTop: 4}} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

/**
 * Scene 6 (f296–361). A screenshot of a checkout page with the dev console
 * open, floating over a blurred desk photo. It zooms in slowly, then an orange
 * frame snaps around it.
 */
export const ConsoleErrors: React.FC = () => {
  const frame = useCurrentFrame();

  const zoom = interpolate(frame, [0, 65], [1.05, 1.78], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const framed = frame >= 14;

  return (
    <AbsoluteFill>
      <BlurredDeskBg />
      <div
        style={{
          position: 'absolute',
          left: 360,
          top: 400,
          transform: `translate(-50%,-50%) scale(${zoom}) rotate(-1.6deg)`,
        }}
      >
        <Window
          width={584}
          height={364}
          dark={false}
          radius={12}
          bar="browser"
          url="filmfriends.app/checkout"
          accentBorder={framed ? C.claudeOrange : undefined}
        >
          <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            <div style={{display: 'flex', flex: 1, minHeight: 0}}>
              {/* left: the agent's own preview notes */}
              <div style={{width: 150, background: '#f7f5f1', padding: 8, fontFamily: F.sans, fontSize: 5.6, color: '#5c574f', lineHeight: 1.7}}>
                <div style={{fontWeight: 700, color: '#221f1a'}}>Preview screenshot</div>
                <div style={{marginTop: 5}}>
                  Checkout form rendering — name, email address fields, order summary
                  sidebar. Looks right. Fill form is failing.
                </div>
                <div style={{marginTop: 6, color: '#8a857c'}}>› localhost:3000/checkout</div>
                <div style={{marginTop: 6}}>
                  Checkout broken right-column — text/checkout button not actually giving
                  me a return. Let me check the console before wrapping up.
                </div>
                <div style={{marginTop: 8, height: 9, width: 62, borderRadius: 3, background: C.claudeOrange}} />
              </div>

              {/* centre: the page under test */}
              <div style={{flex: 1, background: '#0b0b0b', padding: 12}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                  <span style={{color: '#fff', fontFamily: F.sans, fontWeight: 800, fontSize: 8}}>
                    FILM FRIENDS
                  </span>
                  <span style={{marginLeft: 'auto', display: 'flex', gap: 7, color: '#8d8d8d', fontFamily: F.sans, fontSize: 5}}>
                    {['HOME', 'ABOUT', 'COMMUNITY', 'JOURNAL'].map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                    <span style={{background: '#fff', color: '#000', padding: '2px 6px', borderRadius: 8}}>
                      SUBSCRIBE
                    </span>
                  </span>
                </div>
                <div style={{color: '#fff', fontFamily: F.sans, fontWeight: 800, fontSize: 20, marginTop: 20}}>
                  CHECKOUT
                </div>
                <div style={{display: 'flex', gap: 14, marginTop: 16}}>
                  <div style={{flex: 1}}>
                    <div style={{color: '#8d8d8d', fontFamily: F.sans, fontSize: 5.4, letterSpacing: '0.16em'}}>
                      SHIPPING INFORMATION
                    </div>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{height: 13, background: '#171717', borderRadius: 2, marginTop: 6}} />
                    ))}
                  </div>
                  <div style={{width: 130}}>
                    <div style={{color: '#8d8d8d', fontFamily: F.sans, fontSize: 5.4, letterSpacing: '0.16em'}}>
                      ORDER SUMMARY
                    </div>
                    <div style={{display: 'flex', gap: 6, marginTop: 6}}>
                      <div style={{width: 22, height: 28, background: '#242424', borderRadius: 2}} />
                      <div style={{flex: 1}}>
                        <div style={{height: 5, background: '#242424', borderRadius: 2}} />
                        <div style={{height: 5, background: '#1c1c1c', borderRadius: 2, marginTop: 4, width: '60%'}} />
                      </div>
                      <span style={{color: '#fff', fontFamily: F.sans, fontSize: 6}}>$4.99</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* bottom: the console, where the errors surface */}
            <div style={{height: 118, background: '#fbfbfb', padding: 8, fontFamily: F.mono, fontSize: 5.4, color: '#333'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, color: '#777'}}>
                <span>🔍 Search</span>
                <span style={{marginLeft: 'auto'}}>All  Errors 2  Warnings 1  Info</span>
              </div>
              <div style={{marginTop: 5, display: 'flex', gap: 8}}>
                <div style={{width: 26, paddingTop: 12}}>
                  <PixelCrab size={22} />
                </div>
                <div style={{flex: 1}}>
                  <div style={{color: '#946c00'}}>
                    ▲ Warning: Each child in a list should have a unique "key" prop.
                    {'\n'}   at CheckoutForm
                  </div>
                  <div style={{marginTop: 4, color: '#555'}}>
                    • Image with src "/photos/00036/01.15…" was detected as the Largest
                    {'\n'}  Contentful Paint (LCP). Please add the "priority" property.
                  </div>
                  <div style={{marginTop: 4, color: '#c0392b'}}>
                    Unhandled Runtime Error
                    {'\n'}TypeError: Cannot read properties of undefined (reading 'items')
                    {'\n'}   at CartContext (checkout/page.tsx:24)
                    {'\n'}   at HTMLButtonElement.onClick (checkout/page.tsx:31)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Window>
      </div>
    </AbsoluteFill>
  );
};
