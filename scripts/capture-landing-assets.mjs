// Records the landing page's demo clip from the running app: one full play of a scenario,
// from its intro card through flagging and a decision to the debrief.
//
//   npm run dev                      # in one terminal
//   npm run capture:landing          # in another (optionally: -- http://localhost:3001)
//
// Writes public/landing/demo.webm and demo-poster.jpg, and prints the clip's length so the
// player's placeholder time in EnterDojo.tsx can match. Everything captured is the app's own
// fictional content. Needs Playwright's Chromium: `npx playwright install chromium`.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, rename, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = path.resolve("public/landing");
const VIEWPORT = { width: 1280, height: 800 };
const SCENARIO_URL = `${BASE}/digidojo/dojo/easy-money/task-scam`;

/** English, tutorial already seen, so the scenario opens straight on its intro. */
const PROGRESS = JSON.stringify({
  state: { completed: {}, locale: "en", tutorialSeen: true },
  version: 1,
});

/**
 * Headless recordings have no mouse pointer, so draw one. It glides to each target before
 * the click and keeps its place across page loads.
 *
 * The outer element only moves (translate); the inner arrow only presses (scale about its
 * tip). Scaling the element that carries the translate would scale the position too and
 * throw the pointer toward the top-left corner on every click.
 */
function installCursor() {
  const ARROW =
    '<svg width="22" height="22" viewBox="0 0 24 24" style="display:block"><path d="M4 2l15 11-6.5 1.2L9 21z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const mount = () => {
    if (document.getElementById("demo-cursor")) return;
    // Hide the Next.js dev badge from the first frame.
    const style = document.createElement("style");
    style.textContent = "nextjs-portal { display: none !important; }";
    document.documentElement.appendChild(style);
    const el = document.createElement("div");
    el.id = "demo-cursor";
    // The arrow's tip is at (4, 2) of its 24-unit box; offset it so the tip is the hotspot.
    el.innerHTML = `<div id="demo-cursor-arrow" style="margin:-2px 0 0 -4px;transform-origin:4px 2px">${ARROW}</div>`;
    const start = JSON.parse(sessionStorage.getItem("demo-cursor") ?? "[900,700]");
    Object.assign(el.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: "0",
      height: "0",
      zIndex: "2147483647",
      pointerEvents: "none",
      transform: `translate(${start[0]}px, ${start[1]}px)`,
      filter: "drop-shadow(0 2px 3px rgba(0,0,0,.35))",
      willChange: "transform",
    });
    document.documentElement.appendChild(el);
  };
  window.__demoCursor = {
    move(x, y, ms) {
      mount();
      const el = document.getElementById("demo-cursor");
      el.style.transition = `transform ${ms}ms cubic-bezier(.45,.05,.25,1)`;
      el.style.transform = `translate(${x}px, ${y}px)`;
      sessionStorage.setItem("demo-cursor", JSON.stringify([x, y]));
    },
    press() {
      const el = document.getElementById("demo-cursor");
      if (!el) return;
      el.querySelector("#demo-cursor-arrow")?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(0.85)" }, { transform: "scale(1)" }],
        { duration: 240, easing: "ease-out" },
      );
      // A soft ring at the tip, so the click reads in the clip.
      const ring = document.createElement("div");
      Object.assign(ring.style, {
        position: "absolute",
        left: "-14px",
        top: "-14px",
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        background: "rgba(236,114,48,.35)",
        border: "2px solid rgba(236,114,48,.8)",
      });
      el.prepend(ring);
      ring
        .animate(
          [
            { transform: "scale(.3)", opacity: 1 },
            { transform: "scale(1.4)", opacity: 0 },
          ],
          { duration: 450, easing: "ease-out" },
        )
        .finished.then(() => ring.remove());
    },
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
}

/** The ffmpeg Playwright downloads alongside its browsers, if there is one. */
async function playwrightFfmpeg() {
  const cache =
    process.env.PLAYWRIGHT_BROWSERS_PATH ??
    (process.platform === "darwin"
      ? path.join(os.homedir(), "Library/Caches/ms-playwright")
      : process.platform === "win32"
        ? path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright")
        : path.join(os.homedir(), ".cache/ms-playwright"));
  const dirs = (await readdir(cache).catch(() => [])).filter((d) => d.startsWith("ffmpeg-"));
  const bins = ["ffmpeg-mac", "ffmpeg-linux", "ffmpeg-win64.exe"];
  for (const dir of dirs.toSorted().reverse()) {
    const file = bins.map((bin) => path.join(cache, dir, bin)).find((f) => existsSync(f));
    if (file) return file;
  }
  return undefined;
}

const browser = await chromium.launch();

// Warm up first, so a dev server has compiled the route before the clip starts.
const warmup = await browser.newPage();
await warmup.goto(SCENARIO_URL, { waitUntil: "networkidle" });
await warmup.close();

const tmp = path.join(OUT, ".video-tmp");
await mkdir(tmp, { recursive: true });
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 1,
  recordVideo: { dir: tmp, size: VIEWPORT },
});
await context.addInitScript((progress) => {
  window.localStorage.setItem("digidojo-progress", progress);
}, PROGRESS);
await context.addInitScript(installCursor);
const page = await context.newPage();
const startedAt = Date.now();

const pause = (ms) => page.waitForTimeout(ms);

/** Glide the pointer to the element, then click it. */
async function tap(locator, { glideMs = 700, x = 0.5 } = {}) {
  await locator.waitFor();
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error(`No box for ${locator}`);
  const px = Math.round(box.x + box.width * x);
  const py = Math.round(box.y + box.height / 2);
  await page.evaluate(([cx, cy, ms]) => window.__demoCursor.move(cx, cy, ms), [px, py, glideMs]);
  await pause(glideMs + 150);
  await page.evaluate(() => window.__demoCursor.press());
  await locator.click();
}

/** Scroll the page smoothly by `dy` pixels over `ms`. */
async function glideScroll(dy, ms) {
  await page.evaluate(
    ([d, t]) =>
      new Promise((done) => {
        const from = window.scrollY;
        const t0 = performance.now();
        const step = (now) => {
          const k = Math.min(1, (now - t0) / t);
          const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
          window.scrollTo(0, from + d * e);
          if (k < 1) requestAnimationFrame(step);
          else done();
        };
        requestAnimationFrame(step);
      }),
    [dy, ms],
  );
}

// 1. Intro card. Hold the app's background colour until it loads, rather than a white flash.
await page.setContent('<body style="margin:0;height:100vh;background:#e8e4de"></body>');
await page.goto(SCENARIO_URL, { waitUntil: "networkidle" });
await pause(1800);
await tap(page.getByRole("button", { name: /start simulation/i }), { glideMs: 900 });

// 2. The scam DM arrives.
const sentences = page.getByRole("button", { name: "Flag this sentence" });
await sentences.filter({ hasText: "Want to try now?" }).waitFor();
await pause(1400);
await page.screenshot({ path: path.join(OUT, "demo-poster.jpg"), type: "jpeg", quality: 82 });

// 3. Flag the too-good pay.
await tap(sentences.filter({ hasText: "Students earn" }), { x: 0.35 });
await pause(700);
await tap(page.getByRole("radio", { name: "Too good to be true" }), { glideMs: 500 });
await pause(400);
await tap(page.getByRole("button", { name: "Flag it" }), { glideMs: 500 });
await pause(1000);

// 4. Check the account before deciding, and flag how new it is.
await tap(page.getByRole("button", { name: "Riya | Digital Promotions", exact: true }).last());
await pause(1500);
const joined = page.getByText("November 2026 (3 weeks ago)");
const joinedFlag = joined.locator("xpath=ancestor::*[.//button][1]").getByRole("button").last();
await tap(joinedFlag);
await pause(700);
await tap(page.getByRole("radio", { name: "No real process" }), { glideMs: 500 });
await pause(400);
await tap(page.getByRole("button", { name: "Flag it" }), { glideMs: 500 });
await pause(1000);
await tap(page.getByRole("button", { name: "Close" }).first(), { glideMs: 600 });
await pause(900);

// 5. Decide.
await tap(page.getByRole("button", { name: /Block the account/ }));
await pause(2600);

// 6. Outcome, then the debrief.
await tap(page.getByRole("button", { name: "See debrief" }));
await pause(2200);
await glideScroll(700, 3500);
await pause(2000);

const video = page.video();
const lengthS = (Date.now() - startedAt) / 1000;
await context.close();
const raw = await video.path();
const target = path.join(OUT, "demo.webm");
await browser.close();

// Playwright records at a fixed bitrate; mostly-still UI compresses ~4x at constant quality.
const ffmpeg = await playwrightFfmpeg();
if (ffmpeg) {
  execFileSync(ffmpeg, [
    ...["-hide_banner", "-loglevel", "error", "-y", "-i", raw],
    ...["-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1"],
    ...["-deadline", "good", "-cpu-used", "2", "-an", target],
  ]);
} else {
  console.warn("Playwright's ffmpeg not found; keeping the uncompressed recording.");
  await rename(raw, target);
}
await rm(tmp, { recursive: true, force: true });
console.log(`demo.webm (~${lengthS.toFixed(1)} s), demo-poster.jpg`);
