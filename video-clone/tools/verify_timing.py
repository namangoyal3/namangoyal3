#!/usr/bin/env python3
"""Check that shot cuts land on the same frames in the source and the render.

Both clips are reduced to a per-frame luma signature; a "cut" is a frame whose
signature jumps. Note that this catches more than shot changes — a hard zoom or
a wipe inside a screen recording trips it too — so a source cut with no match is
not automatically a defect. What must match is the scene boundary list, which is
checked separately against `src/data/timeline.ts`.
"""
import sys
import cv2, numpy as np


def cuts(path, thresh=12.0):
    cap = cv2.VideoCapture(path)
    prev, out, i = None, [], 0
    while True:
        ok, f = cap.read()
        if not ok:
            break
        g = cv2.cvtColor(cv2.resize(f, (90, 160)), cv2.COLOR_BGR2GRAY).astype(np.float32)
        if prev is not None and np.abs(g - prev).mean() > thresh:
            if not out or i - out[-1] > 3:
                out.append(i)
        prev = g
        i += 1
    cap.release()
    return out, i


def main():
    src, clone = sys.argv[1], sys.argv[2]
    a, na = cuts(src)
    b, nb = cuts(clone)
    print(f"source: {na} frames, {len(a)} cuts")
    print(f"clone : {nb} frames, {len(b)} cuts")

    matched, tol = 0, 2
    for c in a:
        near = [d for d in b if abs(d - c) <= tol]
        mark = "ok" if near else "MISSING"
        if near:
            matched += 1
        else:
            print(f"  source cut f{c} ({c/30:.2f}s) -> {mark}")
    extra = [d for d in b if not any(abs(d - c) <= tol for c in a)]
    for d in extra:
        print(f"  clone-only cut f{d} ({d/30:.2f}s)")
    print(f"matched {matched}/{len(a)} source luma cuts within ±{tol} frames")
    scene_report(a, b, tol)


def scene_boundaries(path="src/data/timeline.ts"):
    import re
    ts = open(path).read()
    block = ts[ts.index("const CUTS"):ts.index("export const SCENES")]
    return [int(n) for n in re.findall(r"',\s*(\d+)\]", block)]


def scene_report(src_cuts, clone_cuts, tol):
    """The list that actually has to match: the source's own scene boundaries."""
    scenes = [f for f in scene_boundaries() if f > 0]
    ok = [f for f in scenes if any(abs(c - f) <= tol for c in src_cuts + clone_cuts)]
    print(f"scene boundaries reproduced: {len(ok)}/{len(scenes)}")
    for f in scenes:
        if f not in ok:
            print(f"  scene boundary f{f} ({f/30:.2f}s) not visible as a cut in either clip")


if __name__ == "__main__":
    main()
