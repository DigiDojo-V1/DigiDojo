# Dojo art

Each dojo's slide on the home carousel can have an animated illustration: a flat, grainy 2D scene
whose parts move in slow loops. Easy Money, Dream Job, Trust Me Bro and Authority have one. This folder turns
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

## How Authority is split

- **Drawn in code, not traced** (painted out of every layer first, then filled by nearest colour):
  the phone-shaped cage (rounded outline, five bars, notch, camera), the viewfinder corners and
  rec dot, her pupils and sweat drops, the chai steam, and the cage's floor shadow. Gemini's
  sparkle sat on the cage's corner and its shadow, so redrawing them removes it too. `scene.ts`
  exports the measurements (`CAGE`, `EYES`, `PUPIL`, the sweat and gingham colours) beside the
  layers.
- **Back** (static): the board on its easel, the stool, the officer's head, torso, shorts and back
  leg, the tripod and phone, the chai, the keys, her legs and the chair. Filled in under every
  moving part by nearest colour; on the board each row uses the board's own colour there (it is a
  vertical gradient), and the background counts as a source, or a gap beside a part (the cable,
  her trousers) fills in solid. Removing the bottom-left viewfinder corner took the top of the
  easel leg with it; the leg is copied back up from below.
- **Shorts**: Gemini's gingham traced as a jumble of bricks. The shorts are a flat base (folds
  kept), and the component multiplies an exact 20 px check over them, clipped to the `SHORTS`
  outline.
- **Evidence**: the fist holding up the car photo and the bag, the sleeve behind the bag and the
  bag's shadow on the board. Shakes about the shoulder. **Torso** is the torso's edge, drawn again
  over the sleeve.
- **Arm**: the pointing arm and hand, cut 5 px inside the torso so no sliver opens at the shoulder.
  Prods by stretching along its own direction (`rotate(A) scaleX(s) rotate(-A)`, A = -24.6deg).
  The khaki (torso and both sleeves) is snapped to four shared colours first, or the arm traced a
  darker khaki with a seam at the shoulder.
- **Shin, chappal and thigh**: the front leg is found as one shape and snapped to three shared
  colours, then cut at the knee; traced separately, the two halves came out different browns. The
  shin and foot swing about the knee (the toes beyond the strap are joined through the chappal, so
  they swing too); the chappal dangles about the toe post; the thigh is drawn again over the top
  of the shin. Only the part joined to the foot counts as shin: the stool leg's shaded edge also
  passes the skin test.
- **Her**: everything above the waist, minus slivers of hair beside the bars. Trembles about the
  waist. **Cable**: the charging cable and plugs are near the background's colour, so they are
  found as neutral (not pink) pixels and drawn again over her; in her trace the loops broke up.
  Where Gemini drew a strand in front of a bar, the bar now covers it.
- **Eyes and brows**: the whites as a flat layer with the wet lower rim as a flat band. A bar cut
  her right eye, so it is the left one copied 66 px across (Gemini drew them as twins). The pupils
  are circles clipped to ellipses round the whites; they shrink when she looks at her phone. The
  brows are their own layer: the left one merged into her hair in her trace.
- Everything traces at the default clustering: Gemini's "flat" image still has soft gradients
  (faces, legs, the board), and finer settings traced them as blotches.
- **Fictional**: the cap carries a plain star, the badge is a blank shield, the name bar is blank
  and the car photo has no plate. There is no text anywhere in the scene.

## Checking a scene

Before shipping, freeze every moving part at both extremes and look at the cut edges at 2x: holes
behind moving parts, pale halos, webbing between fingers, leftover glow blobs. Then render the
scene at rest and diff it against `flat.png` to catch colours the trace merged.

The box coordinates in `build.py` and `segment.py` are specific to each image. A new dojo copies
the folder and adjusts them.
