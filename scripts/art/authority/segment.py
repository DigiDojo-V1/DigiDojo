"""Split the flat Authority image into traceable layers. Works at full resolution (2752 x 1536);
every coordinate below is an image pixel.

Drawn in code, not traced (painted out of every layer here): the viewfinder corners and the rec
dot, the phone-shaped cage, her sweat drops, her pupils, the chai steam, and the cage's floor
shadow (Gemini's sparkle watermark sat on it and on the cage's corner).

Layers, back to front:
  back      static: board, easel, stool, the officer's head, torso, shorts and back leg, tripod and
            phone, chai, keys, her legs and the chair. Filled in under every moving part.
  evidence  the hand holding up the car photo and the evidence bag, the sleeve behind the bag and
            the bag's shadow on the board. Shakes about the shoulder.
  torso     the torso's edge where the sleeve goes behind it, drawn again over the evidence.
  arm       the pointing arm and hand. Jabs about the shoulder.
  shin      the front leg below the knee and the foot. Swings about the knee.
  chappal   the front chappal. Dangles about the toe post.
  thigh     the front thigh, drawn again over the top of the shin.
  her       her upper body: head, hair, torso, arms, phone and the cable. Trembles.
  cable     the charging cable and its plugs, drawn again over her (its loops broke up in her trace).
  whites    her eye whites (with the wet lower rim), in flat colours.
  brows     her brows (the left one merged into her hair in her trace).
  shorts    the officer's shorts outline, used by the component as a clip for its gingham pattern.

Writes one RGBA PNG per layer into the output folder, plus layers.png (a colour-coded overlay) and
geometry.json (measurements the component draws from).
"""
import json
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from scipy.cluster.vq import kmeans2

src, outdir = sys.argv[1], sys.argv[2]
a = np.array(Image.open(src).convert("RGB")).astype(int)
H, W, _ = a.shape
yy, xx = np.mgrid[0:H, 0:W]
BG = np.array((244, 224, 221))


def lum_of(rgb):
    return (rgb[..., 0] * 299 + rgb[..., 1] * 587 + rgb[..., 2] * 114) / 1000


def dist(c, rgb=None):
    rgb = a if rgb is None else rgb
    return np.sqrt(((rgb - np.array(c)) ** 2).sum(-1))


def sizes_of(mask):
    lab, n = ndimage.label(mask)
    return lab, ndimage.sum(mask, lab, range(1, n + 1))


def keep_big(mask, min_px):
    lab, s = sizes_of(mask)
    return np.isin(lab, 1 + np.where(s > min_px)[0])


def largest(mask):
    lab, s = sizes_of(mask)
    return lab == 1 + int(np.argmax(s))


def box(x0, y0, x1, y1):
    return (xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1)


def dil(m, n):
    return ndimage.binary_dilation(m, iterations=n) if n > 0 else m


def ero(m, n):
    return ndimage.binary_erosion(m, iterations=n) if n > 0 else m


def below(p, q):
    """Pixels below the line through p and q."""
    (x0, y0), (x1, y1) = p, q
    return (yy - y0) * (x1 - x0) - (xx - x0) * (y1 - y0) > 0


def left_of(p, q):
    """Pixels left of the line from p (top) to q (bottom)."""
    (x0, y0), (x1, y1) = p, q
    return xx < x0 + (yy - y0) * (x1 - x0) / (y1 - y0)


def rounded_rect(x0, y0, x1, y1, r):
    cx = np.clip(xx, x0 + r, x1 - r)
    cy = np.clip(yy, y0 + r, y1 - r)
    return np.hypot(xx - cx, yy - cy) <= r


def nearest_fill(rgb, target, source):
    """Paint `target` pixels with the colour of the nearest `source` pixel."""
    _, (oy, ox) = ndimage.distance_transform_edt(~source, return_indices=True)
    rgb[target] = rgb[oy[target], ox[target]]


lum = lum_of(a)
sat = a.max(-1) - a.min(-1)

# ---- what the component draws: paint it all out of a clean plate first ----
plate = a.copy()

# The cage: a phone outline (rounded rectangle, 36 px thick) with five 16 px bars and a speaker
# notch. Measured from the image; the component redraws it from these numbers.
CAGE = dict(x0=2040, y0=307, x1=2711, y1=1431, r=103, stroke=36,
            bars=[2161, 2270, 2379, 2488, 2597], bar_w=16,
            notch=dict(x0=2309, y0=356, x1=2446, y1=386), cam=dict(cx=2428, cy=370, r=8))
c = CAGE
s = c["stroke"]
cage = rounded_rect(c["x0"], c["y0"], c["x1"], c["y1"], c["r"]) & ~rounded_rect(
    c["x0"] + s, c["y0"] + s, c["x1"] - s, c["y1"] - s, c["r"] - s)
for bx in c["bars"]:
    cage |= box(bx, c["y0"] + s - 2, bx + c["bar_w"], c["y1"] - s + 2)
n = c["notch"]
cage |= rounded_rect(n["x0"], n["y0"], n["x1"], n["y1"], 15)
cage = dil(cage, 3)

# Viewfinder corners (dark L strokes) and the rec dot.
dark = dist((53, 38, 57)) < 60
corners = np.zeros((H, W), bool)
for b in ((1285, 345, 1425, 485), (1690, 345, 1830, 485), (1285, 800, 1425, 945), (1690, 800, 1830, 945)):
    corners |= largest(dark & box(*b))
corners = dil(corners, 3)
rec = dil(np.hypot(xx - 1354.5, yy - 414.5) <= 14, 3)

# Her sweat drops and the tear: pale blue on her face.
drops = np.zeros((H, W), bool)
for b in ((2403, 572, 2433, 608), (2400, 608, 2430, 645), (2289, 614, 2307, 632)):
    drops |= keep_big(box(*b) & (lum > 165) & (a[..., 2] > a[..., 0] - 10), 8)
drop_boxes = []
for lab_i in range(1, ndimage.label(drops)[1] + 1):
    m = ndimage.label(drops)[0] == lab_i
    ys, xs = np.where(m)
    drop_boxes.append(dict(x0=int(xs.min()), y0=int(ys.min()), x1=int(xs.max()), y1=int(ys.max())))
drop_col = np.median(a[drops & ero(drops, 2)], axis=0)
drops = dil(drops, 3)

# Gemini's sparkle watermark (bottom right): only matters on the cage's shadow, which is redrawn.
paint = cage | corners | rec | drops
nearest_fill(plate, paint, ~dil(paint, 2))
# The cage's frame bordered the background: where the fill is background, it is background.
# The bottom-left corner crossed the top of the easel's left leg; painted out, the leg stopped short
# of the board. It continues up to the board (it leans a little: 1 px in 16).
# (The corner's mask also took the leg's dark top, down to y 942, so copy from below that.)
for y in range(912, 946):
    sx = round((946 - y) / 16)
    plate[y, 1349 + sx:1365 + sx] = plate[946, 1349:1365]
pl = plate


def posterise(rgb, region, k, mode=3, seed=7):
    """Gemini's 'flat' image still has soft gradients (faces, legs, the sweater); traced as they
    are, they come out as blotches. Snap every pixel to a k-colour palette, then a majority filter
    so band edges are smooth. Thin details (cable, packet stripes) survive a 3 px filter."""
    ys, xs = np.where(region)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    sub = rgb[y0:y1, x0:x1].astype(float)
    m = region[y0:y1, x0:x1]
    px = sub[m]
    rng = np.random.default_rng(seed)
    sample = px[rng.choice(len(px), min(len(px), 150000), replace=False)]
    cent, _ = kmeans2(sample, k, minit="++", seed=seed)
    lab = np.zeros(m.shape, int)
    best = np.full(m.shape, np.inf)
    for i, c in enumerate(cent):
        d = ((sub - c) ** 2).sum(-1)
        better = d < best
        best[better], lab[better] = d[better], i
    counts = np.stack([ndimage.uniform_filter(((lab == i) & m).astype(float), mode) for i in range(k)])
    lab = np.where(m, counts.argmax(0), lab)
    out = rgb.copy()
    out[y0:y1, x0:x1][m] = np.rint(cent[lab[m]]).astype(int)
    return out



bg = keep_big(dist(BG, pl) < 13, 30)
fg = ~bg & box(1240, 330, 2752, 1500) & ~box(2560, 1340, 2752, 1536)  # sparkle corner: shadow redrawn
fg = keep_big(fg, 400)

# The khaki uniform (torso and both sleeves), snapped to four flat tones shared across the cuts at
# the shoulders: traced apart, the pointing arm came out a different khaki with a seam.
r_, g_, b_ = pl[..., 0], pl[..., 1], pl[..., 2]
khaki = box(1440, 640, 1945, 925) & fg & (r_ > 95) & (b_ < 120) & (r_ - g_ > 10) & (r_ - g_ < 50) & (r_ - b_ > 40)
khaki = keep_big(khaki, 400)
pl = posterise(pl, khaki, 4, mode=5)

# ---- the board: its colour by row (a light top and a darker band), for fills under the bag ----
BOARD = (1326, 386, 1790, 912)
board_rect = box(*BOARD)
LIGHT, DEEP = np.array((121, 152, 192)), np.array((95, 130, 176))
board_px = board_rect & ((dist(LIGHT, pl) < 14) | (dist(DEEP, pl) < 14))
board_row = np.zeros((H, 3))
for y in range(BOARD[1], BOARD[3]):
    row = board_px[y]
    if row.sum() > 20:
        board_row[y] = np.median(pl[y][row], axis=0)
board_like = board_rect & ((dist(LIGHT, pl) < 30) | (dist(DEEP, pl) < 30))

# ---- the evidence: photo, fist, bag, the sleeve behind it, and the bag's shadow on the board ----
TORSO_EDGE = ((1497, 640), (1488, 800))  # the torso's left edge: the sleeve goes behind it
ev_zone = box(1345, 420, 1530, 812) & board_rect & left_of(*TORSO_EDGE)
evidence = ev_zone & fg & ~board_px
evidence = keep_big(ndimage.binary_opening(evidence, iterations=1), 300)
evidence = ndimage.binary_fill_holes(evidence)
torso_cap = fg & box(1480, 640, 1545, 812) & ~left_of(*TORSO_EDGE) & ~board_like
torso_cap = keep_big(torso_cap, 200)

# ---- the pointing arm: right of the shoulder, above the line of its underside ----
ARM_TOP = ((1680, 676), (1940, 585))
ARM_BOTTOM = ((1690, 740), (1790, 703))
arm = box(1685, 580, 1942, 760) & fg & ~board_like & below(*ARM_TOP)
arm &= ~(below(*ARM_BOTTOM) & (xx < 1795)) & ~((xx >= 1795) & (yy >= 708))  # the fist hangs lower
arm &= ~((pl[..., 2] > pl[..., 0] + 10) & (lum < 110))  # the phone on the tripod
arm = largest(ndimage.binary_opening(arm, iterations=1))
arm = ndimage.binary_fill_holes(arm)

# ---- the front leg: the shin and foot swing about the knee; the chappal dangles ----
KNEE = ((1782, 1030), (1852, 1000))  # the cut, from the back of the knee to its front
green = dist((59, 108, 78)) < 50
leg_zone = box(1690, 935, 1935, 1300) & fg
chappal = keep_big(leg_zone & green & (yy > 1170), 300)
chappal = ndimage.binary_closing(chappal, iterations=1) & fg
# The whole front leg as one shape (thigh, knee, shin, foot), so the knee pit's shading isn't lost
# between two colour tests; then cut at the knee.
skinish = (pl[..., 0] - pl[..., 2] > 40) & (pl[..., 0] > 110) & (pl[..., 0] - pl[..., 1] < 105) & ~green
# (with the chappal, so the toes beyond its strap stay part of the foot)
leg = largest((leg_zone & skinish & ~(dist((157, 127, 116), pl) < 25)) | chappal) & ~chappal
leg = ndimage.binary_fill_holes(ndimage.binary_closing(leg, iterations=2)) & fg & ~chappal
# Its soft shading, snapped to three flat tones shared by the thigh and the shin: traced
# separately, they came out as two different browns with a seam at the knee.
leg_rgb = posterise(pl, leg, 3, mode=7)
# The shin and foot, plus the toes beyond the strap (joined through the chappal). The stool leg's
# shaded edge passes the skin test too; it isn't joined, so it stays out.
shin = largest((leg & below(*KNEE)) | chappal) & ~chappal
thigh = leg & ~below(*KNEE)

# ---- her: everything above the waist, plus the cable hanging over her lap ----
WAIST = 1012
chair = box(2508, 740, 2580, 1100) & (dist((165, 134, 114), pl) < 40)
her = fg & box(2130, 430, 2575, WAIST) & ~chair
# The charging cable, wrist loops to both plugs. Its white is close to the background's, so it is
# found by being neutral (the background is pink: red 20 above green), not by fg.
cable_px = box(2150, 820, 2335, 1190) & (lum_of(pl) > 185) & ((pl.max(-1) - pl.min(-1)) < 45)
cable_px &= (pl[..., 0] - pl[..., 1] < 12) | (pl[..., 1] >= 231)
cable_px = keep_big(cable_px, 40)
# The plugs' grey metal ends (and their contact slots), where they touch the cable.
metal = box(2150, 820, 2335, 1190) & ((pl.max(-1) - pl.min(-1)) < 30) & (lum_of(pl) > 90) & (lum_of(pl) <= 200)
metal = ndimage.binary_closing(metal, iterations=1)
lab, nm = ndimage.label(metal)
touch = np.unique(lab[dil(cable_px, 2) & (lab > 0)])
cable_px |= np.isin(lab, touch[touch > 0])
holes = ndimage.binary_fill_holes(cable_px) & ~cable_px
lab, nh = ndimage.label(holes)
small = np.isin(lab, 1 + np.where(ndimage.sum(holes, lab, range(1, nh + 1)) < 30)[0]) & (lab > 0)
cable_px |= small  # the plugs' contacts, not the loops' insides
cable_px = keep_big(cable_px, 60)
cable_px = dil(cable_px, 1) & (cable_px | ~bg)
her = keep_big(her, 2000) | cable_px
# Where a bar crossed her edge, the paint-out left 1-2 px slivers of hair beside it.
bar_zone = np.zeros((H, W), bool)
for bx in CAGE["bars"]:
    bar_zone |= box(bx - 4, 0, bx + CAGE["bar_w"] + 4, H)
her &= ~(bar_zone & ~ndimage.binary_opening(her, iterations=3))
her = ndimage.binary_fill_holes(her)

# ---- her eyes: whites (with the pale blue rim), and pupils ----
eye_zone = box(2285, 568, 2410, 620)
whites = keep_big(eye_zone & ((lum_of(pl) > 180) & (sat < 45)), 60)
pup = keep_big(eye_zone & (lum_of(pl) < 60) & dil(whites, 3), 20)
eyes = ndimage.binary_fill_holes(ndimage.binary_closing(whites | pup, iterations=3)) & eye_zone
eyes = ndimage.binary_opening(eyes, iterations=2)
# The left eye is whole; the right one had a bar across it. It is the same shape (Gemini drew them
# as twins), so the left eye is copied across.
EYE_DX = 66
lab, ne = ndimage.label(eyes)
left_eye = largest(eyes & (xx < 2345))
eyes = left_eye | np.roll(left_eye, EYE_DX, axis=1)
ys, xs = np.where(left_eye)
lp = pup & left_eye
pys, pxs = np.where(lp)
eye_list = [dict(cx=float(xs.mean()) + dx, cy=float(ys.mean()), rx=float((xs.max() - xs.min() + 1) / 2),
                 ry=float((ys.max() - ys.min() + 1) / 2)) for dx in (0, EYE_DX)]
pupil = dict(dx=float(pxs.mean() - xs.mean()), dy=float(pys.mean() - ys.mean()), r=float(np.sqrt(lp.sum() / np.pi)))
eye_white = np.median(pl[left_eye & ero(whites, 2) & (pl[..., 0] > 245)], axis=0)
# The wet lower rim: a flat-topped band along the bottom of the eye (the pupil cut a notch in it).
rim = left_eye & (yy >= ys.mean() + 10)
rim_col = np.median(pl[rim & ero(rim, 1)], axis=0)
rim = rim | np.roll(rim, EYE_DX, axis=1)
whites_rgb = np.zeros_like(pl)
whites_rgb[:] = eye_white
whites_rgb[rim] = rim_col

# ---- back: everything else, filled in under each moving part ----
moving = evidence | arm | shin | chappal | her
back_rgb = pl.copy()
back = fg & ~moving


def underfill(mask, depth, empty=False):
    """The back under a moving part: a band from 2 px outside its edge to `depth` inside (how far
    it moves), filled with the nearest back colour (the board by row, on the board). Where that is
    background, it stays empty. `empty`: nothing behind it but background."""
    global back
    band = dil(mask, 2) & ~ero(mask, depth)
    if empty:
        back &= ~band
        return
    # the background is a source too: where it is nearest, the band stays empty
    # (pure background counts even right beside the part, or a narrow pink gap between the cable
    # and her trousers filled in as trousers)
    nearest_fill(back_rgb, band, (back & ~dil(mask, 3)) | (bg & ~mask))
    on_board = band & board_rect & (
        (dist(LIGHT, back_rgb) < 32) | (dist(DEEP, back_rgb) < 32) | (dist(BG, back_rgb) < 14))
    back_rgb[on_board] = board_row[yy[on_board]]
    gone = band & ~on_board & (dist(BG, back_rgb) < 16)
    back = (back | band) & ~gone


underfill(evidence, 16)
underfill(arm, 18)
# Nothing but background behind the shin and the chappal (the easel leg passes behind the knee,
# under the thigh), so only the 2 px ring round them is refilled: emptied, it bit a notch out of
# the easel leg.
underfill(shin, 0)
# Right of the easel there is only background: the ring's fill there was blends of skin, chappal
# and background (an olive sliver at the toe once the leg swung).
back &= ~(dil(shin | chappal, 2) & ~shin & ~chappal & (xx >= 1795) & (yy > 1040))
back &= ~(chappal | shin)
underfill(her, 6)
# Under the cable, where it mostly crosses background, leave the back empty: filled with the
# trousers' colour, the strip under it closed off the pink gap beside them, and the tracer (which
# draws shapes without holes) filled that gap in as trousers.
under_cable = dil(cable_px, 2) & ~(her & ~cable_px)
outside = ~cable_px
bg_frac = ndimage.uniform_filter((bg & outside).astype(float), 15) / np.maximum(
    ndimage.uniform_filter(outside.astype(float), 15), 1e-6)
back &= ~(under_cable & (bg_frac > 0.3))
back |= thigh  # the shin's band ate the thigh's edge
back_rgb[thigh] = leg_rgb[thigh]
# The cage's floor shadow is redrawn as an ellipse (Gemini's sparkle sat on it); things standing
# on it stay.
cage_shadow = keep_big(box(2000, 1395, 2752, 1500) & (dist((210, 162, 158), pl) < 16), 2000)
shadow_rim = dil(cage_shadow, 3) & (dist((210, 162, 158), pl) + dist(BG, pl) < 70)
back &= ~(cage_shadow | shadow_rim)

# Under the eyes inside her layer: plain eye white (the whites layer redraws them).
her_rgb = pl.copy()
her_rgb[dil(eyes, 1)] = eye_white

# Her brows, drawn again over her face: traced with the hair, the left one (which nearly touches
# it) merged into the hair's shape under the face and vanished.
brow_zone = box(2292, 545, 2412, 575) & her
lab, nb = ndimage.label(brow_zone & (lum_of(pl) < 75))
brows = np.zeros((H, W), bool)
for i in range(1, nb + 1):
    m = lab == i
    ys, xs = np.where(m)
    if 20 < m.sum() < 900 and ys.min() > 545 and ys.max() < 574:
        brows |= m
brows_col = np.median(pl[brows], axis=0)

# ---- moving parts: extend each under whatever covers its cut edge ----
ev_rgb = pl.copy()
under_torso = dil(evidence, 14) & torso_cap & ~dil(board_like, 1)
nearest_fill(ev_rgb, under_torso, evidence & ~dil(under_torso, 2))
evidence_all = evidence | under_torso

shin_rgb = leg_rgb.copy()
under_thigh = thigh & dil(shin, 24) & ~below((1782, 1004), (1852, 974))
nearest_fill(shin_rgb, under_thigh, ero(shin, 2) & ~dil(under_thigh, 2))
# under the chappal, the foot continues (but not out into the background)
_, (oy, ox) = ndimage.distance_transform_edt(~(shin | bg), return_indices=True)
foot_under = chappal & shin[oy, ox]
nearest_fill(shin_rgb, foot_under, shin & ~dil(chappal, 1))
shin_all = shin | under_thigh | foot_under
# Skin the chappal encloses (between the strap and the sole) belongs to the foot.
enclosed = ndimage.binary_fill_holes(shin_all | chappal) & ~shin_all & ~chappal
shin_all |= enclosed

arm_rgb = pl.copy()


def defringe(rgb, mask, width=3):
    """Edge pixels that blend this layer with whatever is next to it trace as a halo once the part
    moves. Replace them with the nearest solid interior colour."""
    inner = ero(mask, width)
    band = mask & ~inner
    _, (iy, ix) = ndimage.distance_transform_edt(~inner, return_indices=True)
    _, (oy, ox) = ndimage.distance_transform_edt(mask, return_indices=True)
    c_in = rgb[iy, ix].astype(float)
    c_out = pl[oy, ox].astype(float)
    c_out[bg[oy, ox]] = BG
    v = c_out - c_in
    t = ((rgb - c_in) * v).sum(-1) / np.maximum((v * v).sum(-1), 1)
    bad = band & (t > 0.18) & ((v * v).sum(-1) > 400)
    rgb[bad] = c_in[bad]


defringe(ev_rgb, evidence_all)
defringe(arm_rgb, arm)
defringe(shin_rgb, shin_all)
chap_rgb = pl.copy()
defringe(chap_rgb, chappal)
thigh_rgb = leg_rgb.copy()
defringe(thigh_rgb, thigh)
torso_rgb = pl.copy()
defringe(torso_rgb, torso_cap)
defringe(her_rgb, her)
defringe(back_rgb, back)


def kuwahara(rgb):
    """Edge-preserving smoothing: snaps 1-2 px blends between flat colours to one side, or they
    trace as outlines of an in-between colour."""
    f = rgb.astype(float)
    mean = np.stack([ndimage.uniform_filter(f[..., c], 3) for c in range(3)], -1)
    sq = np.stack([ndimage.uniform_filter(f[..., c] ** 2, 3) for c in range(3)], -1)
    var = (sq - mean ** 2).sum(-1)
    best_var = np.full(var.shape, np.inf)
    out = f.copy()
    for oy_ in (-1, 1):
        for ox_ in (-1, 1):
            v = np.roll(var, (oy_, ox_), (0, 1))
            m = np.roll(mean, (oy_, ox_), (0, 1))
            better = v < best_var
            best_var[better] = v[better]
            out[better] = m[better]
    return out


def save(name, rgb, mask, median=True, snap=False):
    if snap:
        rgb = kuwahara(rgb)
    im = Image.fromarray(rgb.clip(0, 255).astype(np.uint8))
    if median:
        im = im.filter(ImageFilter.MedianFilter(3))
    rgba = im.convert("RGBA")
    rgba.putalpha(Image.fromarray((mask * 255).astype(np.uint8)))
    rgba.save(f"{outdir}/{name}.png")


# The shorts' gingham is redrawn by the component as a 20 px pattern over a flat base: traced, the
# checks came out as a jumble of bricks. Folds and the crease stay as darker flat shapes.
shorts = back & box(1490, 912, 1815, 1090) & (a[..., 2] - a[..., 0] > 55) & (a[..., 2] > 110)
shorts = ndimage.binary_fill_holes(ndimage.binary_closing(keep_big(shorts, 3000), iterations=2)) & back
xl = (xx - 18) % 20 < 10
yl = (yy - 5) % 20 < 10
core = shorts & ero(shorts, 3) & (lum > 85)
gingham = {k: np.median(a[core & m], axis=0) for k, m in
           dict(light=xl & yl, single=xl ^ yl, both=~xl & ~yl).items()}
fold = shorts & (lum < 85)
back_rgb[shorts & ~fold] = gingham["light"]
fold_col = np.median(a[fold & ero(fold, 1)], axis=0) if fold.sum() > 50 else gingham["both"]
back_rgb[fold] = np.clip(fold_col * gingham["light"] / gingham["both"], 0, 255)

# Specks of background colour the fills left behind (one sat beside a bar, by her face).
back &= ~(dist(BG, back_rgb) < 14)
back = keep_big(back, 50)
save("back", back_rgb, back, snap=True)
save("evidence", ev_rgb, evidence_all, snap=True)
save("torso", torso_rgb, torso_cap)
save("arm", arm_rgb, arm, snap=True)
save("shin", shin_rgb, shin_all)
save("chappal", chap_rgb, chappal)
save("thigh", thigh_rgb, thigh)
save("her", her_rgb, her, snap=True)
# The cable, drawn again over her: in her trace its thin loops broke up.
cable_rgb = posterise(pl, cable_px, 3, mode=3)
defringe(cable_rgb, cable_px, 2)
save("cable", cable_rgb, cable_px, median=False)
save("whites", whites_rgb, eyes, median=False)
br = np.zeros_like(pl); br[:] = brows_col
save("brows", br, dil(brows, 1) & ~ero(np.zeros_like(brows), 0), median=False)
sh = np.zeros_like(pl); sh[:] = 0
save("shorts", sh, shorts, median=False)

hexc = lambda v: "#%02x%02x%02x" % tuple(int(round(c)) for c in v)  # noqa: E731
geometry = dict(gingham={k: hexc(v) for k, v in gingham.items()}, cage=CAGE, eyes=eye_list, pupil=pupil, drops=drop_boxes,
                drop_colour="#%02x%02x%02x" % tuple(int(v) for v in drop_col),
                pupil_colour="#%02x%02x%02x" % tuple(int(v) for v in np.median(pl[lp & ero(lp, 1)], axis=0)))
json.dump(geometry, open(f"{outdir}/geometry.json", "w"), indent=1)

vis = (a * 0.35).astype(np.uint8)
for m, col in ((back, (60, 160, 255)), (evidence_all, (255, 200, 0)), (torso_cap, (255, 120, 0)),
               (arm, (255, 0, 80)), (shin_all, (0, 220, 120)), (chappal, (0, 120, 60)), (thigh, (160, 255, 160)),
               (her, (255, 0, 255)), (eyes, (255, 255, 255)), (paint, (255, 255, 0))):
    vis[m] = (vis[m] * 0.4 + np.array(col) * 0.6).astype(np.uint8)
Image.fromarray(vis).crop((1240, 290, 2752, 1500)).save(f"{outdir}/layers.png")
print({k: int(v.sum()) for k, v in dict(back=back, evidence=evidence_all, torso=torso_cap, arm=arm, shin=shin_all,
                                         chappal=chappal, thigh=thigh, her=her, eyes=eyes).items()})
