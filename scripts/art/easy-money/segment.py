"""Split the flat Easy Money image into traceable layers: base (background + beanbag + floor,
with the man's area filled in), upper body, and legs. Works at full resolution (2752 x 1536).
Coordinates below are written in half-size units and scaled by S."""
import sys
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage
from scipy.spatial import Delaunay

src, outdir = sys.argv[1], sys.argv[2]
img = Image.open(src).convert("RGB")
a = np.array(img).astype(int)
H, W, _ = a.shape
S = W / 1376  # 2 for the full-size image
r, g, b = a[..., 0], a[..., 1], a[..., 2]
yy, xx = np.mgrid[0:H, 0:W]
it = lambda n: max(1, round(n * S))  # morphology iterations scale with resolution
px = lambda n: n * S * S  # pixel-count thresholds scale with area


def near(c, tol):
    return np.sqrt(((a - np.array(c)) ** 2).sum(-1)) < tol


def biggest(mask, min_px):
    lab, n = ndimage.label(mask)
    sizes = ndimage.sum(mask, lab, range(1, n + 1))
    return np.isin(lab, 1 + np.where(sizes > min_px)[0])


bg = near((251, 235, 209), 34)
teal = (g - r > 40) & (b - r > 30)
floor = near((196, 170, 150), 30) & (yy > 685 * S)
lure_zone = (xx < 812 * S) & (yy < 380 * S)
region = (xx >= 680 * S) & (yy >= 130 * S) & ~lure_zone

# ---- the man: everything in his area that isn't background, beanbag or floor ----
man = biggest(region & ~bg & ~teal & ~floor, px(400))
man = ndimage.binary_opening(man, iterations=it(2))
lab, n = ndimage.label(man)
sizes = ndimage.sum(man, lab, range(1, n + 1))
man = lab == 1 + int(np.argmax(sizes))
man = ndimage.binary_closing(man, iterations=it(2))
man = ndimage.binary_fill_holes(man)
# Closing and hole-filling bridge the thin background slits between his fingers. Cut back out any
# background pixel that connects to the open background outside him (the enclosed light details,
# like the hoodie drawstrings, are separate components and stay).
lab, _ = ndimage.label(bg)
outside = lab == lab[5, 5]
man &= ~outside
man_d = ndimage.binary_dilation(man, iterations=it(1)) & ~(outside & near((251, 235, 209), 18))

# ---- base: flat background, beanbag filled in behind the man ----
ty, tx = np.where(teal & region)
hull = Delaunay(np.c_[tx, ty])
inside = (hull.find_simplex(np.c_[xx.ravel(), yy.ravel()]) >= 0).reshape(H, W)
base = a.copy()
CREAM = (251, 235, 209)
base[bg | lure_zone] = CREAM  # the lure layer is traced separately
src_out = (bg | floor) & ~man_d
_, (oy, ox) = ndimage.distance_transform_edt(~src_out, return_indices=True)
fill_in, fill_out = man_d & inside, man_d & ~inside
base[fill_in] = (51, 150, 145)
base[fill_out] = base[oy[fill_out], ox[fill_out]]

base_img = Image.fromarray(base.astype(np.uint8)).filter(ImageFilter.MedianFilter(5))
base_img = base_img.quantize(colors=16, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
base_img.filter(ImageFilter.ModeFilter(7)).convert("RGB").save(f"{outdir}/base.png")

# ---- split the man: legs (pants + socks) stay put, the upper body leans ----
lum = (r * 299 + g * 587 + b * 114) / 1000
pants = man & (b > r) & (lum < 90) & (yy > 455 * S)
socks = man & (r > 140) & (g > 90) & (b < 90) & (r - b > 90) & (yy > 590 * S)
legs = biggest(pants | socks, px(1500))
legs = ndimage.binary_closing(legs, iterations=it(3))
legs = ndimage.binary_fill_holes(legs)
legs = ndimage.binary_dilation(legs, iterations=it(1)) & man_d
upper = ndimage.binary_opening(man_d & ~legs, iterations=it(2))
upper = biggest(upper, px(1500))
# tuck some hoodie under the thighs so leaning never opens a gap at the waist
ext = legs & ndimage.binary_dilation(upper, iterations=it(18))
_, (uy, ux) = ndimage.distance_transform_edt(~upper, return_indices=True)
upper_rgb = a.copy()
upper_rgb[ext] = a[uy[ext], ux[ext]]

# Edge pixels that are half background (or half beanbag) would trace as a pale/teal halo around the
# man once he moves. Replace them with the nearest solid colour from inside his outline.
fringe_src = (np.sqrt(((a - np.array(CREAM)) ** 2).sum(-1)) < 110) | ((g - r > 15) & (b - r > 10))
band = man_d & ~ndimage.binary_erosion(man_d, iterations=it(3))
bad = band & fringe_src
_, (gy, gx) = ndimage.distance_transform_edt(bad | ~man_d, return_indices=True)
for arr in (a, upper_rgb):
    arr[bad] = arr[gy[bad], gx[bad]]

smooth = lambda arr: Image.fromarray(arr.astype(np.uint8)).filter(ImageFilter.MedianFilter(3))
for name, mask, rgb in (("legs", legs, smooth(a)), ("upper", upper | ext, smooth(upper_rgb))):
    rgba = rgb.convert("RGBA")
    rgba.putalpha(Image.fromarray((mask * 255).astype(np.uint8)))
    rgba.save(f"{outdir}/{name}.png")
print("man", man.sum(), "legs", legs.sum(), "upper", (upper | ext).sum())
