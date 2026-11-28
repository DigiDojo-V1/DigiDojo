// Captures the landing page's dojo card images and demo clip from the running app.
//
//   npm run dev                      # in one terminal
//   npm run capture:landing          # in another (optionally: -- http://localhost:3001)
//
// Writes public/landing/dojo-<id>.jpg, demo.webm and demo-poster.jpg. Everything captured is
// the app's own fictional content. Needs Playwright's Chromium: `npx playwright install chromium`.

import { mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = path.resolve("public/landing");
const VIEWPORT = { width: 1280, height: 800 };

/** One scenario per dojo that has real content, and how long to let its messages arrive. */
const CARDS = [
  { dojo: "easy-money", scenario: "task-scam", settleMs: 9000 },
  { dojo: "dream-job", scenario: "easy-too-good", settleMs: 6000 },
  { dojo: "authority", scenario: "kyc-call", settleMs: 4000 },
];
const DEMO = { dojo: "easy-money", scenario: "task-scam", lengthMs: 13000 };

/** English, tutorial already seen, so scenarios open straight on their intro. */
const PROGRESS = JSON.stringify({
  state: { completed: {}, locale: "en", tutorialSeen: true },
  version: 1,
});

async function newContext(browser, extra = {}) {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, ...extra });
  await context.addInitScript((progress) => {
    window.localStorage.setItem("digidojo-progress", progress);
  }, PROGRESS);
  return context;
}

async function openScenario(page, dojo, scenario) {
  await page.goto(`${BASE}/digidojo/dojo/${dojo}/${scenario}`, { waitUntil: "networkidle" });
  // Hide the Next.js dev badge.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  const start = page.getByRole("button", { name: /start simulation/i });
  if (await start.isVisible().catch(() => false)) await start.click();
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const card of CARDS) {
  const context = await newContext(browser);
  const page = await context.newPage();
  await openScenario(page, card.dojo, card.scenario);
  await page.waitForTimeout(card.settleMs);
  await page.screenshot({
    path: path.join(OUT, `dojo-${card.dojo}.jpg`),
    type: "jpeg",
    quality: 82,
  });
  await context.close();
  console.log(`dojo-${card.dojo}.jpg`);
}

{
  const tmp = path.join(OUT, ".video-tmp");
  const context = await newContext(browser, { recordVideo: { dir: tmp, size: VIEWPORT } });
  const page = await context.newPage();
  await openScenario(page, DEMO.dojo, DEMO.scenario);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT, "demo-poster.jpg"), type: "jpeg", quality: 82 });
  await page.waitForTimeout(DEMO.lengthMs - 2500);
  const video = page.video();
  await context.close();
  await rename(await video.path(), path.join(OUT, "demo.webm"));
  await rm(tmp, { recursive: true, force: true });
  console.log("demo.webm, demo-poster.jpg");
}

await browser.close();
