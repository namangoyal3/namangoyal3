#!/usr/bin/env python3
"""Track each b-roll element's on-screen box frame by frame in the source.

This is what showed that the source holds its b-roll perfectly still: every
element snaps to a box within ~20 frames of its cut and then does not move.
Any drift in the clone after that point is invented motion and should be removed.
"""
import os, sys
import cv2, numpy as np

SRC = os.environ.get("CLONE_SOURCE", "reference/source.mp4")


def load():
    cap = cv2.VideoCapture(SRC)
    out = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        out.append(f)
    cap.release()
    return out


def luma(f, lo, hi):
    g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
    return (g >= lo) & (g <= hi)


def sat(f, s):
    h = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    return (h[:, :, 1] >= s) & (h[:, :, 2] > 60)


# name, frame range, mask, vertical search window, sampling step
SHOTS = [
    ("openBrowser panel", (170, 241), lambda f: (f[:, :, 2].astype(int) - f[:, :, 0] > 14) & (f[:, :, 2] > 195), (100, 600), 8),
    ("screenshot card", (241, 296), lambda f: luma(f, 200, 251), (350, 700), 6),
    ("consoleErrors frame", (296, 362), lambda f: sat(f, 90), (150, 800), 6),
    ("realtimeCode window", (414, 472), lambda f: luma(f, 0, 80), (60, 560), 6),
    ("supabaseDash window", (472, 553), lambda f: luma(f, 19, 255), (150, 780), 8),
    ("strixAttack page", (588, 667), lambda f: luma(f, 18, 255), (480, 860), 8),
    ("strixFindings dash", (667, 762), lambda f: luma(f, 18, 255), (150, 560), 10),
    ("skillUiTerminal", (834, 912), lambda f: luma(f, 60, 255), (100, 700), 8),
    ("claudeMd sheet", (976, 1008), lambda f: luma(f, 0, 80), (200, 900), 4),
    ("rampBroll window", (1008, 1086), lambda f: luma(f, 0, 150), (100, 560), 8),
    ("context7Table", (1135, 1228), lambda f: luma(f, 90, 255), (150, 640), 10),
    ("context7Page", (1314, 1388), lambda f: sat(f, 25), (100, 800), 8),
    ("titleStrix icon", (553, 588), lambda f: luma(f, 0, 50), (250, 900), 3),
    ("titleContext7 icon", (1086, 1135), lambda f: sat(f, 100), (250, 900), 4),
]


def main():
    fr = load()
    only = sys.argv[1] if len(sys.argv) > 1 else None
    for name, (a, b), probe, (y0, y1), step in SHOTS:
        if only and only not in name:
            continue
        print(f"\n== {name}  f{a}..{b - 1} ==")
        for i in range(a, b, step):
            m = probe(fr[i])
            mm = np.zeros_like(m)
            mm[y0:y1] = m[y0:y1]
            ys, xs = np.where(mm)
            if len(xs) < 50:
                print(f"  f{i}: -")
                continue
            print(
                f"  f{i}: x={xs.min():4d}..{xs.max():4d} ({xs.max()-xs.min():4d})"
                f"  y={ys.min():4d}..{ys.max():4d} ({ys.max()-ys.min():4d})"
            )


if __name__ == "__main__":
    main()
