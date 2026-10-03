"""Build the Career Through logo files.

    python scripts/gen-brand.py <Outfit[wght].ttf> <Inter[opsz,wght].ttf> [out_dir]

The mark is drawn from geometry (an isometric grid: 30 degree lines and verticals), the
wordmark is set in Outfit and converted to outlines, so the SVGs need no font installed.
Needs: fonttools, uharfbuzz. PNGs and the favicon are rendered separately.
"""
import math
import sys
import tempfile
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

OUT = Path(sys.argv[3] if len(sys.argv) > 3 else "public/brand")
OUT.mkdir(parents=True, exist_ok=True)

# ── The mark ───────────────────────────────────────────────────
C30, S30 = math.cos(math.radians(30)), math.sin(math.radians(30))
T = 220.0  # vertical thickness of the ribbon


def along(p, dx, slope):
    """Move dx horizontally along a line of the given slope."""
    return (p[0] + dx, p[1] + dx * slope)


UP, DOWN = -S30 / C30, S30 / C30  # slopes of the two isometric directions
I = (300.0, 400.0)  # inner corner of the chevron
E_IN = along(I, 415, UP)  # top band, inner edge, right end
A3 = (E_IN[0] - 190.0, E_IN[1] - 190.0 * DOWN)  # end cut runs back up-left to the upper edge
B = along(I, 225, DOWN)  # bottom band, inner edge, right end
C = (B[0], B[1] + T)
O = (I[0] - T / DOWN, I[1])  # where the two outer edges would meet, before rounding
DL = along(I, -190.5, UP)  # left corner of the dark face

TR = (805.0, 185.0)  # arrow: top right
BR = (805.0, 580.0)
BL = along(BR, -193, UP)
N1 = (BL[0], 386.0)  # the notch under the arrow head
TIP = (TR[0] - (N1[1] - TR[1]) / -UP, N1[1])


def rounded(points, radii):
    """A closed path through `points` with each corner rounded by its radius."""
    n = len(points)
    d = []
    for i, (p, r) in enumerate(zip(points, radii)):
        a, b = points[i - 1], points[(i + 1) % n]
        va = (a[0] - p[0], a[1] - p[1])
        vb = (b[0] - p[0], b[1] - p[1])
        la, lb = math.hypot(*va), math.hypot(*vb)
        ua, ub = (va[0] / la, va[1] / la), (vb[0] / lb, vb[1] / lb)
        angle = math.acos(max(-1, min(1, ua[0] * ub[0] + ua[1] * ub[1])))
        t = min(r / math.tan(angle / 2), la / 2, lb / 2) if r else 0
        rr = t * math.tan(angle / 2)
        p1 = (p[0] + ua[0] * t, p[1] + ua[1] * t)
        p2 = (p[0] + ub[0] * t, p[1] + ub[1] * t)
        sweep = 1 if (ua[0] * ub[1] - ua[1] * ub[0]) < 0 else 0
        d.append(f"{'M' if i == 0 else 'L'}{p1[0]:.1f} {p1[1]:.1f}")
        if t:
            d.append(f"A{rr:.1f} {rr:.1f} 0 0 {sweep} {p2[0]:.1f} {p2[1]:.1f}")
    return "".join(d) + "Z"


RIBBON = rounded([A3, E_IN, I, B, C, O], [26, 26, 5, 26, 26, 120])
FOLD = rounded([I, B, C, DL], [0, 26, 26, 46])  # the darker underside of the ribbon
ARROW = rounded([TIP, TR, BR, BL, N1], [12, 44, 30, 8, 6])
BOX = (36, 44, 774, 712)  # x, y, width, height of the mark in its own units


def mark_defs(uid):
    return f"""<linearGradient id="{uid}a" gradientUnits="userSpaceOnUse" x1="700" y1="110" x2="40" y2="470"><stop offset="0" stop-color="#1e92fd"/><stop offset=".55" stop-color="#1371fc"/><stop offset="1" stop-color="#1a45fc"/></linearGradient>
<linearGradient id="{uid}b" gradientUnits="userSpaceOnUse" x1="140" y1="470" x2="530" y2="715"><stop offset="0" stop-color="#020c55"/><stop offset=".45" stop-color="#1024b2"/><stop offset=".85" stop-color="#9455fc"/><stop offset="1" stop-color="#b47bfc"/></linearGradient>
<linearGradient id="{uid}c" gradientUnits="userSpaceOnUse" x1="360" y1="0" x2="530" y2="0"><stop offset="0" stop-color="#c9b0ff" stop-opacity="0"/><stop offset="1" stop-color="#c9b0ff" stop-opacity=".45"/></linearGradient>
<linearGradient id="{uid}d" gradientUnits="userSpaceOnUse" x1="500" y1="310" x2="810" y2="610"><stop offset="0" stop-color="#1a28cf"/><stop offset=".35" stop-color="#3147f6"/><stop offset=".7" stop-color="#7a3dfb"/><stop offset="1" stop-color="#ad78fc"/></linearGradient>"""


def mark_shapes(uid):
    return f'<path fill="url(#{uid}a)" d="{RIBBON}"/><path fill="url(#{uid}b)" d="{FOLD}"/><path fill="url(#{uid}c)" d="{FOLD}"/><path fill="url(#{uid}d)" d="{ARROW}"/>'


def mark_mono(color):
    return f'<path fill="{color}" d="{RIBBON}"/><path fill="{color}" d="{ARROW}"/>'


def place(inner, x, y, height):
    """The mark, scaled to `height`, with its top-left corner at (x, y). Returns (svg, width)."""
    k = height / BOX[3]
    return f'<g transform="translate({x - BOX[0] * k:.2f} {y - BOX[1] * k:.2f}) scale({k:.5f})">{inner}</g>', BOX[2] * k


# ── The wordmark, as outlines ──────────────────────────────────
def instance(path, **axes):
    font = instantiateVariableFont(TTFont(path), axes)
    tmp = tempfile.NamedTemporaryFile(suffix=".ttf", delete=False)
    font.save(tmp.name)
    return tmp.name


def outline(text, font_path, size, x=0.0, y=0.0, tracking=0.0):
    """`text` as one SVG path with its baseline starting at (x, y). Returns (d, width)."""
    font = TTFont(font_path)
    glyphs, order, k = font.getGlyphSet(), font.getGlyphOrder(), size / font["head"].unitsPerEm
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hb.Font(hb.Face(Path(font_path).read_bytes())), buf)
    d, pen_x = [], x
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        pen = SVGPathPen(glyphs, ntos=lambda v: f"{v:.1f}")
        glyphs[order[info.codepoint]].draw(TransformPen(pen, (k, 0, 0, -k, pen_x + pos.x_offset * k, y - pos.y_offset * k)))
        d.append(pen.getCommands())
        pen_x += pos.x_advance * k + tracking * size
    return "".join(d), pen_x - tracking * size - x


BOLD = instance(sys.argv[1], wght=700)
MEDIUM = instance(sys.argv[2], wght=500, opsz=14)
INK, WHITE = "#0c0c14", "#ffffff"
WORD_GRADIENT = '<linearGradient id="w" gradientUnits="userSpaceOnUse" x1="{x1:.1f}" y1="0" x2="{x2:.1f}" y2="0"><stop offset="0" stop-color="#1d6bfb"/><stop offset=".6" stop-color="#5b4dfb"/><stop offset="1" stop-color="#9a45fc"/></linearGradient>'


def svg(width, height, defs, body, view=None):
    view = view or f"0 0 {width:.0f} {height:.0f}"
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" width="{width:.0f}" height="{height:.0f}" role="img" aria-label="Career Through"><defs>{defs}</defs>{body}</svg>\n'


def write(name, content):
    (OUT / name).write_text(content, encoding="utf-8")
    print("wrote", OUT / name)


# The mark on its own.
view = f"{BOX[0]} {BOX[1]} {BOX[2]} {BOX[3]}"
write("mark.svg", svg(BOX[2], BOX[3], mark_defs("m"), mark_shapes("m"), view))
write("mark-white.svg", svg(BOX[2], BOX[3], "", mark_mono(WHITE), view))
write("mark-ink.svg", svg(BOX[2], BOX[3], "", mark_mono(INK), view))


# One line: mark, then "Career Through".
def horizontal(name, career, through, mark):
    size, pad = 76, 8
    m, mw = place(mark, pad, pad, 104)
    x = pad + mw + 26
    c, cw = outline("Career", BOLD, size, x, 86, -0.015)
    t, tw = outline("Through", BOLD, size, x + cw + size * 0.14, 86, -0.015)
    x2 = x + cw + size * 0.14 + tw
    defs = mark_defs("m") + WORD_GRADIENT.format(x1=x + cw, x2=x2)
    write(name, svg(x2 + pad, 120, defs, f'{m}<path fill="{career}" d="{c}"/><path fill="{through}" d="{t}"/>'))


horizontal("logo.svg", INK, "url(#w)", mark_shapes("m"))
horizontal("logo-on-dark.svg", WHITE, "url(#w)", mark_shapes("m"))
horizontal("logo-white.svg", WHITE, WHITE, mark_mono(WHITE))
horizontal("logo-ink.svg", INK, INK, mark_mono(INK))


# The full lockup: mark, two-line wordmark, tagline.
def stacked(name, career, tagline_color):
    pad, size = 16, 168
    m, mw = place(mark_shapes("m"), pad, pad + 14, 330)
    x = pad + mw + 44
    c, cw = outline("Career", BOLD, size, x, pad + 150, -0.02)
    t, tw = outline("Through", BOLD, size, x, pad + 150 + size * 0.86, -0.02)
    g, gw = outline("SKILLS TODAY. BETTER TOMORROW.", MEDIUM, 24, x + 4, pad + 150 + size * 0.86 + 84, 0.32)
    width = x + max(cw, tw, gw + 4) + pad
    defs = mark_defs("m") + WORD_GRADIENT.format(x1=x, x2=x + tw)
    write(name, svg(width, 2 * pad + 380, defs, f'{m}<path fill="{career}" d="{c}"/><path fill="url(#w)" d="{t}"/><path fill="{tagline_color}" d="{g}"/>'))


stacked("logo-stacked.svg", INK, "#3a4070")
stacked("logo-stacked-on-dark.svg", WHITE, "#aab2e0")


# App icons: the mark on a rounded square.
def app_icon(name, background, extra=""):
    height = 296
    width = BOX[2] * height / BOX[3]
    m, _ = place(mark_shapes("m"), (512 - width) / 2 - 4, (512 - height) / 2, height)
    write(name, svg(512, 512, mark_defs("m") + background, f'<rect width="512" height="512" rx="116" fill="url(#bg)"/>{extra}{m}'))


app_icon("app-icon-light.svg", '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e9edff"/></linearGradient>')
app_icon(
    "app-icon-dark.svg",
    '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#151b45"/><stop offset="1" stop-color="#070914"/></linearGradient>'
    '<radialGradient id="glow" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#5b4dfc" stop-opacity=".45"/><stop offset="1" stop-color="#5b4dfc" stop-opacity="0"/></radialGradient>',
    '<rect width="512" height="512" rx="116" fill="url(#glow)"/><rect x="1.5" y="1.5" width="509" height="509" rx="114.5" fill="none" stroke="#8f8cff" stroke-opacity=".35" stroke-width="3"/>',
)
