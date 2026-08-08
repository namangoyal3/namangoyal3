// Shared data model for the pipeline and the Remotion composition.
// The reference-video vocabulary (slide kinds, caption styles) is documented
// in docs/VIDEO_ANATOMY.md.

export interface RepoFacts {
  fullName: string; // "owner/name"
  name: string;
  url: string;
  description: string;
  stars: number;
  forks: number;
  language: string | null;
  license: string | null;
  version: string | null;
  topics: string[];
  /** One-line hook for the repo card, e.g. "He says nothing. He writes one line. It works." */
  tagline: string;
  /** Proof points for the metrics strip, e.g. "~54% less code" */
  metrics: string[];
}

export type SlideKind =
  | "kinetic" // big italic serif words on cream ("FIRST IS", "CODE REVIEW")
  | "repoCard" // dark GitHub-style repo showcase card
  | "starHistory" // animated star-history line chart
  | "statBars" // grouped bar chart + big headline ("↓ 50% ↓")
  | "installer" // progress-bar "installer" card
  | "fileTree" // file listing with highlight sweep
  | "graph" // knowledge-graph nodes lighting up
  | "terminal" // dark terminal window with typed lines + pixel mascot
  | "cta"; // outro call-to-action lockup

export interface SlideSpec {
  kind: SlideKind;
  props: Record<string, unknown>;
}

export type Shot = "avatar" | "slide";
export type CaptionStyle = "sans" | "serif";

export interface Segment {
  id: string;
  /** The words spoken during this segment (verbatim narration). */
  narration: string;
  shot: Shot;
  slide?: SlideSpec;
  captionStyle: CaptionStyle;
  /** For avatar shots: alternate crop level for cut-rhythm. */
  avatarCrop?: "medium" | "close";
  /** For slide shots: show the talking head in a rounded card at the bottom. */
  avatarBelow?: boolean;
}

export interface ScriptDoc {
  title: string;
  repos: RepoFacts[];
  segments: Segment[];
}

export interface TimedWord {
  text: string;
  /** seconds from video start */
  start: number;
  end: number;
}

export interface TimelineSegment extends Segment {
  /** seconds */
  start: number;
  end: number;
  /** caption beats (1-2 words each), absolute times */
  words: TimedWord[];
}

export interface Timeline {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  /** Path (relative to public/) of the HeyGen avatar video; absent in mock mode. */
  avatarSrc?: string;
  segments: TimelineSegment[];
}
