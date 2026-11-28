"""Split the flat Trust Me Bro image into traceable layers. Works at full resolution (2752 x 1536);
every coordinate below is an image pixel.

Layers, back to front:
  floor    the user's floor shadow, a flat ellipse.
  back     static: wall, pillar with its hole, the scammer's floor shadow, the scammer (minus the
           cut-out) and the user (minus his head, raised arm and thumb). The string is painted out
           (the component draws it); so are Gemini's stray V strokes on the user's forearm.
           Filled in under the cut-out (his face, hood and hoodie continue), under his eyes
           (eye white), under the user's head (neck), and under the thumb (screen and palm).
  cutout   the printed face on its stick. Bobs and tilts about the fist.
  fist     the scammer's fist, drawn again over the stick.
  whites / pupils   the scammer's eyes, in flat colours.
  head     the user's hair, face and ear, cut at the jaw. Nods as he laughs. Extended under the can.
  arm      the user's raised arm, hand and can, drawn over his head.
  thumb    the user's top digit over the phone. Hovers and taps the pay button.

Writes one RGBA PNG per layer into the output folder, plus layers.png (a colour-coded overlay).
"""
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

src, outdir = sys.argv[1], sys.argv[2]
a = np.array(Image.open(src).convert("RGB")).astype(int)
H, W, _ = a.shape
r, g, b = a[..., 0], a[..., 1], a[..., 2]
yy, xx = np.mgrid[0:H, 0:W]
lum = (r * 299 + g * 587 + b * 114) / 1000
sat = a.max(-1) - a.min(-1)
BG = np.array((230, 221, 242))
UPWARD = np.array([[0, 1, 0], [0, 1, 0], [0, 0, 0]])


def dist(c):
    return np.sqrt(((a - np.array(c)) ** 2).sum(-1))


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


def near_segment(p, q, width):
    (x0, y0), (x1, y1) = p, q
    dx, dy = x1 - x0, y1 - y0
    t = np.clip(((xx - x0) * dx + (yy - y0) * dy) / (dx * dx + dy * dy), 0, 1)
    return np.hypot(xx - x0 - t * dx, yy - y0 - t * dy) < width


def nearest_fill(rgb, target, source):
    """Paint `target` pixels with the colour of the nearest `source` pixel; returns the distances."""
    d, (oy, ox) = ndimage.distance_transform_edt(~source, return_indices=True)
    rgb[target] = rgb[oy[target], ox[target]]
    return d


def defringe(rgb, mask, width=3):
    """Edge pixels that blend this layer with whatever is next to it trace as a halo once the part
    moves. Replace them with the nearest solid interior colour."""
    inner = ndimage.binary_erosion(mask, iterations=width)
    band = mask & ~inner
    _, (iy, ix) = ndimage.distance_transform_edt(~inner, return_indices=True)
    _, (oy, ox) = ndimage.distance_transform_edt(mask, return_indices=True)
    c_in = rgb[iy, ix].astype(float)
    c_out = a[oy, ox].astype(float)
    c_out[bg[oy, ox]] = BG
    v = c_out - c_in
    t = ((rgb - c_in) * v).sum(-1) / np.maximum((v * v).sum(-1), 1)
    bad = band & (t > 0.18) & ((v * v).sum(-1) > 400)
    rgb[bad] = c_in[bad]


# ---- background ----
# The background brightens towards the wall (Gemini's glow), so match its hue, not one colour:
# light lavender, bluer than it is red, a little redder than green.
lavender = (lum > 214) & (b - g > 10) & (r - g > 2) & (r - g < 18)
bg = keep_big((dist(BG) < 12) | lavender, 30)
# Gemini drew a 1-3 px pale pink rim where the figures meet the background; traced, it became a
# salmon outline. It counts as background.
rim = ndimage.binary_dilation(bg, iterations=3) & ~bg & (lum > 158) & (sat < 95) & (r >= b)  # pink, not the lilac wall
bg |= rim
fg = ~bg & box(1270, 270, 2640, 1450)  # the box leaves out Gemini's sparkle watermark
fg &= ~((lum > 226) & box(2560, 1340, 2752, 1500))  # Gemini's sparkle, lighter than the background
fg = keep_big(fg, 2000)

skin = (r > 120) & (r - b > 60) & (g > 70) & (r - g > 35) & (r - g < 100)
white = (lum > 228) & (sat < 34)

# ---- the cut-out: everything inside its white outline, plus the stick ----
outline = keep_big(white & box(1530, 495, 1800, 725), 500)
card = ndimage.binary_fill_holes(ndimage.binary_closing(outline, iterations=3))
card = largest(card)
stick_col = (dist((140, 113, 92)) < 40) | (dist((150, 125, 100)) < 35)

# ---- the fist on the stick ----
fist = largest(skin & box(1560, 825, 1650, 915))
fist = ndimage.binary_fill_holes(ndimage.binary_closing(fist, iterations=3))
fist = ndimage.binary_dilation(fist, iterations=1) & fg & ~bg

# the stick, kept clear of the fist: its blended edge traced as a tan sliver round the knuckles
stick = keep_big(stick_col & (box(1585, 700, 1640, 840) | box(1585, 900, 1625, 945)), 60)
stick = ndimage.binary_closing(stick, iterations=2) & ~ndimage.binary_dilation(fist, iterations=2)
stick = keep_big(stick, 60)
cutout = card | stick

# ---- the scammer's eyes: whites, and the pupils at their outer corners ----
eyebox = box(1560, 478, 1690, 504)
whites = keep_big(eyebox & white, 40)
lab, n = ndimage.label(eyebox & (lum < 70))  # the eye bags below are dark too
touching = np.unique(lab[ndimage.binary_dilation(whites, iterations=2) & (lab > 0)])
pup = keep_big(np.isin(lab, touching) & (lab > 0), 30)
eyes = ndimage.binary_fill_holes(ndimage.binary_closing(whites | pup, iterations=3)) & eyebox
pupils = pup & eyes

# ---- the string (the component draws it): its dark pixels between the two cans ----
STRING_A, STRING_B = (1827, 643), (2013, 580)
string = near_segment(STRING_A, STRING_B, 7) & (dist((70, 55, 80)) < 60) & (lum < 120)
string = ndimage.binary_dilation(keep_big(string, 30), iterations=1) & near_segment(STRING_A, STRING_B, 8)
# Where it meets each can, the original stays: painting it out there bit a notch in the rim, and
# the drawn string covers it.
string &= (xx > 1846) & (xx < 1999)

# ---- the user's raised arm, hand and can (left of his face) ----
can_col = (sat < 45) & (lum > 95) & (lum < 225) & ~bg
arm_zone = box(1975, 515, 2116, 760) & ~bg
arm = arm_zone & (can_col | skin | (dist((150, 85, 60)) < 45) | (lum < 140)) & (yy > 515)
arm &= ~(box(2050, 515, 2116, 560) & (lum < 90))  # his hair above the can
shirt = (r > 200) & (g < 130) & (b < 100) & (r - g > 90)
arm &= ~shirt & ~string
arm &= ~(box(2104, 515, 2120, 605) & skin)  # his cheek beside the can
arm = keep_big(ndimage.binary_opening(arm, iterations=2), 800)
arm = ndimage.binary_fill_holes(arm)

# ---- the user's head: hair, face and ear, cut at the jaw. The neck's shadow marks the jaw. ----
neck_shadow = keep_big(box(2150, 630, 2270, 705) & (dist((146, 71, 48)) < 30), 200)
jaw = np.full(W, 700)
cols = neck_shadow.any(0)
jaw[cols] = np.argmax(neck_shadow[:, cols], 0)
# beside the shadow, the neck's sides continue under the face; cut them level with its top
neck_x = np.where(cols)[0]
jaw[(np.arange(W) >= neck_x.min() - 14) & (np.arange(W) < neck_x.min())] = jaw[neck_x.min()]
jaw[(np.arange(W) > neck_x.max()) & (np.arange(W) <= neck_x.max() + 14)] = jaw[neck_x.max()]
head = box(2040, 330, 2330, 700) & fg & ~arm & ~shirt & (yy < jaw[None, :])
head = largest(ndimage.binary_opening(head, iterations=2))
head = ndimage.binary_fill_holes(head)

# ---- the thumb: the top digit over the phone, above the dark crease under it ----
hand = keep_big(skin & box(2235, 840, 2330, 935), 400)
thumb = hand & box(2240, 840, 2312, 876) & (lum > 120)
thumb = largest(ndimage.binary_opening(thumb, iterations=2))
thumb = ndimage.binary_fill_holes(ndimage.binary_closing(thumb, iterations=2))

string &= ~arm & ~card

# ---- Gemini's stray V strokes on the forearm ----
vline = (near_segment((2318, 770), (2337, 864), 8) | near_segment((2337, 864), (2394, 886), 8))
v_dark = vline & ((dist((181, 62, 42)) < 45) | (dist((155, 77, 57)) < 40) | (lum < 125))
v_dark |= (np.hypot(xx - 2336, yy - 862) < 11) & (lum < 150)  # the corner of the V
v_dark = ndimage.binary_dilation(v_dark, iterations=2) & vline

# ---- back: everything else, with fills under each moving part ----
back_rgb = a.copy()
moving = cutout | head | arm | thumb
back = fg & ~moving

# string and V strokes: the colour beside them
nearest_fill(back_rgb, string, ~string & ~ndimage.binary_dilation(string, iterations=2) & ~moving)
nearest_fill(back_rgb, v_dark, ~ndimage.binary_dilation(v_dark, iterations=2) & fg & ~moving)
# where the string crossed the open background, the fill is background: leave it transparent
string_on_bg = string & (np.sqrt(((back_rgb - BG) ** 2).sum(-1)) < 16)
back = (back | (string & fg)) & ~string_on_bg

# The hole in the pillar: redrawn as two ellipses, since the string crossed it.
ring = ((xx - 1919.5) / 14.5) ** 2 + ((yy - 610) / 19) ** 2 <= 1
pit = ((xx - 1922) / 7) ** 2 + ((yy - 611) / 11) ** 2 <= 1
back_rgb[ring] = np.median(a[ring & ~pit & ~string & (lum > 110)], axis=0)
back_rgb[pit] = np.median(a[pit & ~string], axis=0)

# Under the cut-out: whatever borders it continues (his face, hood, hoodie, the can).
under_card = ndimage.binary_dilation(card, iterations=3)
src_c = fg & ~ndimage.binary_dilation(card, iterations=6) & ~string & box(1450, 380, 1900, 860)
nearest_fill(back_rgb, under_card, src_c)
under_stick = ndimage.binary_dilation(stick, iterations=3) & ~fist
nearest_fill(back_rgb, under_stick, fg & ~ndimage.binary_dilation(stick, iterations=5) & ~fist & ~card)
back |= under_card | under_stick

# Under the eyes: plain eye white (the whites layer redraws them, the pupils glance over it).
eye_white = np.median(a[whites & ndimage.binary_erosion(whites, iterations=2)], axis=0)
back_rgb[ndimage.binary_dilation(eyes, iterations=1)] = eye_white

# Under the head: the neck continues up, but only inside the face's outline (elsewhere the head
# borders background and stays transparent).
head_d = ndimage.binary_dilation(head, iterations=2)
neck_src = fg & ~head_d & box(2140, 640, 2280, 740) & ~shirt & ~arm
under_head = head_d & box(2150, 560, 2275, 720)
under_head &= ndimage.binary_dilation(neck_src, structure=UPWARD, iterations=90)
nearest_fill(back_rgb, under_head, neck_src)
back = (back | under_head) & ~(head & ~under_head)

# Under the thumb: the screen continues to the phone's right edge, then the palm. The crease and
# the finger below keep their own colours.
screen = keep_big(box(2215, 800, 2300, 935) & (dist((44, 62, 112)) < 22), 2000)
screen_col = np.median(a[screen], axis=0)
palm_col = np.median(a[hand & ~thumb & ndimage.binary_erosion(skin, iterations=3)], axis=0)
under_thumb = thumb | (ndimage.binary_dilation(thumb, iterations=3) & (b > r))  # the screen's edge pixels
phone_edge = 2302 - (yy - 800) * 0.05
back_rgb[under_thumb & (xx < phone_edge)] = screen_col
back_rgb[under_thumb & (xx >= phone_edge)] = palm_col
back |= under_thumb

back &= fg | string

# The user's floor shadow is its own flat ellipse, drawn first: traced with the legs, the jeans'
# shape leaked a blue hairline along its top edge, and Gemini's sparkle sat on its tip.
floor_col = np.array((210, 192, 222))
floor = keep_big((dist(floor_col) < 14) & box(1960, 1360, 2600, 1450), 5000)
fy, fx = np.where(floor)
cy = (fy.min() + fy.max()) / 2
ry = (fy.max() - fy.min()) / 2 + 0.5
mid = floor[int(cy)]
x_left = np.where(mid)[0].min()
x_right = 2629
cx, rx = (x_left + x_right) / 2, (x_right - x_left) / 2
ellipse = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1
shadow_col = np.median(a[floor & ndimage.binary_erosion(floor, iterations=3)], axis=0)
legs_on_floor = back & ellipse & (dist(shadow_col) > 18) & ~ndimage.binary_dilation(bg, iterations=1)
back &= ~ellipse | legs_on_floor

# ---- head extends under the arm and can, so nodding never shows a gap behind them ----
head_rgb = a.copy()
defringe(head_rgb, head)
under_arm = arm & box(2035, 380, 2130, 680)  # only where the arm hides it
under_arm &= ndimage.binary_dilation(head, iterations=40)
under_arm &= ~ndimage.binary_dilation(neck_src, iterations=2)
nearest_fill(head_rgb, under_arm & ~head, ndimage.binary_erosion(head, iterations=4) & ~under_arm)
head_all = head | (under_arm & (yy < 640))

cut_rgb = a.copy()
defringe(cut_rgb, cutout)
arm_rgb = a.copy()
defringe(arm_rgb, arm)
thumb_rgb = a.copy()
defringe(thumb_rgb, thumb)
fist_rgb = a.copy()
defringe(fist_rgb, fist)
defringe(back_rgb, back)


def kuwahara(rgb):
    """Edge-preserving smoothing: each pixel takes the mean of whichever of the four 3 x 3 windows
    touching it diagonally is flattest. Snaps the 1-2 px blends between flat colours (which trace
    as outlines of an in-between colour, like a purple ring round the phone) to one side."""
    f = rgb.astype(float)
    mean = np.stack([ndimage.uniform_filter(f[..., c], 3) for c in range(3)], -1)
    sq = np.stack([ndimage.uniform_filter(f[..., c] ** 2, 3) for c in range(3)], -1)
    var = (sq - mean ** 2).sum(-1)
    best_var = np.full(var.shape, np.inf)
    out = f.copy()
    for oy in (-1, 1):
        for ox in (-1, 1):
            v = np.roll(var, (oy, ox), (0, 1))
            m = np.roll(mean, (oy, ox), (0, 1))
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


def flat(name, mask, colour):
    rgb = np.zeros((H, W, 3), int)
    rgb[:] = colour
    save(name, rgb, mask, median=False)


flat("floor", ellipse, shadow_col)
save("back", back_rgb, back, snap=True)
save("cutout", cut_rgb, cutout)
save("fist", fist_rgb, fist)
save("head", head_rgb, head_all)
save("arm", arm_rgb, arm)
save("thumb", thumb_rgb, thumb)
ink = np.median(a[pupils & (lum < 70)], axis=0)
flat("whites", eyes, eye_white)
flat("pupils", pupils, ink)

vis = (a * 0.35).astype(np.uint8)
for m, c in ((back, (60, 160, 255)), (cutout, (255, 200, 0)), (fist, (255, 120, 0)), (head_all, (0, 220, 120)),
             (arm, (255, 0, 80)), (thumb, (255, 0, 255)), (eyes, (255, 255, 255)), (pupils, (0, 0, 0)),
             (string, (255, 255, 0)), (v_dark, (0, 255, 255))):
    vis[m] = (vis[m] * 0.4 + np.array(c) * 0.6).astype(np.uint8)
Image.fromarray(vis).crop((1270, 280, 2650, 1450)).save(f"{outdir}/layers.png")
print({k: int(v.sum()) for k, v in dict(back=back, cutout=cutout, fist=fist, head=head_all, arm=arm,
                                         thumb=thumb, eyes=eyes, pupils=pupils, string=string,
                                         vline=v_dark).items()})
