# Dojo art

Each dojo's slide on the home carousel can have an animated illustration: a flat, grainy 2D scene
whose parts move in slow loops. Easy Money is the first. This folder turns a generated image into
the vector layers the app animates.

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
   python3 -m venv .venv-art && .venv-art/bin/pip install -r scripts/art/requirements.txt
   .venv-art/bin/python scripts/art/easy-money/build.py
   ```
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

The box coordinates in `build.py` and `segment.py` are specific to this image. A new dojo copies
the folder and adjusts them.
