import React from 'react';
import {Composition} from 'remotion';
import {DURATION, FPS, HEIGHT, WIDTH} from './data/timeline';
import {VideoClone} from './Video';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="VideoClone"
      component={VideoClone}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{withAudio: true}}
    />
    {/* Silent variant, used by the frame-comparison tooling. */}
    <Composition
      id="VideoCloneSilent"
      component={VideoClone}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{withAudio: false}}
    />
  </>
);
