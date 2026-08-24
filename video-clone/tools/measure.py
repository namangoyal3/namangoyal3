#!/usr/bin/env python3
"""Compare element bounding boxes between the source clip and a rendered still.

Each probe isolates one element with a colour/luma mask and prints the source
box next to the clone's, so layout drift shows up as numbers rather than a
judgement call about a screenshot.
"""
import os, subprocess, sys
import cv2, numpy as np

SRC = os.environ.get("CLONE_SOURCE", "reference/source.mp4")
CHROME = os.environ.get(
    "CHROME", "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"
)


def biggest(mask, y0=0, y1=1280):
    m = np.zeros_like(mask)
    m[y0:y1] = mask[y0:y1]
    n, _, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8), 8)
    if n < 2:
        return None
    i = 1 + int(np.argmax(st[1:, 4]))
    x, y, w, h, _ = st[i]
    return (int(x), int(y), int(w), int(h))


def extent(mask, y0=0, y1=1280):
    ys, xs = np.where(mask[y0:y1])
    if len(xs) == 0:
        return None
    return (int(xs.min()), int(ys.min()) + y0, int(xs.max() - xs.min()), int(ys.max() - ys.min()))


def src_frame(i):
    cap = cv2.VideoCapture(SRC)
    cap.set(cv2.CAP_PROP_POS_FRAMES, i)
    ok, f = cap.read()
    cap.release()
    return f


def clone_frame(i, comp="VideoCloneSilent"):
    p = f"out/stills/{i:04d}.png"
    if not os.path.exists(p):
        os.makedirs("out/stills", exist_ok=True)
        subprocess.run(
            ["npx", "remotion", "still", comp, p, f"--frame={i}",
             "--browser-executable=" + CHROME],
            check=True, stdout=subprocess.DEVNULL,
        )
    return cv2.imread(p)


def mid(mask):
    """Keep only the centre column band — isolates the installer icon from the arrows."""
    m = np.zeros_like(mask)
    m[:, 240:480] = mask[:, 240:480]
    return m


def luma(f, lo, hi):
    g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
    return (g >= lo) & (g <= hi)


def sat(f, smin, vmin=60):
    h = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    return (h[:, :, 1] >= smin) & (h[:, :, 2] >= vmin)


# name, frame, probe(f) -> mask, y-window, mode
PROBES = [
    ("title: salmon ordinal", 160, lambda f: sat(f, 45, 150), (180, 340), extent),
    ("title: app icon", 580, lambda f: luma(f, 0, 50), (300, 900), biggest),
    ("title: grey name", 160, lambda f: luma(f, 150, 200), (756, 840), extent),
    ("installer: numbers", 80, lambda f: sat(f, 80), (150, 400), extent),
    ("installer: icon", 80, lambda f: luma(f, 0, 90), (370, 620), extent),
    ("browser panel", 200, lambda f: (f[:, :, 2].astype(int) - f[:, :, 0] > 14) & (f[:, :, 2] > 195), (100, 600), biggest),
    ("screenshot: crab", 250, lambda f: sat(f, 110), (500, 720), biggest),
    ("code window", 440, lambda f: luma(f, 0, 80), (60, 600), biggest),
    ("supabase window", 520, lambda f: luma(f, 19, 255), (150, 750), extent),
    ("strix dash", 700, lambda f: luma(f, 19, 255), (150, 700), extent),
    ("ctx7 hero", 1340, lambda f: sat(f, 25, 200), (100, 800), biggest),
    # The avatar is a grey bust, not dark hair, so the two clips need different
    # masks to isolate the same silhouette. `pair` supplies one for each.
    ("avatar head", 440, (lambda f: luma(f, 0, 70), lambda f: luma(f, 120, 200)), (600, 1000), biggest),
    ("screenshot: card", 250, lambda f: luma(f, 150, 249), (380, 780), extent),
    ("installer: caption", 80, lambda f: luma(f, 0, 120), (760, 1010), extent),
    ("display caption", 250, lambda f: luma(f, 0, 90), (790, 900), extent),
    ("word caption", 440, lambda f: luma(f, 0, 90), (560, 640), extent),
    ("strix ring", 600, lambda f: luma(f, 120, 255), (150, 520), extent),
    ("skillui report", 880, lambda f: luma(f, 60, 255), (100, 700), extent),
    ("ctx7 table", 1200, lambda f: luma(f, 90, 255), (150, 620), extent),
    ("ramp window", 1050, lambda f: luma(f, 0, 120), (100, 560), biggest),
    ("claudemd sheet", 1000, lambda f: luma(f, 0, 80), (200, 900), biggest),
    ("installer icon only", 80, lambda f: mid(luma(f, 0, 90)), (380, 640), extent),
    ("closeup head", 1250, (lambda f: luma(f, 0, 70), lambda f: luma(f, 120, 200)), (0, 900), extent),
    ("display caption dark", 890, lambda f: luma(f, 200, 255), (740, 830), extent),
]


def main():
    for name, fi, probe, (y0, y1), mode in PROBES:
        src_probe, clone_probe = probe if isinstance(probe, tuple) else (probe, probe)
        a = mode(src_probe(src_frame(fi)), y0, y1)
        b = mode(clone_probe(clone_frame(fi)), y0, y1)
        d = "" if not (a and b) else "  Δ=" + str(tuple(int(q) - int(p) for p, q in zip(a, b)))
        print(f"f{fi:<5} {name:<22} src={a}  clone={b}{d}")


if __name__ == "__main__":
    main()
