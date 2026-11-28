"""Split the flat Dream Job image into traceable layers. Works at full resolution (2752 x 1536);
every coordinate below is an image pixel.

Layers, back to front:
  legs     static: floor shadow, the envelope's legs, her jeans and shoes. Extended up under the
           hug so rocking never opens a gap.
  thief    the envelope's arm reaching round her back, its glove and the card. Extended sideways
           under her ponytail and shoulder, where it pivots.
  body     the hug, which rocks as one: envelope, its front arm, her torso, arms, hands and bag.
           Filled in under the head, the envelope's face parts and the card.
  head     her hair, face, ear and ponytail, cut at the chin. Tilts as she laughs.
  whites / pupils / brows   the envelope's face parts, in flat colours.

Writes one RGBA PNG per layer into the output folder, plus layers.png (a colour-coded overlay for
checking the split).
"""
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from scipy.spatial import Delaunay

src, outdir = sys.argv[1], sys.argv[2]
a = np.array(Image.open(src).convert("RGB")).astype(int)
H, W, _ = a.shape
r, g, b = a[..., 0], a[..., 1], a[..., 2]
yy, xx = np.mgrid[0:H, 0:W]
lum = (r * 299 + g * 587 + b * 114) / 1000
sat = a.max(-1) - a.min(-1)
BG = np.array((214, 231, 238))
HORIZONTAL = np.array([[0, 0, 0], [1, 1, 1], [0, 0, 0]])
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


def hull(mask):
    ty, tx = np.where(mask)
    step = max(1, len(tx) // 40000)
    tri = Delaunay(np.c_[tx[::step], ty[::step]])
    return (tri.find_simplex(np.c_[xx.ravel(), yy.ravel()]) >= 0).reshape(H, W)


def nearest_fill(rgb, target, source):
    """Paint `target` pixels with the colour of the nearest `source` pixel; returns the distances."""
    d, (oy, ox) = ndimage.distance_transform_edt(~source, return_indices=True)
    rgb[target] = rgb[oy[target], ox[target]]
    return d


def defringe(rgb, mask, width=3):
    """Edge pixels that blend this layer with whatever is next to it (background or a neighbouring
    part) trace as a halo once the part moves. Replace them with the nearest solid interior colour."""
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


# ---- background: every sizeable bg-coloured region. "Connected to the outside" isn't enough here:
# the floor shadow encloses the gaps between the legs. ----
bg = keep_big(dist(BG) < 22, 30)
fg = largest(~bg)  # also drops Gemini's sparkle watermark in the corner
fg = ndimage.binary_fill_holes(fg) & ~bg

# ---- colour classes ----
cream = (r > 200) & (g > 175) & (b > 130) & (r - b > 22) & (r - g < 45)
mustard = (r > 120) & (b < 72) & (r - b > 90) & (g > 70)  # the kurta (skin has more blue)
bagcol = (dist((72, 55, 61)) < 26) & (r - g > 8)  # the red tint keeps the grey arm out
hair = (lum < 75) & (r - g > 8)  # also the bag strap
armblack = (lum < 95) & (np.abs(r - g) < 9) & (b - r < 16) & (b - r > -4)
blue = (b > r + 25) & (b > 90)

# ---- envelope: the big cream shape left of her ----
env = largest(cream & (xx < 2075) & fg)
env = ndimage.binary_fill_holes(ndimage.binary_closing(env, iterations=4))
env_hull = hull(env) & (xx < 2075)

# ---- legs: below the envelope and the kurta hem, plus the jeans showing in the kurta's slit.
# Light pixels are left out: the blend along the envelope's bottom edge would get extended. ----
leg_zone = (yy > 940) & ~cream & ~mustard & ~(box(2100, 0, W, 1015) & ~blue) & ((lum < 160) | blue)
legs = keep_big(fg & leg_zone, 400)
legs |= fg & (yy > 1112)
legs = ndimage.binary_opening(legs, iterations=1)
legs = keep_big(legs, 400)

# ---- thief: the black arm right of her ponytail, wrist band, glove and card. Opening splits the
# thin wrist band off, so keep every sizeable piece. ----
thief = fg & box(2225, 400, 2540, 840) & ~bagcol & ~hair & ~mustard
thief = keep_big(ndimage.binary_opening(thief, iterations=2), 500)
thief = ndimage.binary_closing(thief, iterations=3)
thief = ndimage.binary_fill_holes(thief)
thief &= fg  # cut the gaps between the fingers back out
thief = ndimage.binary_opening(thief, iterations=1)
thief = keep_big(thief, 500)

# ---- the envelope's face. Pupils touch the edge of the whites, so they are the dark blobs next
# to the whites; brows are the dark blobs above them; the mouth stays on the envelope. ----
face = box(1712, 290, 1890, 425)
whites = keep_big(face & (lum > 226) & (np.abs(r - b) < 22), 150)
darks = keep_big(face & (lum < 110), 100)
lab, n = ndimage.label(darks)
near_white = ndimage.binary_dilation(whites, iterations=2)
pupils = np.zeros_like(darks)
brows = np.zeros_like(darks)
for i in range(1, n + 1):
    comp = lab == i
    cy = yy[comp].mean()
    if (comp & near_white).any() and cy < 388:
        pupils |= comp
    elif cy < 352:
        brows |= comp
eyes = ndimage.binary_fill_holes(ndimage.binary_closing(whites | pupils, iterations=4))

# ---- head: everything of hers above the chin, plus the ponytail down to her shoulder ----
lanyard = (r > 150) & (g < 90) & (yy > 440)
head = box(1985, 150, 2265, 520) & ~env & ~thief & fg & ~mustard & ~lanyard & ~armblack & (yy < 462)
head |= box(2150, 440, 2262, 476) & hair
head = largest(ndimage.binary_opening(head, iterations=2))
head = ndimage.binary_fill_holes(head)

# ---- body: the rest of the hug ----
body = keep_big(fg & ~legs & ~thief & ~head, 2000)

# ---- legs continue straight up under the hug. Clean the top edge first: the extension copies it
# (uncleaned, the kurta/jeans blend became an olive line along the hem). ----
legs_rgb = a.copy()
defringe(legs_rgb, legs)
leg_ext = ndimage.binary_dilation(legs, structure=UPWARD, iterations=45) & ~legs & body
nearest_fill(legs_rgb, leg_ext, legs)
legs_all = legs | leg_ext

# ---- the arm continues under her ponytail and shoulder, sideways only: growing it downward too
# left a tab that poked out past her shoulder when the arm lifted. ----
thief_rgb = a.copy()
defringe(thief_rgb, thief)
root = thief & box(2225, 420, 2275, 560)
grow = ndimage.binary_dilation(root, structure=HORIZONTAL, iterations=40)
grow = ndimage.binary_dilation(grow, iterations=3) & (head | body) & box(2175, 410, 2300, 560)
nearest_fill(thief_rgb, grow, thief)
thief_all = thief | grow

# ---- body fills ----
body_rgb = a.copy()

# Under the face parts: envelope cream, so blinking and glancing show the envelope behind.
face_parts = ndimage.binary_dilation(eyes | brows, iterations=3) & env
face_dark = ndimage.binary_dilation(eyes | brows | (face & (lum < 110)), iterations=3)
nearest_fill(body_rgb, face_parts, env & ~face_parts & ~face_dark)

# Under the head: the envelope continues behind her face, but only to its real right edge. The hull
# of what shows bulges past that edge (a pale sliver by her chin once she tilts), so cut it at the
# edge line, interpolated across the rows where her head covers the edge.
head_d = ndimage.binary_dilation(head, iterations=2)
rows = np.arange(H)
has = env.any(1)
edge = np.where(has, W - 1 - np.argmax(env[:, ::-1], 1), 0)
touch = np.array([has[y] and head_d[y, edge[y] + 1:edge[y] + 5].any() for y in range(H)])
ok = has & ~touch
env_hull &= xx <= np.interp(rows, rows[ok], edge[ok])[:, None] + 1
in_env = head_d & env_hull
nearest_fill(body_rgb, in_env, env & ~head_d)
# Below the chin, her neck and shoulders continue under the head. Elsewhere the head borders
# background, so it stays transparent (a nearest-colour fill there smeared the envelope's edge
# into a pale line along her face).
neck = head_d & ~env_hull & (yy > 425)
d = nearest_fill(body_rgb, neck, body & ~head_d & ~ndimage.binary_dilation(env, iterations=6) & (yy > 455))
under_head = in_env | (neck & (d < 18))

# Under the card and glove: the bag, so lifting the card doesn't leave a bite out of it.
bag_body = bagcol & box(2150, 640, 2400, 1010) & body
bag_hull = hull(largest(ndimage.binary_opening(bag_body, iterations=3)))
under_card = ndimage.binary_dilation(thief, iterations=2) & bag_hull & ~head
nearest_fill(body_rgb, under_card, bag_body & ~under_card)

body_all = ((body | under_head | under_card) & ~legs) | face_parts
body_all &= ~legs  # the hug is drawn over the legs; keep it off the static floor shadow

head_rgb = a.copy()
defringe(head_rgb, head)
defringe(body_rgb, body_all)

# ---- the card: Gemini drew fake lettering and a two-circle logo that looks like a real card
# network's. Paint both out with the card colour around them (build.py also drops the small
# shapes left behind). ----
card_core = thief & box(2300, 640, 2500, 830) & (sat > 50) & (lum > 60) & (lum < 175)
lettering = box(2326, 712, 2376, 766) & thief & (lum > 135) & (sat < 90)
lettering = ndimage.binary_dilation(lettering, iterations=2) & thief & (sat < 120) & ~((r > 200) & (b < 120))
logo = box(2424, 698, 2468, 748) & thief & ((lum > 78) | (r - b > 30))
logo = ndimage.binary_dilation(logo, iterations=1) & thief & ((lum > 60) | (r - b > 25))
teal = card_core & (b > r + 40)  # what the logo sits on
marks = lettering | logo
nearest_fill(thief_rgb, lettering, (card_core & ~marks & ~teal) | (card_core & ~marks & box(2300, 700, 2400, 800)))
nearest_fill(thief_rgb, logo, teal & ~marks)


def save(name, rgb, mask, median=True):
    im = Image.fromarray(rgb.clip(0, 255).astype(np.uint8))
    if median:
        im = im.filter(ImageFilter.MedianFilter(3))
    rgba = im.convert("RGBA")
    rgba.putalpha(Image.fromarray((mask * 255).astype(np.uint8)))
    rgba.save(f"{outdir}/{name}.png")


def flat(name, mask, colour):
    rgb = np.zeros((H, W, 3), int)
    rgb[:] = colour
    save(name, rgb, ndimage.binary_opening(mask, iterations=1), median=False)


save("legs", legs_rgb, legs_all)
save("thief", thief_rgb, thief_all)
save("body", body_rgb, body_all)
save("head", head_rgb, head)
eye_white = np.median(a[whites & ndimage.binary_erosion(whites, iterations=3)], axis=0)
ink = np.median(a[pupils & ndimage.binary_erosion(pupils, iterations=3)], axis=0)
flat("whites", eyes, eye_white)
flat("pupils", pupils, ink)
flat("brows", brows, ink)

vis = (a * 0.35).astype(np.uint8)
for m, c in ((legs_all, (60, 160, 255)), (body_all, (255, 200, 0)), (thief_all, (255, 0, 80)),
             (head, (0, 220, 120)), (eyes, (255, 255, 255)), (brows, (200, 0, 255))):
    vis[m] = (vis[m] * 0.4 + np.array(c) * 0.6).astype(np.uint8)
Image.fromarray(vis).crop((1500, 140, 2560, 1480)).save(f"{outdir}/layers.png")
print({k: int(v.sum()) for k, v in dict(legs=legs_all, body=body_all, thief=thief_all, head=head,
                                         eyes=eyes, pupils=pupils, brows=brows).items()})
