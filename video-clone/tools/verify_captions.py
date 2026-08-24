#!/usr/bin/env python3
"""Check that caption changes land on the same frames in the source and the render.

Captions are isolated by thresholding for near-white and near-black text-sized
blobs in the caption band, then the frames where that mask changes are compared.
"""
import sys
import cv2, numpy as np

Y0, Y1 = 500, 1010


def mask(f):
    band = cv2.cvtColor(f[Y0:Y1], cv2.COLOR_BGR2GRAY)
    out = np.zeros_like(band)
    for m in (
        cv2.threshold(band, 228, 255, cv2.THRESH_BINARY)[1],
        cv2.threshold(band, 45, 255, cv2.THRESH_BINARY_INV)[1],
    ):
        n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
        for i in range(1, n):
            x, y, w, h, a = st[i]
            if 18 <= h <= 90 and 4 <= w <= 400 and a > 60:
                out[lab == i] = 255
    return out.astype(np.float32)


def changes(path, thresh=2.0):
    cap = cv2.VideoCapture(path)
    prev, out, i = None, [], 0
    while True:
        ok, f = cap.read()
        if not ok:
            break
        m = mask(f)
        if prev is not None and np.abs(m - prev).mean() > thresh:
            if not out or i - out[-1] > 2:
                out.append(i)
        prev = m
        i += 1
    cap.release()
    return out


def main():
    a = changes(sys.argv[1])
    b = changes(sys.argv[2])
    tol = int(sys.argv[3]) if len(sys.argv) > 3 else 3
    hits = [c for c in a if any(abs(d - c) <= tol for d in b)]
    print(f"source caption changes: {len(a)}")
    print(f"clone  caption changes: {len(b)}")
    print(f"matched {len(hits)}/{len(a)} within ±{tol} frames")
    miss = [c for c in a if c not in hits]
    if miss:
        print("unmatched source changes:", " ".join(f"f{c}" for c in miss))


if __name__ == "__main__":
    main()
