#!/usr/bin/env python3
"""Check that the clone holds as still as the source inside each shot.

The source's b-roll settles within ~20 frames of a cut and then does not move.
Any residual per-frame motion in the clone after that point is invented camera
work. This reports mean per-frame pixel change over the settled portion of every
scene, source next to clone.
"""
import re, sys
import cv2, numpy as np


def scenes(path="src/data/timeline.ts"):
    ts = open(path).read()
    block = ts[ts.index("const CUTS"):ts.index("export const SCENES")]
    cuts = [(m[0], int(m[1])) for m in re.findall(r"\['(\w+)',\s*(\d+)\]", block)]
    total = int(re.search(r"export const DURATION = (\d+)", ts).group(1))
    return [
        (name, f, (cuts[i + 1][1] if i + 1 < len(cuts) else total))
        for i, (name, f) in enumerate(cuts)
    ]


def signatures(path):
    cap = cv2.VideoCapture(path)
    out = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        out.append(cv2.cvtColor(cv2.resize(f, (180, 320)), cv2.COLOR_BGR2GRAY).astype(np.float32))
    cap.release()
    return out


def hold(sig, a, b, settle=20):
    """Mean per-frame change over the settled part of a shot."""
    lo = min(a + settle, b - 2)
    if b - lo < 3:
        return None
    d = [np.abs(sig[i] - sig[i - 1]).mean() for i in range(lo + 1, b)]
    return float(np.mean(d))


def main():
    src, clone = signatures(sys.argv[1]), signatures(sys.argv[2])
    print(f"{'scene':18s} {'frames':>12s} {'source':>8s} {'clone':>8s}   drift")
    worst = 0.0
    for name, a, b in scenes():
        s, c = hold(src, a, b), hold(clone, a, b)
        if s is None:
            continue
        # Talking-head shots carry real footage motion; b-roll should be still.
        extra = c - s
        worst = max(worst, extra)
        flag = "  <-- clone drifts" if extra > 0.6 else ""
        print(f"{name:18s} {f'{a}-{b-1}':>12s} {s:8.2f} {c:8.2f}   {extra:+6.2f}{flag}")
    print(f"\nworst excess motion: {worst:+.2f} (over the source's own)")


if __name__ == "__main__":
    main()
