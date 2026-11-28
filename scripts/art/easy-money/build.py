"""Build the Easy Money home-card illustration.

    python scripts/art/easy-money/build.py

Reads the flat (no grain) Gemini image from scripts/art/easy-money/source/flat.png, splits it into
layers (segment.py), traces each layer to vectors with vtracer, groups the shapes that animate, and
writes src/dojos/easy-money/art/scene.ts plus a preview SVG in scripts/art/easy-money/out/.
The coordinates below are in the 2752 x 1536 source image.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

import vtracer
from PIL import Image, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SRC = HERE / "source" / "flat.png"
OUT = HERE / "out"
TS_OUT = ROOT / "src" / "dojos" / "easy-money" / "art" / "scene.ts"
VIEW_BOX = "1100 0 1652 1536"  # the right part of the image, where the scene is

TRACE = dict(colormode="color", hierarchical="stacked", mode="spline", corner_threshold=60,
             length_threshold=4.0, max_iterations=10, splice_threshold=45, path_precision=1,
             color_precision=6, layer_difference=16)

# The hook, note, coins and sparkles all sit inside LURE. Each coin and sparkle gets its own box so
# it can move on its own; everything else in LURE (line, hook, note) swings together.
LURE = (1180, 0, 1640, 740)
COINS = [(1250, 400, 1330, 485), (1470, 205, 1555, 275), (1515, 585, 1600, 650), (1270, 640, 1345, 710)]
SPARKS = [(1540, 285, 1600, 345), (1440, 660, 1505, 725), (1220, 500, 1265, 545),
          (1315, 340, 1345, 370), (1575, 530, 1600, 555)]
GLYPH = (1400, 455, 1500, 530)  # Gemini's misdrawn rupee sign; the component draws a proper one
EYE = (1378, 236, 1412, 270)  # background showing through the hook's eye

PATH_RE = re.compile(r'<path d="([^"]+)" fill="([^"]+)" transform="translate\(([-\d.]+),([-\d.]+)\)"/>')
TOK = re.compile(r"[MCLZ]|-?\d+\.?\d*")


def trace(png: Path, speckle: int) -> list[dict]:
    svg = png.with_suffix(".svg")
    vtracer.convert_image_to_svg_py(str(png), str(svg), filter_speckle=speckle, **TRACE)
    out = []
    for d, fill, tx, ty in PATH_RE.findall(svg.read_text()):
        tx, ty = float(tx), float(ty)
        cmds, cur, nums = [], None, []
        for t in TOK.findall(d):
            if t in "MCLZ":
                if cur:
                    cmds.append((cur, nums))
                cur, nums = t, []
            else:
                nums.append(float(t))
        if cur:
            cmds.append((cur, nums))
        pts = [(x + tx, y + ty) for _, n in cmds for x, y in zip(n[0::2], n[1::2])]
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        out.append({"cmds": cmds, "tx": tx, "ty": ty, "fill": fill.lower(),
                    "bbox": (min(xs), min(ys), max(xs), max(ys))})
    return out


def compact(p: dict) -> list[str]:
    """Absolute float path -> relative integer path, about half the bytes."""
    s, px, py, sx, sy = [], 0, 0, 0, 0
    for c, n in p["cmds"]:
        ab = [(round(x + p["tx"]), round(y + p["ty"])) for x, y in zip(n[0::2], n[1::2])]
        if c == "M":
            (x, y), = ab
            s.append(f"M{x} {y}")
            px, py, sx, sy = x, y, x, y
        elif c == "Z":
            s.append("z")
            px, py = sx, sy
        else:
            step = 3 if c == "C" else 1
            rel = []
            for i in range(0, len(ab), step):
                seg = ab[i:i + step]
                rel += [f"{x - px} {y - py}" for x, y in seg]
                px, py = seg[-1]
            s.append(c.lower() + " ".join(rel))
    return [re.sub(r" -", "-", "".join(s)), p["fill"]]


def rgb(p: dict) -> tuple[int, int, int]:
    return tuple(int(p["fill"][i:i + 2], 16) for i in (1, 3, 5))


def within(b, r) -> bool:
    return b[0] >= r[0] and b[1] >= r[1] and b[2] <= r[2] and b[3] <= r[3]


def is_glow(p: dict) -> bool:
    """The source's soft glow traces as pale blobs; the component draws its own glow."""
    r, g, _ = rgb(p)
    return r >= 240 and g >= 210 and not within(p["bbox"], EYE)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    subprocess.run([sys.executable, "-I", str(HERE / "segment.py"), str(SRC), str(OUT)], check=True)
    Image.open(SRC).convert("RGB").filter(ImageFilter.MedianFilter(3)).save(OUT / "full.png")

    full = trace(OUT / "full.png", 10)
    lure, coins, sparks = [], [[] for _ in COINS], [[] for _ in SPARKS]
    for p in full[1:]:
        b = p["bbox"]
        if not within(b, LURE) or is_glow(p):
            continue
        box = next((i for i, r in enumerate(COINS) if within(b, r)), None)
        if box is not None:
            coins[box].append(p)
            continue
        box = next((i for i, r in enumerate(SPARKS) if within(b, r)), None)
        if box is not None:
            sparks[box].append(p)
            continue
        if within(b, GLYPH) and rgb(p)[1] > 180:
            continue
        lure.append(p)

    layers = {
        "BAG": trace(OUT / "base.png", 16)[1:],  # beanbag + floor, background dropped
        "UPPER": trace(OUT / "upper.png", 10),
        "LEGS": trace(OUT / "legs.png", 10),
        "LURE": lure,
    }

    def arr(paths: list[dict]) -> str:
        return json.dumps([compact(p) for p in paths])

    ts = [
        "/* Generated by scripts/art/easy-money/build.py. Don't edit by hand: re-run the script. */",
        'import type { ArtPath } from "@/components/home/art";',
        "",
        f'export const VIEW_BOX = "{VIEW_BOX}";',
    ]
    for name, paths in layers.items():
        ts.append(f"export const {name}: readonly ArtPath[] = {arr(paths)};")
    ts.append(f"export const COINS: readonly (readonly ArtPath[])[] = [{', '.join(arr(c) for c in coins)}];")
    ts.append(f"export const SPARKS: readonly (readonly ArtPath[])[] = [{', '.join(arr(s) for s in sparks)}];")
    TS_OUT.parent.mkdir(parents=True, exist_ok=True)
    TS_OUT.write_text("\n".join(ts) + "\n")
    subprocess.run(["npx", "prettier", "--write", str(TS_OUT)], cwd=ROOT, check=True)

    # A static preview for eyeballing the trace (no animation, glow or rupee sign).
    groups = list(layers.values()) + coins + sparks
    body = "".join(f'<path d="{d}" fill="{f}"/>' for g in groups for d, f in map(compact, g))
    (OUT / "preview.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VIEW_BOX}" style="background:#fbead1">{body}</svg>')
    print(f"wrote {TS_OUT.relative_to(ROOT)} ({TS_OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
