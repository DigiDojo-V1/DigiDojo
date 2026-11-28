# Dojo art

Each dojo's slide on the home carousel can have an animated illustration: a flat, grainy 2D scene
whose parts move in slow loops. Easy Money, Dream Job and Trust Me Bro have one. This folder turns
a generated image into the vector layers the app animates.

## How a scene is made

1. **Generate two images in Gemini** (16:9, highest resolution, our reference board attached):
   - a **grainy** version: the look we're going for;
   - a **flat** version of the same image ("identical composition, remove all grain and noise,
     solid flat colours, shading only as hard-edged darker shapes"). This is the one we trace.

   Prompt rules: subject in the right 55% (the dojo name sits on the left), a warm light background,
   every moving part a separate shape with space around it, and no text, logos or real currency.

2. **Put both images in `scripts/art/<dojo-id>/source/`** as `flat.png` and `grainy.png`. They are
   gitignored (several MB each); keep the originals in the team drive.
3. **Build:**
   ```bash
   uv venv -p 3.12 .venv-art && VIRTUAL_ENV=.venv-art uv pip install -r scripts/art/requirements.txt
   .venv-art/bin/python scripts/art/<dojo-id>/build.py
   ```
   Use Python 3.12: vtracer 0.6.15 segfaults on 3.14 (exit code 139, no message), which is
   what a plain `python3 -m venv` picks up on a current Mac.
   This splits the image into layers (`segment.py`), traces each with vtracer, and writes
   `src/dojos/<dojo-id>/art/scene.ts`. Open `scripts/art/<dojo-id>/out/preview.svg` to eyeball
   the trace.
4. **Animate** in `src/dojos/<dojo-id>/art/` (a component plus a plain CSS file; class and keyframe
   names need a dojo prefix such as `em-`, because `next.config.ts` loads every `.css` file as
   global CSS, so CSS modules don't work here). Then add the dojo to `src/dojos/art.ts`.

## How Easy Money is split

- **Lure** (line, hook, note), **4 coins**, **5 sparkles**: cut out by bounding box from a trace of
  the whole image. Gemini's ₹ glyph is dropped and the component draws a proper one.
- **Upper body** and **legs**: the man is separated from the beanbag by colour, then split again so
  his upper body can lean while his feet stay on the floor. A strip of hoodie is extended under his
  thighs so leaning never opens a gap.
- **Beanbag + floor**: the man's area is filled with beanbag teal inside the bag's outline and
  background outside it, so nothing shows through when he moves.
- The soft glow and the grain are not traced: the component draws the glow, and the carousel lays
  grain over the whole slide.

## How Dream Job is split

- **Legs** (static): floor shadow, the envelope's legs, her jeans and shoes. They continue straight
  up under the hug, so rocking never opens a gap at the waist.
- **Body**: everything else of the hug (envelope, its front arm, her torso, arms and bag) rocks as
  one about the hips, so her hands never slide on the envelope. Filled in under her head (the
  envelope continues behind her face, cut at its real edge), under the face parts (cream) and
  under the card (bag).
- **Head**: cut at the chin; tilts as she laughs.
- **Arm**: the envelope's arm round her back, its glove and the card. It pivots at the shoulder
  hidden behind her and is extended sideways under her. It is drawn behind her, then the glove and
  card are drawn again in front of the bag through a clip.
- **Eyes and brows**: whites, pupils (clipped to the whites, so glancing never leaves the eye) and
  brows, in flat colours.
- Gemini's fake card lettering and two-circle logo are painted out and their leftover shapes
  dropped. The hug layer traces with finer colour clustering (`color_precision=7`,
  `layer_difference=8`): at the default settings the envelope's fold lines and her ID badge
  merged into the cream.

## How Trust Me Bro is split

- **Floor**: the user's floor shadow, redrawn as one flat ellipse and drawn first. Traced with his
  legs, the jeans' shape leaked a blue hairline along its top, and Gemini's sparkle sat on its tip.
- **Back** (static): wall, pillar, the scammer and the user minus every moving part. Filled in
  under the cut-out (his face, hood, hoodie and can continue by nearest colour), under his eyes
  (eye white), under the user's head (the neck continues up) and under the thumb (screen, then
  palm). Traces with the finest clustering (`color_precision=8`, `layer_difference=5`): coarser,
  the hoodie's dark hem, the jeans' waistband and the phone's lilac edge merged away. An
  edge-snapping (Kuwahara) filter runs first, or the 1 px blends between flat colours trace as
  outlines of an in-between colour (a purple ring round the phone).
- **Cut-out**: the printed face inside its white outline, plus the stick. Bobs and tilts about the
  fist. The stick is kept 2 px clear of the fist; its blended edge traced as a tan sliver.
- **Fist**: drawn again over the stick, static.
- **Eyes**: whites, and pupils clipped to the whites (only pixels darker than lum 70: the eye bags
  below are dark too).
- **Head**: the user's hair, face and ear, cut at the jaw (the top of the neck's shadow). Nods and
  tips about the neck. Extended under the raised arm, filled from its interior, not its edge.
- **Arm**: his raised arm, hand and can, drawn over the head.
- **Thumb**: the top digit over the phone; hovers and taps the pay button about its knuckle.
- **Drawn in code, not traced**: the string (painted out of the back, except where it enters each
  can, so the rims keep their shape) with its blips and twitch, the hole in the wall (redrawn as
  two ellipses, since the string crossed it) and the pay button (Gemini's flat image had none).
  The twitch animates the CSS `d` property, which Safari ignores: there the string stays still.
- **Gemini's mistakes**: two stray V-shaped strokes on the user's forearm are painted out. The
  background brightens towards the wall and the figures have a 1-3 px pale pink rim where they
  meet it; both count as background, or they trace as salmon outlines.

## Checking a scene

Before shipping, freeze every moving part at both extremes and look at the cut edges at 2x: holes
behind moving parts, pale halos, webbing between fingers, leftover glow blobs. Then render the
scene at rest and diff it against `flat.png` to catch colours the trace merged.

The box coordinates in `build.py` and `segment.py` are specific to each image. A new dojo copies
the folder and adjusts them.
