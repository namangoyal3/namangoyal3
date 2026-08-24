import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import './fonts';
import {C} from './theme';
import {SCENES, SceneId} from './data/timeline';
import {CaptionLayer} from './components/Caption';
import {TitleCard} from './components/TitleCard';
import {
  CodeDocsIcon,
  Context7Mark,
  PlaywrightMasks,
  SkillUiMark,
  StrixMark,
  SupabaseMark,
  Squircle,
} from './components/Icons';
import {Intro} from './scenes/Intro';
import {Installer} from './scenes/Installer';
import {ConsoleErrors, OpenBrowser, Screenshot} from './scenes/Playwright';
import {RealtimeCode, SupabaseDash} from './scenes/Supabase';
import {StrixAttack, StrixFindings} from './scenes/Strix';
import {ClaudeMd, RampBroll, SkillUiReverse, SkillUiTerminal} from './scenes/SkillUi';
import {CloseUp, Context7Page, Context7Table, Outro} from './scenes/Context7';
import {F} from './theme';

const TitlePlaywright = () => (
  <TitleCard
    ordinal="THE FIRST"
    name="PLAYWRIGHT CLI"
    ordinalTop={250}
    iconTop={306}
    iconSize={356}
    icon={(size) => (
      <Squircle size={size} fill="#fbfbfb">
        <PlaywrightMasks size={size * 0.58} />
      </Squircle>
    )}
  />
);

const TitleSupabase = () => (
  <TitleCard
    ordinal="THE SECOND"
    name="SUPABASE"
    ordinalTop={302}
    iconTop={366}
    iconSize={342}
    icon={(size) => (
      <Squircle size={size} fill="#ffffff">
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <SupabaseMark size={size * 0.14} />
          <span
            style={{
              fontFamily: F.sans,
              fontWeight: 700,
              fontSize: size * 0.132,
              color: '#11181c',
              letterSpacing: '-0.03em',
            }}
          >
            supabase
          </span>
        </div>
      </Squircle>
    )}
  />
);

const TitleStrix = () => (
  <TitleCard
    ordinal="THE THIRD"
    name="STRIX"
    ordinalTop={314}
    iconTop={382}
    iconSize={378}
    icon={(size) => (
      <Squircle size={size} fill="#050505">
        <StrixMark size={size * 0.47} />
      </Squircle>
    )}
  />
);

const TitleSkillUi = () => (
  <TitleCard
    ordinal="THE FORTH"
    name="SKILL UI"
    ordinalTop={314}
    iconTop={380}
    iconSize={372}
    icon={(size) => (
      <Squircle size={size} fill="#0d0d0d">
        <SkillUiMark size={size * 0.72} />
      </Squircle>
    )}
  />
);

const TitleContext7 = () => (
  <TitleCard
    ordinal="THE FIFTH"
    name="CONTEXT7"
    ordinalTop={316}
    iconTop={384}
    iconSize={362}
    white
    icon={(size) => (
      <Squircle size={size} fill={C.context7Green} shadow={false}>
        <Context7Mark size={size * 0.52} />
      </Squircle>
    )}
  />
);

const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  intro: Intro,
  installer: Installer,
  titlePlaywright: TitlePlaywright,
  openBrowser: OpenBrowser,
  screenshot: Screenshot,
  consoleErrors: ConsoleErrors,
  titleSupabase: TitleSupabase,
  realtimeCode: RealtimeCode,
  supabaseDash: SupabaseDash,
  titleStrix: TitleStrix,
  strixAttack: StrixAttack,
  strixFindings: StrixFindings,
  titleSkillUi: TitleSkillUi,
  skillUiTerminal: SkillUiTerminal,
  skillUiReverse: SkillUiReverse,
  claudeMd: ClaudeMd,
  rampBroll: RampBroll,
  titleContext7: TitleContext7,
  context7Table: Context7Table,
  closeUp: CloseUp,
  context7Page: Context7Page,
  outro: Outro,
};

/**
 * The clone. Scenes are laid out on the source's own cut list; the caption
 * track is a single layer above them so word timing is unaffected by cuts.
 */
export const VideoClone: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => (
  <AbsoluteFill style={{background: C.black}}>
    {SCENES.map((s) => {
      const Comp = SCENE_COMPONENTS[s.id];
      return (
        <Sequence
          key={s.id}
          from={s.from}
          durationInFrames={s.durationInFrames}
          name={s.id}
          layout="none"
        >
          <Comp />
        </Sequence>
      );
    })}

    <CaptionLayer />

    {withAudio && <Audio src={staticFile('audio.m4a')} />}
  </AbsoluteFill>
);
