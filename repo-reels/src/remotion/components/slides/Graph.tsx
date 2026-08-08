import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";

// ---------------------------------------------------------------------------
// 7. Knowledge graph — Obsidian-style constellation; a BFS path lights violet
// ---------------------------------------------------------------------------

const W = 720;
const H = 1280;
const CX = 360; // constellation center, sits inside the top-58% crop band
const CY = 380;
const N = 74;
const HUBS = 5;
const MAX_DEPTH = 2; // origin + two rings light up

type GNode = { x: number; y: number; r: number; hub: boolean };

type GraphData = {
  nodes: GNode[];
  edges: [number, number][];
  depth: number[];
  edgeDepth: number[]; // Infinity = never lights
};

const buildGraph = (): GraphData => {
  // 2-3 organic gaussian-ish blobs instead of a ring
  const centers = [
    { x: CX - 55, y: CY - 70, s: 125 },
    { x: CX + 90, y: CY + 35, s: 108 },
    { x: CX - 45, y: CY + 120, s: 92 },
  ];
  // sum of two uniforms ≈ triangular (gaussian-ish), centered on 0
  const gauss = (seed: string, spread: number) => (random(`${seed}a`) + random(`${seed}b`) - 1) * spread * 1.7;

  const nodes: GNode[] = [];
  for (let i = 0; i < N; i++) {
    const hub = i < HUBS;
    const c = hub ? centers[i % centers.length] : centers[Math.floor(random(`gc-${i}`) * centers.length)];
    nodes.push({
      x: c.x + gauss(`gx-${i}`, hub ? c.s * 0.45 : c.s),
      y: c.y + gauss(`gy-${i}`, hub ? c.s * 0.45 : c.s) * 0.94,
      r: hub ? 6 + random(`gh-${i}`) * 2 : 1.5 + random(`gr-${i}`) ** 2 * 3.5,
      hub,
    });
  }
  // node 0 is the labeled origin hub — pin it upper-left of center like the reference
  nodes[0] = { x: CX - 68, y: CY - 78, r: 5.5, hub: true };

  const seen = new Set<string>();
  const edges: [number, number][] = [];
  const addEdge = (a: number, b: number) => {
    if (a === b) return;
    const k = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (seen.has(k)) return;
    seen.add(k);
    edges.push([a, b]);
  };
  const d2 = (a: GNode, b: GNode) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  const nearest = (i: number) =>
    nodes
      .map((n, j) => ({ j, d: j === i ? Number.POSITIVE_INFINITY : d2(nodes[i], n) }))
      .sort((p, q) => p.d - q.d);

  // each node links to its nearest neighbor, sometimes the second → organic web
  for (let i = 0; i < N; i++) {
    const ord = nearest(i);
    addEdge(i, ord[0].j);
    if (random(`ge-${i}`) < 0.42) addEdge(i, ord[1].j);
  }
  // hubs fan out with extra spokes
  for (let h = 0; h < HUBS; h++) {
    const ord = nearest(h);
    const spokes = 5 + Math.floor(random(`gs-${h}`) * 3);
    for (let s = 0; s < spokes; s++) addEdge(h, ord[s].j);
  }

  // BFS depths from the labeled hub
  const adj: number[][] = Array.from({ length: N }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const depth = new Array<number>(N).fill(Number.POSITIVE_INFINITY);
  depth[0] = 0;
  const queue = [0];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const nb of adj[cur]) {
      if (!Number.isFinite(depth[nb])) {
        depth[nb] = depth[cur] + 1;
        queue.push(nb);
      }
    }
  }
  // only tree-like edges (spanning different depths, within MAX_DEPTH) light up
  const edgeDepth = edges.map(([a, b]) => {
    const lo = Math.min(depth[a], depth[b]);
    const hi = Math.max(depth[a], depth[b]);
    return Number.isFinite(hi) && hi <= MAX_DEPTH && lo < hi ? hi : Number.POSITIVE_INFINITY;
  });
  return { nodes, edges, depth, edgeDepth };
};

const GRAPH = buildGraph();

export const Graph: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { nodes, edges, depth, edgeDepth } = GRAPH;

  // 0 → MAX_DEPTH+1 over ~2.5s: each ring fades in over one unit
  const lit = interpolate(frame, [6, 6 + fps * 2.5], [0, MAX_DEPTH + 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const litAlpha = (d: number) => (Number.isFinite(d) ? Math.min(Math.max(lit - d, 0), 1) : 0);
  const appear = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  const origin = nodes[0];
  const cleanLabel = label.trim().slice(0, 24);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.coal }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ opacity: appear }}>
        <defs>
          <filter id="graph-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation={3.2} />
          </filter>
        </defs>

        {/* dim base web */}
        {edges.map(([a, b], i) => (
          <line key={`e${i}`} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        ))}
        {nodes.map((n, i) => (
          <circle key={`n${i}`} cx={n.x} cy={n.y} r={n.r} fill={`rgba(255,255,255,${n.hub ? 0.3 : 0.18 + random(`go-${i}`) * 0.12})`} />
        ))}

        {/* lit violet path — glow pass then core pass */}
        {edges.map(([a, b], i) => {
          const al = litAlpha(edgeDepth[i]);
          if (al <= 0.01) return null;
          return (
            <g key={`le${i}`}>
              <line x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={`rgba(139,124,246,${0.2 * al})`} strokeWidth={4} filter="url(#graph-glow)" />
              <line x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={`rgba(139,124,246,${0.52 * al})`} strokeWidth={1.3} />
            </g>
          );
        })}
        {nodes.map((n, i) => {
          const al = litAlpha(depth[i]);
          if (al <= 0.01) return null;
          return (
            <g key={`ln${i}`}>
              <circle cx={n.x} cy={n.y} r={Math.max(n.r * 2.4, 6)} fill={`rgba(139,124,246,${0.38 * al})`} filter="url(#graph-glow)" />
              <circle cx={n.x} cy={n.y} r={n.r + 0.4} fill="#B9AFFB" opacity={al} />
            </g>
          );
        })}

        {cleanLabel ? (
          <text
            x={origin.x + 13}
            y={origin.y + 5}
            fontFamily={theme.sans}
            fontWeight={500}
            fontSize={15}
            fill="#CBCDD4"
            stroke={theme.coal}
            strokeWidth={4}
            paintOrder="stroke"
            opacity={interpolate(frame, [4, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          >
            {cleanLabel}
          </text>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
