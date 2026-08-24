#!/usr/bin/env python3
"""Rebuild the "5 Claude Code Skills" short (720x1280 @ 30fps, 44.4s) scene by scene.

v2 — full motion pass. Every scene carries the movement measured from the
source: a continuous Ken Burns push-in on each cut, element entrances
(pops, slides, draw-ins), typing and scrolling, the walking mascot, the
two-phase Star History curve reveal, the churning ASCII wave, and an
animated placeholder avatar (idle bob + narration-driven voice bars from
voice_rms.json) in place of every talking-head shot. Caption timing is
driven by captions.json, recovered frame-by-frame from the source.

Usage:
    python3 render.py [--frames-dir DIR] [--start N] [--end N]
Then assemble with ffmpeg (see README.md).
"""
import argparse
import json
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS, NFRAMES = 720, 1280, 30, 1332

# ---------------------------------------------------------------- palette
CREAM = (235, 227, 213)
CREAM_CARD = (240, 236, 228)
INK = (18, 16, 14)
CLAY = (214, 116, 87)          # orange mascot / accent
CLAY_LIGHT = (225, 131, 105)   # progress fill
GRAY_TEXT = (120, 116, 108)
TEX_BG = (222, 230, 236)       # bluish textured backdrop
TERM_BG = (22, 22, 22)
DOC_BG = (29, 28, 33)
PAGE_BG = (12, 15, 20)
WHITE = (255, 255, 255)
AV_BG_TOP = (62, 64, 70)
AV_BG_BOT = (38, 40, 44)
AV_FIG = (188, 191, 197)

FONT_DIR = '/usr/share/fonts/truetype/liberation/'
_font_cache = {}


def font(name, size):
    key = (name, size)
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(os.path.join(FONT_DIR, name), size)
    return _font_cache[key]


def sans_b(s):
    return font('LiberationSans-Bold.ttf', s)


def sans_r(s):
    return font('LiberationSans-Regular.ttf', s)


def serif_r(s):
    return font('LiberationSerif-Regular.ttf', s)


def serif_bi(s):
    return font('LiberationSerif-BoldItalic.ttf', s)


def mono_r(s):
    return font('LiberationMono-Regular.ttf', s)


def mono_b(s):
    return font('LiberationMono-Bold.ttf', s)


def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def ease_out(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def pop_scale(age, dur=0.17):
    """Spring pop for entrances: 0.65 -> 1.06 -> 1.0."""
    x = max(0.0, min(1.0, age / dur))
    if x >= 1.0:
        return 1.0
    return 0.65 + 0.35 * ease_out(x) + 0.10 * math.sin(min(1.0, x * 1.25) * math.pi)


# narration loudness per frame (drives the avatar voice bars)
_RMS = None


def voice_rms(n):
    global _RMS
    if _RMS is None:
        p = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voice_rms.json')
        _RMS = json.load(open(p)) if os.path.exists(p) else [0.5] * NFRAMES
    return _RMS[min(len(_RMS) - 1, max(0, n - 1))]


# ---------------------------------------------------------------- helpers

def rr(d, box, r, fill=None, outline=None, width=1):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def text_mm(d, xy, s, f, fill, stroke=0, stroke_fill=None, anchor='mm'):
    d.text(xy, s, font=f, fill=fill, anchor=anchor,
           stroke_width=stroke, stroke_fill=stroke_fill)


def scaled_text(img, xy, s, f, fill, scale, stroke=0, stroke_fill=None):
    if scale <= 0:
        return
    tmp = Image.new('RGBA', (W, 300), (0, 0, 0, 0))
    td = ImageDraw.Draw(tmp)
    td.text((W // 2, 150), s, font=f, fill=fill, anchor='mm',
            stroke_width=stroke, stroke_fill=stroke_fill)
    if abs(scale - 1.0) > 0.01:
        nw, nh = max(1, int(W * scale)), max(1, int(300 * scale))
        tmp = tmp.resize((nw, nh), Image.LANCZOS)
    img.alpha_composite(tmp, (int(xy[0] - tmp.width / 2), int(xy[1] - tmp.height / 2)))


def ken_burns(img, lt, dur, amount=0.035, cx=360, cy=560):
    """Continuous push-in over the scene, like the source's drifting layers."""
    z = 1.0 + amount * min(1.0, lt / max(dur, 0.001))
    w, h = W / z, H / z
    x0 = min(max(cx - w / 2, 0), W - w)
    y0 = min(max(cy - h / 2, 0), H - h)
    return img.crop((int(x0), int(y0), int(x0 + w), int(y0 + h))).resize((W, H), Image.LANCZOS)


_noise_cache = {}


def textured_bg(seed=7, tint=TEX_BG):
    key = (seed, tint)
    if key in _noise_cache:
        return _noise_cache[key].copy()
    rnd = random.Random(seed)
    img = Image.new('RGB', (W, H), tint)
    d = ImageDraw.Draw(img)
    for _ in range(2600):
        x, y = rnd.randrange(W), rnd.randrange(H)
        v = rnd.randint(-9, 9)
        c = tuple(max(0, min(255, ch + v)) for ch in tint)
        d.rectangle([x, y, x + 2, y + 2], fill=c)
    sh = Image.new('L', (W, H), 0)
    sd = ImageDraw.Draw(sh)
    for i in range(7):
        cx = -80 + i * 60 + rnd.randint(-25, 25)
        cy = -40 + i * 110 + rnd.randint(-30, 30)
        sd.ellipse([cx, cy, cx + 340, cy + 130], fill=26)
    sh = sh.rotate(35, expand=False).filter(ImageFilter.GaussianBlur(28))
    dark = Image.new('RGB', (W, H), tuple(max(0, ch - 22) for ch in tint))
    img = Image.composite(dark, img, sh)
    _noise_cache[key] = img
    return img.copy()


def cream_bg(vignette=True):
    img = Image.new('RGB', (W, H), CREAM)
    if vignette:
        ov = Image.new('L', (W, H), 0)
        od = ImageDraw.Draw(ov)
        od.ellipse([-260, -260, W + 260, H + 260], fill=16)
        light = Image.new('RGB', (W, H), tuple(min(255, c + 9) for c in CREAM))
        img = Image.composite(light, img, ov.filter(ImageFilter.GaussianBlur(120)))
    return img


ROBOT_GRID = [
    '.oooooo.',
    'ooKooKoo',
    'oooooooo',
    'Aooooooa',
    '.oo.o.o.',
    '.oo.o.o.',
]
ROBOT_GRID_STEP = ROBOT_GRID[:4] + [
    '.o..oo.o',
    '.o..oo.o',
]


def robot(img, cx, cy, cell, color=CLAY, step=False):
    d = ImageDraw.Draw(img)
    grid = ROBOT_GRID_STEP if step else ROBOT_GRID
    rows, cols = len(grid), len(grid[0])
    x0 = cx - cols * cell // 2
    y0 = cy - rows * cell // 2
    for r, row in enumerate(grid):
        for c, ch in enumerate(row):
            if ch == '.':
                continue
            box = [x0 + c * cell, y0 + r * cell,
                   x0 + (c + 1) * cell, y0 + (r + 1) * cell]
            if ch == 'K':
                d.rectangle(box, fill=(12, 10, 8))
            elif ch == 'A':
                d.rectangle([box[0] - cell // 2, box[1], box[2], box[3]], fill=color)
            elif ch == 'a':
                d.rectangle([box[0], box[1], box[2] + cell // 2, box[3]], fill=color)
            else:
                d.rectangle(box, fill=color)


def mac_window(img, box, dark=True, title='', radius=14):
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = box
    bar_h = 34
    rr(d, box, radius, fill=TERM_BG if dark else (246, 246, 246))
    if dark:
        rr(d, [x0, y0, x1, y0 + bar_h + radius], radius, fill=(38, 38, 40))
        d.rectangle([x0, y0 + bar_h, x1, y0 + bar_h + 1], fill=(55, 55, 58))
        d.rectangle([x0, y0 + bar_h + 1, x1, y1 - radius], fill=TERM_BG)
        d.rectangle([x0, y1 - radius - 1, x1, y1], fill=TERM_BG)
        rr(d, box, radius, outline=(60, 60, 62), width=1)
    else:
        rr(d, [x0, y0, x1, y0 + bar_h + radius], radius, fill=(238, 236, 234))
        d.rectangle([x0, y0 + bar_h, x1, y0 + bar_h + 1], fill=(215, 213, 211))
        d.rectangle([x0, y0 + bar_h + 1, x1, y1 - radius], fill=WHITE)
        d.rectangle([x0, y1 - radius - 1, x1, y1], fill=WHITE)
        rr(d, box, radius, outline=(205, 203, 201), width=1)
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        lx = x0 + 16 + i * 20
        d.ellipse([lx, y0 + 12, lx + 11, y0 + 23], fill=c)
    if title:
        col = (170, 170, 172) if dark else (120, 118, 116)
        text_mm(d, ((x0 + x1) // 2, y0 + bar_h // 2 + 1), title, mono_r(13), col)
    return (x0, y0 + bar_h + 2, x1, y1)


def avatar_placeholder(box, t, zoom=1.0, corner=0, shift_y=0):
    """Animated placeholder for the talking head: idle bob/breathing plus
    voice bars scaled by the narration loudness at this frame."""
    n = int(t * FPS) + 1
    bob = int(2.5 * math.sin(t * 2.1))
    sway = 1.6 * math.sin(t * 1.3 + 1.0)
    breathe = 1.0 + 0.008 * math.sin(t * 2.1 + 0.6)
    bw, bh = box[2] - box[0], box[3] - box[1]
    img = Image.new('RGB', (bw, bh), AV_BG_BOT)
    d = ImageDraw.Draw(img)
    for y in range(bh):
        f = y / max(1, bh - 1)
        c = tuple(int(AV_BG_TOP[i] + (AV_BG_BOT[i] - AV_BG_TOP[i]) * f) for i in range(3))
        d.line([(0, y), (bw, y)], fill=c)
    glow = Image.new('L', (bw, bh), 0)
    gd = ImageDraw.Draw(glow)
    gx = int(bw * 0.72 + sway * 2)
    gd.rounded_rectangle([gx, int(bh * 0.18), int(bw * 1.05), int(bh * 0.62)],
                         radius=30, fill=34)
    light = Image.new('RGB', (bw, bh), (96, 98, 104))
    img = Image.composite(light, img, glow.filter(ImageFilter.GaussianBlur(40)))
    d = ImageDraw.Draw(img)
    cx = bw // 2 + int(sway)
    hr = int(min(bw, bh) * 0.30 * zoom)
    hy = int(bh * 0.42) + shift_y + bob
    d.ellipse([cx - hr, hy - hr, cx + hr, hy + hr], fill=AV_FIG)
    sw = int(hr * 2.9 * breathe)
    sy = hy + int(hr * 1.25)
    d.rounded_rectangle([cx - sw // 2, sy, cx + sw // 2, sy + int(hr * 2.6)],
                        radius=int(hr * 0.9), fill=AV_FIG)
    # voice bars on the chest, driven by narration loudness
    rms = voice_rms(n)
    bar_w = max(4, hr // 9)
    gap = bar_w + max(3, bar_w // 2)
    base_y = sy + int(hr * 0.95)
    for i, mult in enumerate([0.55, 0.9, 1.0, 0.9, 0.55]):
        jitter = 0.75 + 0.25 * math.sin(t * 9.0 + i * 1.7)
        bh_i = int((6 + rms * hr * 0.62 * mult) * jitter)
        bx = cx + (i - 2) * gap
        d.rounded_rectangle([bx - bar_w // 2, base_y - bh_i, bx + bar_w // 2, base_y + 4],
                            radius=bar_w // 2, fill=(120, 124, 132))
    lf = mono_b(max(14, int(min(bw, bh) * 0.045)))
    d.text((bw // 2, min(bh - 24, base_y + int(hr * 0.85))), 'AVATAR PLACEHOLDER',
           font=lf, fill=(228, 230, 234), anchor='mm')
    if corner:
        mask = Image.new('L', (bw, bh), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, bw, bh], radius=corner, fill=255)
        return img, mask
    return img, None


def paste_avatar(img, box, t, zoom=1.0, corner=0, shift_y=0):
    av, mask = avatar_placeholder(box, t, zoom, corner, shift_y)
    if mask is not None:
        md = ImageDraw.Draw(mask)
        md.rectangle([0, box[3] - box[1] - corner, box[2] - box[0], box[3] - box[1]],
                     fill=255)
        img.paste(av, (box[0], box[1]), mask)
    else:
        img.paste(av, (box[0], box[1]))


def doc_icon(img, cx, cy, w, h, tilt=0, label='', watermark='', scale=1.0):
    if scale <= 0.02:
        return
    w, h = int(w * scale), int(h * scale)
    page = Image.new('RGBA', (w + 40, h + 40), (0, 0, 0, 0))
    pd = ImageDraw.Draw(page)
    fold = int(w * 0.28)
    pd.polygon([(20, 20), (20 + w - fold, 20), (20 + w, 20 + fold), (20 + w, 20 + h),
                (20, 20 + h)], fill=(250, 249, 247), outline=(210, 206, 200))
    pd.polygon([(20 + w - fold, 20), (20 + w, 20 + fold), (20 + w - fold, 20 + fold)],
               fill=(228, 225, 219))
    if watermark:
        pd.text((20 + w // 2, 20 + h // 2), watermark,
                font=sans_b(max(8, int(w * 0.22))), fill=(225, 222, 216), anchor='mm')
    if tilt:
        page = page.rotate(tilt, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(page.convert('RGBA'), (cx - page.width // 2, cy - page.height // 2))
    if label and scale > 0.9:
        d = ImageDraw.Draw(img)
        text_mm(d, (cx, cy + h // 2 + 34), label, sans_r(17), (60, 56, 50))


def folder_icon(img, cx, cy, w, h, label='', scale=1.0):
    if scale <= 0.02:
        return
    w, h = int(w * scale), int(h * scale)
    d = ImageDraw.Draw(img)
    tab_w = int(w * 0.42)
    rr(d, [cx - w // 2, cy - h // 2 - 12, cx - w // 2 + tab_w, cy - h // 2 + 10], 6,
       fill=(126, 168, 222))
    rr(d, [cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2], 10, fill=(147, 183, 227))
    rr(d, [cx - w // 2, cy - h // 2 + 8, cx + w // 2, cy + h // 2], 10, fill=(160, 194, 235))
    if label and scale > 0.9:
        text_mm(d, (cx, cy + h // 2 + 26), label, sans_r(17), (60, 56, 50))


def cursor(img, x, y, size=22):
    d = ImageDraw.Draw(img)
    pts = [(x, y), (x, y + size), (x + size * 0.28, y + size * 0.75),
           (x + size * 0.48, y + size * 1.05), (x + size * 0.62, y + size * 0.97),
           (x + size * 0.44, y + size * 0.68), (x + size * 0.72, y + size * 0.66)]
    d.polygon(pts, fill=(20, 20, 20), outline=WHITE)


# ---------------------------------------------------------------- scenes
BOUNDS = [0.0, 1.6, 3.567, 4.8, 6.2, 8.0, 10.733, 12.0, 14.733, 15.8, 18.6,
          19.867, 21.667, 25.067, 26.767, 28.633, 30.367, 32.733, 34.333,
          35.833, 40.4, 44.4]


def s01_title(img, t, lt):
    """Title card: settling headline, mascot walking in from the left."""
    img.paste(cream_bg(), (0, 0))
    d = ImageDraw.Draw(img)
    slide = ease(min(1, lt / 0.4))
    ty = int(275 - 18 * (1 - slide))
    f = serif_r(72)
    text_mm(d, (W // 2, ty - 36), 'Claude Code', f, INK)
    text_mm(d, (W // 2, ty + 40), 'Skills', f, INK)
    # mascot walks left -> center (measured x 60 @0.1s to 360 @1.05s)
    wf = ease(min(1.0, max(0.0, (lt - 0.07) / 0.95)))
    rx = int(60 + (360 - 60) * wf)
    walking = wf < 1.0
    hop = int(3 * abs(math.sin(lt * 16))) if walking else 0
    robot(img, rx, 470 - hop, 18, step=walking and int(lt * 8) % 2 == 0)
    paste_avatar(img, (30, 800, 690, H), t, zoom=1.05, corner=85, shift_y=-30)


def s02_diagram(img, t, lt):
    """Files fanning into a skill; arrows draw in, icons pop, cursor drifts."""
    img.paste(cream_bg(), (0, 0))
    rgba = img.convert('RGBA')
    d = ImageDraw.Draw(rgba)
    targets = [(230, 395), (315, 390), (362, 388), (410, 390), (455, 408)]
    draw_f = ease_out(min(1.0, lt / 0.45))
    for i, (tx, ty) in enumerate(targets):
        sx = 215 + i * 72
        sy = 300 + abs(i - 2) * 6
        ex = sx + (tx - sx) * draw_f
        ey = sy + (ty - sy) * draw_f
        d.line([(sx, sy), (ex, ey)], fill=(25, 22, 18), width=3)
        if draw_f > 0.95:
            ang = math.atan2(ty - sy, tx - sx)
            for da in (-0.5, 0.5):
                d.line([(tx, ty), (tx - 14 * math.cos(ang + da), ty - 14 * math.sin(ang + da))],
                       fill=(25, 22, 18), width=3)
    nf = serif_bi(46)
    for i, (nx, ny) in enumerate([(255, 220), (310, 205), (365, 195), (420, 205), (478, 222)]):
        ns = pop_scale(lt - 0.06 * i, 0.2)
        if lt > 0.06 * i:
            text_mm(d, (nx, ny), str(i + 1), font('LiberationSerif-BoldItalic.ttf',
                                                  max(8, int(46 * ns))), CLAY)
    img.paste(rgba.convert('RGB'), (0, 0))
    rgba = img.convert('RGBA')
    # icons pop in staggered
    s_pdf = pop_scale(lt - 0.10, 0.22)
    s_md = pop_scale(lt - 0.18, 0.22)
    s_fold = pop_scale(lt - 0.26, 0.22)
    s_zip = pop_scale(lt - 0.34, 0.22)
    doc_icon(rgba, 205, 500, 130, 165, tilt=12, label='brand-guidelines.pdf', scale=s_pdf)
    if s_pdf > 0.9:
        tmp = Image.new('RGBA', (160, 60), (0, 0, 0, 0))
        ImageDraw.Draw(tmp).text((80, 18), 'CRABRACADABRA', font=sans_b(14),
                                 fill=(209, 66, 108), anchor='mm')
        ImageDraw.Draw(tmp).text((80, 36), 'GAMES', font=sans_r(11),
                                 fill=(120, 116, 110), anchor='mm')
        tmp = tmp.rotate(12, expand=True, resample=Image.BICUBIC)
        rgba.alpha_composite(tmp, (205 - tmp.width // 2, 470 - tmp.height // 2))
    doc_icon(rgba, 370, 480, 115, 150, label='SKILL.md', watermark='SKILL', scale=s_md)
    folder_icon(rgba, 540, 520, 130, 95, label='Resources', scale=s_fold)
    doc_icon(rgba, 370, 690, 100, 130, scale=s_zip)
    if s_zip > 0.9:
        zd = ImageDraw.Draw(rgba)
        zd.rectangle([362, 630, 378, 700], fill=(70, 66, 60))
        for zy in range(632, 700, 8):
            zd.rectangle([364, zy, 376, zy + 3], fill=(150, 146, 138))
        text_mm(zd, (370, 733), 'ZIP', sans_r(17), (110, 106, 100))
        rr(zd, [297, 752, 445, 796], 4, fill=(58, 110, 236))
        text_mm(zd, (371, 765), 'crabracadabra-', sans_r(15), WHITE)
        text_mm(zd, (371, 783), 'brand-guidelines.zip', sans_r(15), WHITE)
    cx_drift = 385 + int(14 * math.sin(lt * 1.4))
    cy_drift = 700 + int(8 * math.sin(lt * 1.9 + 1))
    cursor(rgba, cx_drift, cy_drift)
    img.paste(rgba.convert('RGB'), (0, 0))


def s03_head1(img, t, lt):
    paste_avatar(img, (0, 0, W, H), t, zoom=1.15)


def s04_skillmd(img, t, lt):
    """SKILL.md doc: chip pops in, highlight sweeps the bullet, slow scroll."""
    doc = Image.new('RGB', (W, 1500), DOC_BG)
    d = ImageDraw.Draw(doc)
    x = 85
    d.text((x, 118), 'F I L E S', font=mono_r(14), fill=(120, 118, 124))
    rr(d, [72, 152, 648, 196], 6, fill=(40, 39, 44))
    d.text((x, 166), 'SKILL.md', font=sans_b(17), fill=(232, 232, 236))
    d.text((x, 212), 'SKILL.md', font=mono_r(14), fill=(130, 128, 134))
    d.line([(72, 236), (648, 236)], fill=(58, 57, 62), width=1)
    chip_s = pop_scale(lt - 0.18, 0.2)
    if lt > 0.18:
        cw, ch = int(144 * chip_s) // 2, int(38 * chip_s) // 2
        rr(d, [150 - cw, 275 - ch, 150 + cw, 275 + ch], 6, fill=CLAY)
        if chip_s > 0.85:
            d.text((150, 275), 'Find Skills', font=sans_b(22), fill=WHITE, anchor='mm')
    body = (120, 122, 130)
    txt = (208, 210, 216)
    d.text((x, 320), 'This skill helps you discover and install skills from', font=sans_r(17), fill=txt)
    d.text((x, 344), 'the open agent skills ecosystem.', font=sans_r(17), fill=txt)
    d.text((x, 410), 'When to Use This Skill', font=sans_b(22), fill=WHITE)
    d.text((x, 460), 'Use this skill when the user:', font=sans_r(17), fill=txt)
    bullets = [
        ('Asks "how do I do X" where X might be a common', 1),
        ('task with an existing skill', 2),
        ('Says "find a skill for X" or "is there a skill for X"', 0),
        ('Asks "can you do X" where X is a specialized capability', 0),
        ('Expresses interest in extending agent capabilities', 0),
        ('Wants to search for tools, templates, or workflows', 0),
        ('Mentions they wish they had help with a specific', 0),
        ('domain (design, testing, deployment, etc.)', 0),
    ]
    hl_sweep = ease(min(1.0, max(0.0, (lt - 0.3) / 0.35)))
    y = 505
    prev_cont = False
    for line, hl in bullets:
        if hl and hl_sweep > 0:
            tw = d.textlength(line, font=sans_r(17))
            sweep_w = (tw + 8) * (hl_sweep if hl == 1 else max(0, hl_sweep * 1.4 - 0.4))
            if sweep_w > 2:
                rr(d, [112, y - 4, 118 + sweep_w, y + 22], 3, fill=CLAY)
        if not prev_cont:
            d.ellipse([94, y + 6, 100, y + 12], fill=body)
        d.text((118, y), line, font=sans_r(17), fill=txt)
        prev_cont = line.endswith('common') or line.endswith('specific')
        y += 31
    y += 30
    d.text((x, y), 'What is the Skills CLI?', font=sans_b(22), fill=WHITE)
    y += 50
    for line in ['The Skills CLI ( npx skills ) is the package manager for',
                 'the open agent skills ecosystem. Skills are modular',
                 'packages that extend agent capabilities with specialized',
                 'knowledge, workflows, and tools.']:
        d.text((x, y), line, font=sans_r(17), fill=txt)
        y += 27
    off = int(ease(lt / 1.4) * 30)
    img.paste(doc.crop((0, off, W, off + H)), (0, 0))


def s05_terminal(img, t, lt):
    """Terminal typing `ls`; toast slides up; avatar card below."""
    img.paste(textured_bg(), (0, 0))
    cb = mac_window(img, (75, 200, 645, 520), dark=True, title='~/.claude/skills')
    d = ImageDraw.Draw(img)
    x = cb[0] + 22
    y = cb[1] + 12
    d.text((x, y), '> cd .claude/skills', font=mono_r(15), fill=(224, 224, 224))
    y += 24
    d.text((x, y), '~/.claude/', font=mono_r(15), fill=(90, 170, 220))
    d.text((x + d.textlength('~/.claude/', font=mono_r(15)), y), 'skills',
           font=mono_b(15), fill=(90, 170, 220))
    d.text((cb[2] - 150, y), '11:51:44 AM', font=mono_r(14), fill=(150, 150, 150))
    y += 24
    typed = 'ls'[:max(0, int((lt - 0.35) / 0.3))]
    d.text((x, y), '> ' + typed + ('|' if int(lt * 3) % 2 == 0 else ''),
           font=mono_r(15), fill=(224, 224, 224))
    if lt > 1.15:
        y += 30
        names = ['find-skills/', 'superpowers/', 'claude-mem/', 'impeccable/', 'task-observer/']
        for i, nme in enumerate(names):
            if lt > 1.15 + i * 0.1:
                d.text((x, y + i * 22), nme, font=mono_r(15), fill=(126, 211, 132))
    # toast slides up into the terminal
    toast_f = ease_out(min(1.0, max(0.0, (lt - 0.85) / 0.4)))
    if toast_f > 0:
        ty0 = int(515 - 40 * toast_f)
        rr(d, [175, ty0 - 20, 545, ty0 + 20], 6, fill=(45, 45, 45))
        robot(img, 197, ty0, 3)
        d = ImageDraw.Draw(img)
        d.text((215, ty0 - 7), "If you're using Windows, this is in C:/Users/<you>",
               font=mono_r(10), fill=(210, 210, 210))
    paste_avatar(img, (0, 650, W, H), t, zoom=0.95, corner=100, shift_y=-15)


def s06_install(img, t, lt):
    """Install card: bobbing mascot, animated progress bar."""
    img.paste(cream_bg(), (0, 0))
    d = ImageDraw.Draw(img)
    bob = int(3 * math.sin(lt * 2.2))
    robot(img, 360, 315 + bob, 24)
    d = ImageDraw.Draw(img)
    p = min(1.0, max(0.04, lt / 2.35))
    done = p >= 1.0
    title = 'Claude Skill installed' if done else ('Installing Claude Skill.'
                                                   if lt < 0.9 else 'Installing Claude Skill')
    sub = 'Ready to use' if done else 'Process initiated'
    text_mm(d, (360, 492), title, sans_b(34), (26, 24, 20))
    text_mm(d, (360, 533), sub, sans_r(19), GRAY_TEXT)
    rr(d, [105, 578, 615, 594], 8, fill=(228, 224, 215))
    rr(d, [105, 578, 105 + int(510 * p), 594], 8, fill=CLAY_LIGHT)
    label = 'Complete' if done else 'Downloading components'
    d.text((105, 604), label, font=sans_r(16), fill=GRAY_TEXT)
    d.text((615, 604), f'{int(p * 100)}%', font=sans_b(16), fill=(40, 38, 34), anchor='ra')


def s07_head2(img, t, lt):
    paste_avatar(img, (0, 0, W, H), t, zoom=1.1)


def s08_terminal2(img, t, lt):
    """Claude Code card slides UP into place (measured), prompt types out."""
    img.paste(textured_bg(seed=11), (0, 0))
    slide = int((1 - ease_out(min(1, lt / 0.4))) * 66)
    top = 160 + slide
    box = (75, top, 645, top + 325)
    d = ImageDraw.Draw(img)
    rr(d, [box[0] + 6, box[1] + 10, box[2] + 6, box[3] + 10], 14, fill=(178, 172, 196))
    mac_window(img, box, dark=True, title='Claude Code')
    d = ImageDraw.Draw(img)
    for i in range(4):
        d.rectangle([box[0] + 30 + i * 22, box[1] + 6, box[0] + 42 + i * 22, box[1] + 26],
                    fill=CLAY)
    prompt = 'research where users are dropping off since the previous release (v2.3), and update the dashboard'
    nchars = int(max(0, lt - 0.5) / 0.028)
    shown = prompt[:nchars]
    ln1, ln2 = shown[:52], shown[52:]
    yb = box[3] - 88
    d.line([(box[0] + 14, yb - 12), (box[2] - 14, yb - 12)], fill=(70, 70, 70))
    d.text((box[0] + 20, yb), '>', font=mono_r(15), fill=(150, 150, 150))
    cur = '|' if int(lt * 3) % 2 == 0 and nchars < len(prompt) else ''
    d.text((box[0] + 40, yb), ln1 + ('' if ln2 else cur), font=mono_r(15), fill=(230, 230, 230))
    if ln2:
        d.text((box[0] + 40, yb + 20), ln2 + cur, font=mono_r(15), fill=(230, 230, 230))
    if lt > 2.2:
        blink = 0.75 + 0.25 * math.sin(lt * 5)
        col = tuple(int(c * blink) for c in (220, 175, 95))
        d.text((box[0] + 20, yb - 44), 'Considering...', font=mono_r(15), fill=col)
    d.text((box[0] + 20, box[3] - 34), '>> auto mode on', font=mono_r(14), fill=(212, 160, 60))
    d.text((box[0] + 20 + d.textlength('>> auto mode on', font=mono_r(14)), box[3] - 34),
           ' (shift+tab to cycle) . <- for agents', font=mono_r(14), fill=(140, 130, 100))
    paste_avatar(img, (0, 650, W, H), t, zoom=0.95, corner=100, shift_y=-15)


def s09_plan(img, t, lt):
    """PROPERLY / churning ascii wave with surfing mascot / PLAN pops in."""
    n = int(t * FPS) + 1
    img.paste(Image.new('RGB', (W, H), (252, 252, 251)), (0, 0))
    d = ImageDraw.Draw(img)
    text_mm(d, (360, 262), 'PROPERLY', serif_bi(84), (14, 12, 10))
    cb = mac_window(img, (90, 325, 630, 740), dark=False, title='acme-funnel-fix.json')
    d = ImageDraw.Draw(img)
    chars = '{}":,0123456789tsrcplaifov'
    cx0, cy0 = 360, 590

    def scatter(rnd, count, alpha):
        for _ in range(count):
            a = rnd.uniform(0, math.tau)
            r = abs(rnd.gauss(0, 1))
            if rnd.random() < 0.55:
                px = cx0 - 60 + math.cos(a) * r * 135
                py = cy0 - 65 + math.sin(a) * r * 62 - r * 26
            else:
                px = cx0 + rnd.uniform(-235, 250)
                py = cy0 + 45 + abs(rnd.gauss(0, 26))
            if not (cb[0] + 12 < px < cb[2] - 12 and cb[1] + 16 < py < cb[3] - 14):
                continue
            g = rnd.randint(20, 150)
            d.text((px, py), rnd.choice(chars), font=mono_r(rnd.choice([8, 9, 10, 11])),
                   fill=(g, g, g))

    scatter(random.Random(42), 1800, 255)          # stable body of the wave
    scatter(random.Random(1000 + n), 800, 255)     # churn: re-rolled every frame
    rndb = random.Random(7)
    surf = int(4 * math.sin(lt * 3.1))
    for _ in range(240):
        px = cx0 - 130 + rndb.uniform(0, 190)
        py = cy0 + 18 + rndb.uniform(0, 26) + surf * 0.4
        d.rectangle([px, py, px + 7, py + 7], fill=(126, 168, 222))
    for _ in range(40):
        px = cx0 - 40 + rndb.uniform(0, 70)
        py = cy0 + 14 + rndb.uniform(0, 16) + surf * 0.4
        d.rectangle([px, py, px + 6, py + 6], fill=(214, 108, 166))
    robot(img, 330, 548 + surf, 13)
    if lt > 0.5:
        d = ImageDraw.Draw(img)
        ps = pop_scale(lt - 0.5, 0.22)
        text_mm(d, (360, 1052), 'PLAN', font('LiberationSerif-BoldItalic.ttf',
                                             max(8, int(84 * ps))), (14, 12, 10))


def s10_code(img, t, lt):
    """Claude Code session window scrolling over the avatar lower half."""
    img.paste(Image.new('RGB', (W, H), (16, 16, 17)), (0, 0))
    win = Image.new('RGB', (520, 1300), (24, 24, 27))
    d = ImageDraw.Draw(win)
    d.rectangle([0, 0, 520, 26], fill=(40, 40, 43))
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        d.ellipse([10 + i * 16, 8, 20 + i * 16, 18], fill=c)
    text_mm(d, (270, 13), 'Migrate dashboard to App Router', mono_b(12), (200, 200, 204))
    y = 40
    kw = (199, 120, 221)
    st = (152, 195, 121)
    tx = (171, 178, 191)
    cm = (100, 105, 115)
    lines = [
        (kw, 'export default function Stores() {'),
        (tx, '  const { data } = useSWR<ApiList<Store>>("/api/stores");'),
        (tx, '  return ('), (cm, '  ... +28 lines'), (None, ''),
        (cm, 'Thought for 3s (ctrl+o to expand)'), (None, ''),
        (st, 'Write(apps/dashboard/app/orders/[id]/page.tsx)'),
        (tx, '  Wrote 70 lines to apps/dashboard/app/orders/[id]/page.tsx'),
        (st, '  1  "use client";'), (tx, '  2'),
        (kw, '  3  import { useParams, useRouter } from "next/navigation";'),
        (kw, '  4  import useSWR from "swr";'),
        (kw, '  5  import type { Order, Customer } from "@acme/types";'),
        (kw, '  6  import { Avatar, Badge, Button, Card } from "@acme/ui";'),
        (kw, '  7  import { Shell } from "../../../components/Shell";'),
        (kw, '  8  import { fmtMoney, timeAgo } from "../../../lib/api";'),
        (tx, '  9'),
        (tx, ' 10  type OrderWithCustomer = Order & { customer?: Customer };'),
        (cm, '  ... +76 lines'), (None, ''),
        (tx, "* Now delete dashboard's old pages/ and verify the build:"),
        (None, ''),
        (cm, 'Ran 3 shell commands, thought for 3s (ctrl+o to expand)'),
        (None, ''),
        (tx, '* Build succeeds - every route compiles as a client page'),
        (tx, '  under the App Router shell. Let me verify the actual'),
        (tx, '  rendered HTML by starting the production server:'),
        (None, ''),
        (st, 'Bash(pnpm build && pnpm start)'),
        (cm, '  Ran for 41s (ctrl+o to expand)'),
        (None, ''),
        (tx, '* All routes return 200. The metadata export renders the'),
        (tx, '  correct titles: the shell chrome and the And-time cards'),
        (tx, '  (revenue, orders, average order) all render after hydration.'),
    ]
    for col, s in lines:
        if col:
            d.text((14, y), s, font=mono_r(12), fill=col)
        y += 17
    d.line([(10, y + 6), (510, y + 6)], fill=(70, 70, 72))
    d.text((14, y + 14), '> Try "refactor <filepath>"', font=mono_r(12), fill=(150, 150, 152))
    d.text((14, y + 34), '>> auto mode on', font=mono_r(12), fill=(212, 160, 60))
    scroll = int(ease(lt / 2.6) * 260)
    img.paste(win.crop((0, scroll, 520, scroll + 420)), (100, 140))
    paste_avatar(img, (0, 660, W, H), t, zoom=0.95, shift_y=-20)


def s11_head3(img, t, lt):
    paste_avatar(img, (0, 0, W, H), t, zoom=1.1)


def s12_claudemem(img, t, lt):
    """claude-mem README: slides up in, then slow scroll."""
    img.paste(Image.new('RGB', (W, H), (5, 6, 8)), (0, 0))
    page = Image.new('RGB', (520, 900), PAGE_BG)
    d = ImageDraw.Draw(page)
    d.text((30, 14), 'README', font=sans_b(14), fill=WHITE)
    d.line([(28, 36), (86, 36)], fill=(219, 109, 40), width=3)
    d.text((110, 14), 'Apache-2.0 license', font=sans_r(13), fill=(160, 165, 172))
    d.text((250, 14), 'Security', font=sans_r(13), fill=(160, 165, 172))
    rr(d, [85, 70, 435, 130], 8, fill=(196, 206, 218))
    sun = (219, 109, 40)
    scx, scy = 125, 100
    spin = lt * 0.9
    for i in range(12):
        a = i * math.tau / 12 + spin
        d.line([(scx + 8 * math.cos(a), scy + 8 * math.sin(a)),
                (scx + 17 * math.cos(a), scy + 17 * math.sin(a))], fill=sun, width=3)
    d.text((160, 100), 'claude-mem', font=mono_b(30), fill=(58, 66, 84), anchor='lm')
    rnd = random.Random(3)
    y = 152
    link = (88, 133, 210)
    for row in range(4):
        x = 60 + (row % 2) * 10
        while x < 440:
            wlen = rnd.randint(38, 84)
            d.line([(x, y + 12), (x + wlen, y + 12)], fill=link, width=1)
            d.text((x, y), '.', font=sans_r(11), fill=link)
            x += wlen + 16
        y += 20
    text_mm(d, (260, y + 18), 'Persistent memory compression system built for Claude Code.',
            sans_r(13), (215, 218, 224))
    bx = 120
    for wds, c in [(52, (80, 84, 92)), (66, (60, 110, 210)), (58, (60, 140, 80)),
                   (70, (60, 140, 80)), (54, (150, 60, 130))]:
        rr(d, [bx, y + 36, bx + wds, y + 52], 3, fill=c)
        bx += wds + 6
    rr(d, [160, y + 68, 360, y + 108], 6, outline=(120, 124, 132), width=1)
    text_mm(d, (260, y + 80), 'GITHUB TRENDING', mono_r(10), (170, 174, 182))
    text_mm(d, (260, y + 96), '#1 Repository Of The Day', sans_b(12), WHITE)
    ty = y + 124
    rr(d, [45, ty, 255, ty + 135], 4, outline=(60, 64, 72), width=1)
    d.rectangle([55, ty + 12, 245, ty + 123], fill=(18, 24, 60))
    for i in range(9):
        d.line([(60, ty + 20 + i * 11), (60 + rnd.randint(80, 175), ty + 20 + i * 11)],
               fill=(90, 120, 200), width=2)
    rr(d, [265, ty, 475, ty + 135], 4, outline=(60, 64, 72), width=1)
    d.rectangle([275, ty + 12, 465, ty + 123], fill=(16, 16, 18))
    pts = [(285, ty + 115)]
    for i in range(1, 18):
        px = 285 + i * 10
        py = ty + 115 - (i ** 1.9) * 0.28
        pts.append((px, max(ty + 18, py)))
    d.line(pts, fill=(210, 100, 110), width=2)
    ly = ty + 150
    d.text((260, ly + 8), 'Quick Start . How It Works . Search Tools . Documentation .',
           font=sans_r(12), fill=link, anchor='mm')
    d.text((260, ly + 26), 'Configuration . Troubleshooting . License',
           font=sans_r(12), fill=link, anchor='mm')
    d.text((260, ly + 52), 'Claude-Mem seamlessly preserves context across sessions',
           font=sans_r(12), fill=(200, 204, 210), anchor='mm')
    enter = int((1 - ease_out(min(1, lt / 0.35))) * 46)
    off = int(ease(lt / 1.7) * 80)
    img.paste(page.crop((0, off, 520, off + 660)), (100, 215 + enter))


def s13_starhistory(img, t, lt):
    """Star History: flat tail first, then the curve rips upward (measured)."""
    img.paste(Image.new('RGB', (W, H), WHITE), (0, 0))
    d = ImageDraw.Draw(img)
    scx, scy = 298, 206
    for i in range(10):
        a = i * math.tau / 10 + lt * 0.5
        d.line([(scx + 5 * math.cos(a), scy + 5 * math.sin(a)),
                (scx + 12 * math.cos(a), scy + 12 * math.sin(a))], fill=(219, 140, 40), width=3)
    d.text((315, 206), 'Star History', font=sans_b(19), fill=(30, 28, 26), anchor='lm')
    ax0, ay0, ax1, ay1 = 95, 235, 665, 515
    d.line([(ax0, ay0), (ax0, ay1), (ax1, ay1)], fill=(40, 40, 40), width=2)
    for i, lab in enumerate(['80K', '60K', '40K', '20K']):
        yy = ay0 + 30 + i * 66
        d.text((ax0 - 10, yy), lab, font=sans_r(13), fill=(70, 70, 70), anchor='rm')
    for lab, xx in [('October', 167), ('2026', 355), ('April', 503)]:
        d.text((xx, ay1 + 16), lab, font=sans_r(13), fill=(70, 70, 70), anchor='mm')
    d.text((377, ay1 + 35), 'Date', font=sans_r(13), fill=(70, 70, 70), anchor='mm')
    tmp = Image.new('RGBA', (40, 130), (0, 0, 0, 0))
    ImageDraw.Draw(tmp).text((20, 65), 'GitHub Stars', font=sans_r(13), fill=(70, 70, 70), anchor='mm')
    img.paste(tmp.rotate(90, expand=True).convert('RGB'), (12, 310),
              tmp.rotate(90, expand=True))
    d = ImageDraw.Draw(img)
    rr(d, [105, 246, 285, 277], 3, outline=(50, 50, 50), width=1)
    d.ellipse([115, 257, 124, 266], fill=(216, 90, 60))
    d.text((132, 261), 'thedotmack/claude-mem', font=serif_r(14), fill=(40, 40, 40), anchor='lm')
    d.ellipse([ax0 - 4, ay1 - 4, ax0 + 4, ay1 + 4], fill=(216, 90, 60))
    # two-phase reveal: slow flat tail until ~2.0s, then the climb
    if lt < 2.0:
        frac = 0.34 * ease(lt / 2.0)
    else:
        frac = 0.34 + 0.66 * ease((lt - 2.0) / 1.35)
    pts = []
    for i in range(0, 101):
        u = i / 100
        if u > frac:
            break
        px = ax0 + u * (ax1 - ax0 - 20)
        growth = (math.exp(3.1 * u) - 1) / (math.exp(3.1) - 1)
        wobble = 0.03 * math.sin(u * 21) * u
        py = ay1 - (growth + wobble) * (ay1 - ay0 - 30)
        pts.append((px, py))
    if len(pts) > 1:
        d.line(pts, fill=(216, 90, 60), width=3)
        d.ellipse([pts[-1][0] - 4, pts[-1][1] - 4, pts[-1][0] + 4, pts[-1][1] + 4],
                  fill=(216, 90, 60))
    d.text((565, 540), '* star-history.com', font=sans_r(13), fill=(98, 168, 74))
    paste_avatar(img, (0, 660, W, H), t, zoom=0.95, corner=100, shift_y=-15)


def s14_head4(img, t, lt):
    paste_avatar(img, (0, 0, W, H), t, zoom=1.12)


def s15_impeccable(img, t, lt):
    """Start with /impeccable: steps fade-slide in one by one."""
    img.paste(Image.new('RGB', (W, H), (3, 3, 3)), (0, 0))
    d = ImageDraw.Draw(img)
    x = 80
    d.text((x, 288), 'Start with ', font=sans_b(30), fill=(240, 240, 240))
    off = d.textlength('Start with ', font=sans_b(30))
    d.text((x + off, 290), '/impeccable', font=mono_b(26), fill=(224, 176, 66))
    d.text((x, 330), 'Install, add context, then run one command.', font=sans_r(15),
           fill=(190, 190, 190))
    steps = [
        ('01', 'INSTALL', 'npx impeccable install', 'Run from the project root, then reload your agent.'),
        ('02', 'SET CONTEXT', '/impeccable init', 'Create PRODUCT.md and DESIGN.md.'),
        ('03', 'TRY IT', '/impeccable polish the pricing page', 'Point it at a real page.'),
    ]
    y = 378
    for i, (num, tag, cmd, sub) in enumerate(steps):
        f = ease_out(min(1.0, max(0.0, (lt - 0.15 - i * 0.18) / 0.3)))
        if f > 0:
            dy = int((1 - f) * 18)
            a = f
            def dim(c):
                return tuple(int(ch * a) for ch in c)
            d.text((95, y + 6 + dy), num, font=mono_r(13), fill=dim((224, 176, 66)))
            d.text((131, y + dy), tag, font=mono_r(12), fill=dim((150, 150, 150)))
            d.text((131, y + 18 + dy), cmd, font=mono_b(15), fill=dim((235, 235, 235)))
            d.text((131, y + 40 + dy), sub, font=sans_r(13), fill=dim((170, 170, 170)))
        y += 90
    d.line([(85, y - 12), (635, y - 12)], fill=(40, 40, 40))


def s16_premium(img, t, lt):
    """Premium-references card scrolling a full row over the scene."""
    img.paste(Image.new('RGB', (W, H), (250, 250, 249)), (0, 0))
    card = Image.new('RGB', (520, 1040), (10, 10, 10))
    d = ImageDraw.Draw(card)
    cells = [
        ('dark', 'Lazy "Impact"', ['When in doubt, animate everything. Bouncing', 'buttons, wiggling icons, gradient text, floating', 'badges. Motion without meaning.']),
        ('light', 'Side-Tab Cards', ['A thick colored border on one side of a rounded', 'card. The single most recognizable tell of', 'AI-generated UI.']),
        ('light', 'Cardocalypse', ['Cards inside cards inside cards. Five levels of', 'nesting, each with its own padding and shadow.']),
        ('dark', 'Copy-Paste Layouts', ['The same hero-metric-features template', 'repeated with different colors. When every', 'section looks the same, nothing stands out.']),
        ('light', 'The platform for modern teams', ['Every headline is a variation of the same five', 'words. Platform. Modern. Teams. Faster. Ship.']),
        ('light', 'Why Choose Us', ['Six feature cards with pastel icon chips,', 'identical weight, nothing prioritized.']),
        ('dark', 'Gradient Meshes', ['A purple-to-pink blur behind everything as a', 'substitute for an actual visual identity.']),
        ('light', 'Testimonial Walls', ['Three quotes, three headshots, five stars.', 'Nobody has ever read them.']),
    ]
    rnd = random.Random(9)
    for i, (kind, label, lines) in enumerate(cells):
        col_i, row_i = i % 2, i // 2
        cx0, cy0 = 8 + col_i * 256, 8 + row_i * 256
        thumb = [cx0 + 10, cy0 + 6, cx0 + 238, cy0 + 150]
        if kind == 'dark':
            d.rectangle(thumb, fill=(24, 18, 40))
            d.text(((thumb[0] + thumb[2]) // 2, cy0 + 34), '10X Your Growth',
                   font=sans_b(15), fill=(200, 180, 240), anchor='mm')
            for j in range(3):
                rr(d, [thumb[0] + 14 + j * 72, cy0 + 54, thumb[0] + 78 + j * 72, cy0 + 92], 5,
                   fill=(46, 36, 78))
            rr(d, [thumb[0] + 80, cy0 + 102, thumb[0] + 148, cy0 + 120], 9, fill=(190, 90, 200))
        else:
            d.rectangle(thumb, fill=(248, 248, 248))
            d.text(((thumb[0] + thumb[2]) // 2, cy0 + 24), 'Our Services',
                   font=sans_b(12), fill=(60, 60, 60), anchor='mm')
            for r2 in range(2):
                for c2 in range(2):
                    bx = thumb[0] + 16 + c2 * 108
                    by = cy0 + 40 + r2 * 52
                    rr(d, [bx, by, bx + 92, by + 42], 4, outline=(210, 210, 210), width=1)
                    d.line([(bx + 8, by + 12), (bx + 60, by + 12)], fill=(150, 150, 150))
                    d.line([(bx + 8, by + 24), (bx + 80, by + 24)], fill=(210, 210, 210))
        if label:
            d.text((cx0 + 12, cy0 + 162), label, font=sans_b(15), fill=(240, 240, 240))
            yy = cy0 + 186
            for ln in lines:
                d.text((cx0 + 12, yy), ln, font=sans_r(11), fill=(175, 175, 175))
                yy += 16
    scroll = int(ease(lt / 1.65) * 270)
    card_crop = card.crop((0, scroll, 520, scroll + 660))
    holder = Image.new('RGB', (W, H), (250, 250, 249))
    holder.paste(card_crop, (100, 148))
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rounded_rectangle([100, 148, 620, 808], radius=22, fill=255)
    img.paste(holder, (0, 0), mask)
    d = ImageDraw.Draw(img)
    rr(d, [120, 800, 218, 820], 2, fill=(235, 172, 24))


def s17_slop(img, t, lt):
    """Vibe-coded landing page drifting down; red slash sweeps across."""
    img.paste(Image.new('RGB', (W, H), (3, 3, 3)), (0, 0))
    page = Image.new('RGB', (475, 475), (14, 10, 24))
    d = ImageDraw.Draw(page)
    d.rectangle([0, 0, 475, 22], fill=(20, 16, 30))
    d.text((330, 11), 'Purple gradients, glassmorphism, neon glow',
           font=mono_r(9), fill=(230, 190, 80), anchor='mm')
    d.rectangle([0, 22, 475, 40], fill=(235, 172, 24))
    d.text((8, 26), '+ overused font: Primary font: Inter (100% of text)',
           font=mono_r(9), fill=(20, 20, 20))
    nav = ['Product', 'Solutions', 'Pricing', 'Customers', 'Docs']
    for i, nv in enumerate(nav):
        d.text((85 + i * 62, 56), nv, font=sans_r(11), fill=(200, 200, 210))
    d.text((30, 50), 'Lumina', font=sans_b(12), fill=(180, 120, 240))
    rr(d, [395, 46, 462, 68], 10, fill=(190, 90, 200))
    d.text((428, 57), 'Get started', font=sans_r(9), fill=WHITE, anchor='mm')
    rr(d, [18, 92, 458, 172], 3, outline=(235, 172, 24), width=1)
    d.text((238, 118), 'Build faster with intelligent', font=sans_b(26),
           fill=(226, 190, 250), anchor='mm')
    d.text((238, 150), 'workflows', font=sans_b(26), fill=(180, 140, 245), anchor='mm')
    d.text((238, 196), 'The all-in-one platform that helps modern teams ship better',
           font=sans_r(11), fill=(170, 165, 185), anchor='mm')
    d.text((238, 212), 'products in record time. Powered by AI, designed for humans.',
           font=sans_r(11), fill=(170, 165, 185), anchor='mm')
    rr(d, [120, 240, 245, 272], 6, fill=(172, 74, 220))
    d.text((182, 256), 'Join the waitlist ->', font=sans_b(11), fill=WHITE, anchor='mm')
    rr(d, [258, 240, 356, 272], 6, fill=(240, 240, 240))
    d.text((307, 256), 'Watch demo', font=sans_b(11), fill=(20, 20, 20), anchor='mm')
    d.text((238, 300), 'Backed by top-tier investors', font=sans_r(10),
           fill=(150, 145, 165), anchor='mm')
    for tag, tx, ty in [('gradient text', 42, 84), ('low contrast text', 178, 78),
                        ('dark mode with glow accents', 118, 228)]:
        tw = d.textlength(tag, font=mono_r(8))
        rr(d, [tx, ty, tx + tw + 10, ty + 13], 2, fill=(235, 172, 24))
        d.text((tx + 5, ty + 2), tag, font=mono_r(8), fill=(25, 20, 10))
    drift = int(ease(lt / 2.3) * 14)
    img.paste(page, (120, 218 + drift))
    frac = ease(min(1, lt / 0.5))
    if frac > 0:
        ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(ov)
        x0, y0 = 555, 230 + drift
        x1, y1 = 160, 680 + drift
        xe = x0 + (x1 - x0) * frac
        ye = y0 + (y1 - y0) * frac
        od.line([(x0, y0), (xe, ye)], fill=(225, 20, 30, 235), width=17)
        img.paste(Image.alpha_composite(img.convert('RGBA'), ov).convert('RGB'), (0, 0))


def s18_head5(img, t, lt):
    paste_avatar(img, (0, 0, W, H), t, zoom=1.12)


def s19_taskobserver(img, t, lt):
    """task-observer README slides up in, then drifts (measured)."""
    img.paste(Image.new('RGB', (W, H), (10, 12, 15)), (0, 0))
    page = Image.new('RGB', (560, 900), (13, 17, 22))
    d = ImageDraw.Draw(page)
    d.text((20, 12), 'README', font=sans_b(14), fill=WHITE)
    d.line([(18, 34), (78, 34)], fill=(219, 109, 40), width=3)
    d.text((105, 12), 'CC-BY-4.0 license', font=sans_r(13), fill=(160, 165, 172))
    rr(d, [16, 58, 470, 118], 4, fill=CLAY)
    d.text((24, 64), 'task-observer - One Skill to Rule Them', font=sans_r(24), fill=(240, 244, 248))
    d.text((24, 92), 'All', font=sans_r(24), fill=(240, 244, 248))
    d.line([(16, 126), (544, 126)], fill=(50, 56, 64))
    y = 140
    d.text((16, y), 'The meta-skill that builds and improves all your skills,', font=sans_b(18), fill=WHITE)
    d.text((16, y + 24), 'including itself.', font=sans_b(18), fill=WHITE)
    y += 66
    paras = [
        ['In the first three months of using this meta-skill, it logged and applied',
         'over 600 improvements across my 40 skills, most of which were',
         'themselves created based on observations by the meta-skill.'],
        ['This meta-skill, called "task-observer", is a practical application of the',
         'Augmented Expertise methodology, an AI framework for knowledge',
         'workers. However, users have reported successful integrations into',
         'their Hermes and Openclaw setups, so it works equally well with',
         'autonomous agents.'],
    ]
    for para in paras:
        for ln in para:
            d.text((16, y), ln, font=sans_r(14), fill=(200, 206, 214))
            y += 20
        y += 14
    d.text((16, y), 'Why you should use this meta-skill', font=sans_b(19), fill=WHITE)
    y += 40
    for ln in ['Creating skills is powerful but time-consuming. But the skills that do',
               'get built stay frozen: they never learn from how you actually use them.',
               '',
               "Task Observer fixes those problems. It's a meta-skill that runs",
               'alongside your work, watches what you do, and does two things:']:
        d.text((16, y), ln, font=sans_r(14), fill=(200, 206, 214))
        y += 20
    y += 10
    for ln in ['1.  Creates new skills for you - it spots repeating patterns in your',
               '     work and drafts skill candidates automatically',
               '2.  Improves your existing skills - it notices corrections you make,',
               '     preferences you express, and gaps in your current skills']:
        d.text((26, y), ln, font=sans_r(14), fill=(200, 206, 214))
        y += 20
    enter = int((1 - ease_out(min(1, lt / 0.3))) * 40)
    off = int(ease(lt / 1.4) * 24)
    img.paste(page.crop((0, off, 560, off + 720)), (80, 180 + enter))


def s20_taskcard(img, t, lt):
    """Observer card: pop-in, bobbing mascot, live checklist."""
    img.paste(textured_bg(seed=15), (0, 0))
    card = Image.new('RGBA', (W, 560), (0, 0, 0, 0))
    d = ImageDraw.Draw(card)
    rr(d, [70, 30, 650, 350], 26, fill=CREAM_CARD)
    rr(d, [70, 30, 650, 350], 26, outline=(212, 206, 196), width=1)
    hop = int(abs(math.sin(lt * 2.4)) * 6)
    robot(card, 195, 175 - hop, 14)
    d = ImageDraw.Draw(card)
    d.ellipse([160, 228, 230, 238], fill=(214, 208, 198))
    rr(d, [150, 248 - hop // 2, 246, 270 - hop // 2], 10, fill=(250, 247, 243))
    d.ellipse([158, 256 - hop // 2, 165, 263 - hop // 2], fill=(216, 90, 60))
    d.text((171, 252 - hop // 2), 'Observing tasks...', font=sans_r(11), fill=(90, 86, 80))
    rr(d, [318, 80, 600, 302], 10, fill=(251, 247, 244))
    rr(d, [318, 80, 600, 302], 10, outline=(220, 214, 204), width=1)
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        d.ellipse([328 + i * 10, 88, 334 + i * 10, 94], fill=c)
    d.text((370, 86), 'Claude Code', font=sans_b(11), fill=(70, 66, 60))
    ndone = 1 if lt < 2.2 else 2
    d.text((588, 86), f'{ndone + 1}/6', font=sans_r(10), fill=(140, 136, 130), anchor='ra')
    rows = ['Reading project files', 'Searching codebase', 'Editing components',
            'Running tests', 'Rendering video', 'Committing changes']
    metas = ['128 files', 'running', 'queued', 'queued', 'queued', 'queued']
    y = 120
    for i, (rowt, meta) in enumerate(zip(rows, metas)):
        active = i == ndone
        if active:
            rr(d, [326, y - 8, 592, y + 16], 5, fill=(247, 236, 228))
        if i < ndone:
            d.ellipse([334, y - 2, 350, y + 14], fill=(219, 128, 58))
            d.line([(338, y + 6), (341, y + 10), (347, y + 2)], fill=WHITE, width=2)
        elif active:
            a0 = (lt * 500) % 360
            d.arc([334, y - 2, 350, y + 14], a0, a0 + 260, fill=(219, 128, 58), width=2)
        else:
            d.ellipse([334, y - 2, 350, y + 14], outline=(190, 184, 176), width=2)
        col = (60, 56, 50) if i <= ndone else (150, 146, 140)
        d.text((362, y - 2), rowt, font=sans_r(13), fill=col)
        mtxt = 'running' if active else meta
        mcol = (216, 90, 60) if active else (170, 166, 160)
        d.text((588, y - 1), mtxt, font=mono_r(9) if active else sans_r(10),
               fill=mcol, anchor='ra')
        y += 29
    cs = pop_scale(lt, 0.24)
    if abs(cs - 1) > 0.01:
        cw, chh = int(W * cs), int(560 * cs)
        card = card.resize((cw, chh), Image.LANCZOS)
        img.paste(card, (W // 2 - cw // 2, 170 + (560 - chh) // 2), card)
    else:
        img.paste(card, (0, 170), card)
    paste_avatar(img, (0, 650, W, H), t, zoom=0.95, corner=100, shift_y=-15)


def s21_outro(img, t, lt):
    paste_avatar(img, (0, 0, W, H), t, zoom=1.3, shift_y=40)


SCENES = [s01_title, s02_diagram, s03_head1, s04_skillmd, s05_terminal,
          s06_install, s07_head2, s08_terminal2, s09_plan, s10_code,
          s11_head3, s12_claudemem, s13_starhistory, s14_head4,
          s15_impeccable, s16_premium, s17_slop, s18_head5,
          s19_taskobserver, s20_taskcard, s21_outro]

# Ken Burns strength per scene (push-in amount over the scene's length)
KB = [0.030, 0.035, 0.045, 0.030, 0.030, 0.030, 0.045, 0.030, 0.025, 0.030,
      0.045, 0.040, 0.028, 0.045, 0.030, 0.030, 0.035, 0.045, 0.035, 0.030,
      0.050]


# ---------------------------------------------------------------- captions

def load_captions(path):
    with open(path) as fh:
        return json.load(fh)


STYLE_FONTS = {
    'sans': lambda s: sans_b(s),
    'serif-i': lambda s: serif_bi(s),
}


def draw_captions(img, frame_idx, captions):
    rgba = img.convert('RGBA')
    changed = False
    for ev in captions:
        if not (ev['sf'] <= frame_idx <= ev['ef']):
            continue
        changed = True
        age = (frame_idx - ev['sf']) / FPS
        scale = pop_scale(age)
        for line in ev['lines']:
            f = STYLE_FONTS[line.get('style', 'sans')](line.get('size', 54))
            color = tuple(line.get('color', [0, 0, 0]))
            stroke = line.get('stroke', 0)
            scaled_text(rgba, (W // 2 + line.get('dx', 0), line['y']), line['text'], f,
                        color, scale, stroke=stroke,
                        stroke_fill=(10, 10, 10) if stroke else None)
    if changed:
        img.paste(rgba.convert('RGB'), (0, 0))


# ---------------------------------------------------------------- main

def render(frames_dir, start, end, captions):
    os.makedirs(frames_dir, exist_ok=True)
    for n in range(start, end + 1):
        t = (n - 1) / FPS
        si = 0
        for i in range(len(BOUNDS) - 1):
            if BOUNDS[i] <= t < BOUNDS[i + 1]:
                si = i
                break
        else:
            si = len(SCENES) - 1
        lt = t - BOUNDS[si]
        dur = BOUNDS[si + 1] - BOUNDS[si]
        img = Image.new('RGB', (W, H), (0, 0, 0))
        SCENES[si](img, t, lt)
        img = ken_burns(img, lt, dur, amount=KB[si])
        draw_captions(img, n, captions)
        img.save(os.path.join(frames_dir, f'r_{n:04d}.png'))
        if n % 100 == 0:
            print(f'{n}/{end}', flush=True)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--frames-dir', default='out_frames')
    ap.add_argument('--start', type=int, default=1)
    ap.add_argument('--end', type=int, default=NFRAMES)
    ap.add_argument('--captions', default=os.path.join(os.path.dirname(__file__) or '.',
                                                       'captions.json'))
    a = ap.parse_args()
    caps = load_captions(a.captions) if os.path.exists(a.captions) else []
    render(a.frames_dir, a.start, a.end, caps)
    print('done')
