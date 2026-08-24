#!/usr/bin/env python3
"""Side-by-side frame comparison between the source clip and the render.

Usage:  python3 tools/compare.py out/still-0002.png ... -o out/compare.png
   or:  python3 tools/compare.py --frames 2,80,140,200 -o out/compare.png
"""
import argparse, os, subprocess, sys
import cv2, numpy as np

SRC = os.environ.get("CLONE_SOURCE", "reference/source.mp4")


def source_frames(idxs):
    cap = cv2.VideoCapture(SRC)
    out = {}
    want = set(idxs)
    i = 0
    while want:
        ok, f = cap.read()
        if not ok:
            break
        if i in want:
            out[i] = f
            want.discard(i)
        i += 1
    cap.release()
    return out


def render_stills(idxs, comp="VideoCloneSilent", outdir="out/stills"):
    os.makedirs(outdir, exist_ok=True)
    paths = {}
    for i in idxs:
        p = os.path.join(outdir, f"{i:04d}.png")
        if not os.path.exists(p):
            subprocess.run(
                ["npx", "remotion", "still", comp, p, f"--frame={i}",
                 "--browser-executable=" + os.environ.get(
                     "CHROME", "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell")],
                check=True, stdout=subprocess.DEVNULL,
            )
        paths[i] = p
    return paths


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--frames", required=True, help="comma separated frame indices")
    ap.add_argument("-o", "--out", default="out/compare.png")
    ap.add_argument("--cols", type=int, default=4)
    ap.add_argument("--scale", type=float, default=0.5)
    a = ap.parse_args()

    idxs = [int(x) for x in a.frames.split(",")]
    src = source_frames(idxs)
    ren = render_stills(idxs)

    tiles = []
    for i in idxs:
        s = src[i]
        r = cv2.imread(ren[i])
        if r is None:
            print("missing render for", i, file=sys.stderr)
            continue
        r = cv2.resize(r, (s.shape[1], s.shape[0]))
        pair = np.hstack([s, np.full((s.shape[0], 6, 3), 255, np.uint8), r])
        cv2.putText(pair, f"f{i}  src | clone", (10, 34),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
        tiles.append(cv2.resize(pair, None, fx=a.scale, fy=a.scale))

    while len(tiles) % a.cols:
        tiles.append(np.zeros_like(tiles[0]))
    rows = [np.hstack(tiles[i:i + a.cols]) for i in range(0, len(tiles), a.cols)]
    os.makedirs(os.path.dirname(a.out) or ".", exist_ok=True)
    cv2.imwrite(a.out, np.vstack(rows))
    print(a.out)


if __name__ == "__main__":
    main()
