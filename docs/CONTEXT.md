# DigiDojo: Scam Season, project context

Course project for "Digital Literacy" (Information Systems, IIM Bangalore). Brief: build one digital artifact that improves digital literacy for Indians aged 15 to 25. 8-person team, organised as 4 pairs, one dojo per pair. Graded on effort, creativity, potential impact and quality, with a 5-minute live demo.

## 1. What the app is

DigiDojo is a webapp where young Indians live through the scams that actually target them, inside realistic fake versions of WhatsApp, Telegram, Instagram, SMS, UPI apps and phone calls. They make the decisions, see the consequence, rewind to the moment they slipped, and get a debrief naming the exact red flags and the manipulation tactic behind each.

Why it matters: Indians lost ₹22,845 crore to cyber fraud in 2024 across 36 lakh incidents. Existing Indian efforts (RBI Kehta Hai, CyberDost, NPCI, WhatsApp Scam Se Bacho) are ads and videos. None let people practise.

## 2. The four dojos

| Order | Dojo id        | Name         | Scenarios (planned)                                                                                                                                   |
| ----- | -------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `easy-money`   | Easy Money   | Task scam (Instagram ad → Telegram "prepaid tasks"), money-mule recruitment ("rent your UPI"), "sent by mistake, please refund" + UPI collect request |
| 2     | `dream-job`    | Dream Job    | Fake internship with a "laptop and training fee", including a live AI voice call from "HR"; fake offer letter                                         |
| 3     | `trust-me-bro` | Trust Me Bro | Voice-cloned friend ("bhai urgent ₹5k bhej"); free gaming currency → fake login page                                                                  |
| 4     | `authority`    | Authority    | "Digital arrest" video call from a fake cyber crime officer; fake KYC "account blocked in 2 hours"                                                    |

Every dojo also contains at least one **legit** scenario (a real internship, a real bank message) that the player should engage with normally. Rejecting everything must not win.

## 3. How a scenario works (the learning loop)

1. **Primer (optional, ~45 s).** One card naming the trick, e.g. "Small win first: they pay you a little so you trust them with a lot." A **cold run** scenario skips the primer and any hints, to show players they are vulnerable.
2. **Simulation (2 to 3 min).** Messages arrive in real time (typing indicator, delays) inside a fake app shell. The player can **tap any message to flag it** as suspicious. At 3 to 4 **decision points** the player picks a reply.
3. **Consequence.** Each path ends in an outcome: safe, a money loss, a partial loss, or a missed opportunity (for legit scenarios the player wrongly rejected). Losses show exact rupee amounts.
4. **Rewind.** Loss outcomes offer "Rewind" back to the decision node where the player could have stopped.
5. **Debrief.** Red flags seen vs caught, false alarms (flagged messages that were fine), the tactic behind each flag (urgency, social proof, small win first, sunk cost, authority, pay to earn...), one rule to remember, and the real-life action (call 1930, report at cybercrime.gov.in).

Later (not in the scaffold): a **belt test** per dojo (6 quick "scam or legit?" cards with confidence ratings, half legit), a before/after test for the pilot, a Day-7 rematch, and a share card.

Design rules from the research, which every dojo follows:

- Teach techniques, not facts. Each scenario centres on one named trick.
- Every interaction is a decision followed by instant, specific feedback on the exact cue.
- Always mix in legit content and score false alarms, so the app trains judgment, not blanket suspicion.
- Realism over cartoon villains: scam scripts are based on real reported scams, with slow trust-building and real payouts early on.

## 4. Architecture

```
src/
  app/
    layout.tsx                         # phone-width frame, fonts, providers
    page.tsx                           # home: dojo path
    dojo/[dojoId]/page.tsx             # dojo intro + scenario list
    dojo/[dojoId]/[scenarioId]/page.tsx  # scenario player
    not-found.tsx
  dojos/
    registry.ts                        # ordered list of dojos (imports each dojo's index.ts)
    easy-money/
      index.ts                         # defineDojo({...}) with its scenarios
      scenarios/task-scam-starter.ts   # the example scenario (see §6)
      components/                      # dojo-only components, if any
    dream-job/   index.ts  scenarios/
    trust-me-bro/ index.ts scenarios/
    authority/   index.ts  scenarios/
  engine/
    schema.ts                          # zod schemas + inferred types
    define.ts                          # defineScenario(), defineDojo() helpers (validate in dev)
    store.ts                           # zustand: current run (node, flags, history) + persisted progress
    ScenarioPlayer.tsx                 # renders the current node with the right shell
    Debrief.tsx
  shells/
    ChatShell.tsx                      # generic chat: header, bubbles, typing indicator, flag-on-tap; theme: whatsapp | telegram | instagram
    SmsShell.tsx                       # placeholder in scaffold
    UpiShell.tsx                       # placeholder in scaffold
    CallShell.tsx                      # placeholder in scaffold
    SimulationBadge.tsx
  i18n/
    locale.ts                          # Locale = "en" | "hinglish", default "hinglish"
    ui.ts                              # every UI string (incl. tactic labels/explanations); "en" complete, "hinglish" partial
    text.ts                            # resolveText(text, locale), falls back to en
    hooks.ts                           # useLocale(), useT(), useText()
    LanguageToggle.tsx                 # "EN | Hinglish" segmented toggle
    coverage.ts                        # counts text fields missing Hinglish (npm run i18n:report)
  components/ui/                       # shadcn
  lib/
tests/
  scenarios.test.ts                    # validates every registered scenario
```

Progress (completed scenarios) and the chosen language live in localStorage via zustand `persist` for now. A database comes later.

## 5. Scenario format

Write in `src/engine/schema.ts` with zod, then infer the TypeScript types. Shape:

```ts
// Authors write a plain string (English) or { en, hinglish? }.
// The zod schema normalises both to { en: string; hinglish?: string }.
type LocalizedText = string | { en: string; hinglish?: string };

type AppTheme = "whatsapp" | "telegram" | "instagram" | "sms" | "upi" | "call";

type Tactic =
  | "small-win-first"
  | "pay-to-earn"
  | "urgency"
  | "social-proof"
  | "sunk-cost"
  | "authority"
  | "isolation"
  | "too-good-to-be-true"
  | "flattery"
  | "impersonation";

interface Scenario {
  id: string; // kebab-case, unique within the dojo
  dojoId: DojoId;
  title: LocalizedText;
  summary: LocalizedText; // one line for the dojo page
  legit: boolean; // true = a real message the player should trust
  coldRun?: boolean; // true = no primer, no hints
  primer?: { title: LocalizedText; body: LocalizedText };
  startNodeId: string;
  nodes: Record<string, ScenarioNode>;
  redFlags: Record<string, { label: LocalizedText; tactic: Tactic; explanation: LocalizedText }>;
  debrief: { rule: LocalizedText; realWorldAction: LocalizedText };
}

type ScenarioNode =
  | {
      kind: "thread";
      app: AppTheme;
      contact: { name: LocalizedText; subtitle?: LocalizedText; avatar?: string };
      messages: Message[];
      choices: Choice[]; // at least one
    }
  | {
      kind: "outcome";
      result: "safe" | "loss" | "partial-loss" | "missed-opportunity";
      title: LocalizedText;
      body: LocalizedText;
      moneyDelta?: number; // rupees, negative = lost
      rewindToNodeId?: string;
    };

interface Message {
  id: string; // unique within the scenario
  from: "them" | "me" | "system"; // system = credit alerts, "X joined the group", etc.
  sender?: LocalizedText; // display name inside group chats
  text: LocalizedText;
  delayMs?: number; // default 800
  redFlagId?: string; // set only if this message carries a red flag
}

interface Choice {
  label: LocalizedText;
  nextNodeId: string;
}
```

### Evidence, email and triage (added for Dream Job)

Scenarios can do more than chat. All of it is data, checked by the same schema.

```ts
// A message can be split into phrases, each flaggable on its own (exactly one of text / segments).
interface Message { /* … */ text?: LocalizedText; segments?: Segment[] }
interface Segment { id?: string; text: LocalizedText; redFlagId?: string } // redFlagId needs an id

// Panels the player can open and inspect. A PDF is a "document"; each page is a section.
scenario.evidence: Record<string, {
  kind: "profile" | "company" | "web-page" | "document";
  title: LocalizedText; subtitle?: LocalizedText;
  sections: { heading?: LocalizedText; fields: Field[] }[];
}>;
interface Field { id: string; label?: LocalizedText; value: LocalizedText; redFlagId?: string; finePrint?: boolean }

// Extra node kinds next to "thread" and "outcome".
| { kind: "email"; app: "gmail"; email: Email; evidence?: string[]; choices: Choice[] }
| { kind: "compose"; app: "gmail"; to: Address; subject: LocalizedText; body: LocalizedText; choices: Choice[] } // reply preview
| { kind: "triage"; app: "gmail"; items: { id; email: Email; correct: "legit" | "scam" | "needs-checking"; explanation }[]; nextNodeId: string }

interface Email {
  displayName: LocalizedText;
  from: Address; showFromAddress?: boolean; // otherwise tap the sender to see it
  replyTo?: Address; to: Address;
  date; subject; preview: LocalizedText;
  body: Segment[][];                       // paragraphs of phrases
  attachments?: { id; shownName; fullName; actualType; sizeLabel?; documentId?; redFlagId? }[];
  links?: { id; text: LocalizedText; actualUrl: string; redFlagId? }[]; // inert, never opened
}
interface Address { id: string; address: string; redFlagId?: string }
```

- Threads and email nodes take `evidence: [panelId, …]`: buttons such as "View profile" or "Check careers page".
- Every flaggable item (message, phrase, address, attachment, link, panel field) shares one id space per scenario. `src/engine/evidence.ts` (`collectFlaggables`) is the one place that lists them.
- New tactics: `no-real-process`, `data-harvest`, `malicious-file`, `disguised-link`. New outcome result: `compromised` (identity, device or account harm with no money moved).
- A dojo may set `takeaways: LocalizedText[]`, shown on the dojo page.
- **Seen** means revealed: a message appeared, the sender was tapped, a panel or attachment was opened. The debrief splits red flags into **caught**, **missed** (seen, not flagged), **didn't check** (on a screen the player reached but behind an inspection they skipped), **not reached**, plus false alarms and a per-email triage table.

Validation (in `defineScenario` during dev and in `tests/scenarios.test.ts`):

- `startNodeId`, every `nextNodeId` and every `rewindToNodeId` points to an existing node (rewinds point to a non-outcome node).
- Every `redFlagId` exists in `redFlags`, and every red flag is used by at least one flaggable item.
- Every `evidence` id and attachment `documentId` is a panel.
- Every scenario can reach at least one outcome.
- Flaggable ids (messages, phrases, addresses, attachments, links, panel fields) are unique within a scenario.

Engine behaviour:

- Messages in a thread reveal one by one using `delayMs`, with a typing indicator before each `them` message. Choices appear after the last message.
- Tapping a message toggles its flag. Flags persist across nodes for the whole run, including after a rewind.
- Debrief: red flags _seen_ = flags on messages the player actually saw; _caught_ = those the player flagged; _false alarms_ = flagged messages with no `redFlagId`.
- Rewind keeps flags but returns to the target node.
- Finishing a scenario (reaching the debrief) marks it complete in persisted progress.

### Language

Scenarios are written in **English**. Every player-facing field above is a `LocalizedText`: write a plain string, which counts as English, and leave Hinglish to the translation pass. `/translate-hinglish <scenario file>` turns each string into `{ en, hinglish }` and never changes `en`. Dojo `name` and `tagline` are `LocalizedText` too.

- The app has two locales, `en` and `hinglish`, and defaults to `hinglish`. Where a field has no Hinglish yet, the player sees the English.
- Every screen has a small **EN | Hinglish** toggle: in the top bar of app screens, and in the strip above each fake app (next to the Simulation label) in the player. The choice is saved with progress in localStorage, so it survives a reload, and `<html lang>` follows it (`en` / `hi-Latn`).
- Switching mid-scenario re-renders the current screen in the other language. The run, flags and history stay as they are.
- Components never read `.en` / `.hinglish`. Scenario text goes through `useText()` and UI strings through `useT()` (`src/i18n/ui.ts`, where `en` must have every key). Both fall back to English.
- `npm run i18n:report` lists, per scenario, how many fields still lack Hinglish. Missing Hinglish never fails tests or the build.

## 6. Scaffold spec (build this now)

Goal: anyone on the team can `git pull`, `npm install`, `npm run dev`, open the app, and start building their dojo by copying the example scenario.

Build:

1. Next.js (latest, App Router, TypeScript strict, `src/` dir, Tailwind v4, ESLint) in the existing repo root. If the folder isn't empty, generate in a temp folder and move the files in without overwriting `.git`.
2. Prettier, `.nvmrc` (current Node LTS), `.editorconfig`, `.env.example` (empty for now), scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `format`.
3. shadcn/ui initialised. Add `button`, `card`, `badge`, `progress`. Install `zustand`, `zod`, `motion`, `vitest`.
4. The engine (§5): schema, `defineScenario`, `defineDojo`, store, `ScenarioPlayer`, `Debrief`, tactic labels (now in `src/i18n/ui.ts`).
5. `ChatShell` with three themes (WhatsApp green, Telegram blue, Instagram gradient-free purple). Use our own simple look, not copies of the real apps' branding. Placeholder components for `SmsShell`, `UpiShell` and `CallShell` that render "Coming soon: <name> shell".
6. Registry with the 4 dojos in §2, each with a `index.ts`. Easy Money contains the example scenario below. The other three each contain one placeholder scenario with a single outcome node, titled "Coming soon".
7. Screens:
   - **Home** (`/`): app name, a one-line tagline, and the 4 dojos as a vertical path of cards (order number, name, tagline, scenario count, progress). All clickable for now.
   - **Dojo** (`/dojo/[dojoId]`): dojo name and tagline, list of scenarios with completed ticks, back button. Unknown id → 404.
   - **Player** (`/dojo/[dojoId]/[scenarioId]`): primer card (if any) → threads → outcome → debrief → "Back to dojo". Unknown id → 404.
   - Every simulation screen shows the `SimulationBadge`.
8. Example scenario `easy-money/task-scam-starter` (keep it short, it's a pattern to copy):
   - `dm` (instagram, "Priya · HR"): "Hi! Saw your profile. Part-time work from home, earn ₹3,000/day just by liking YouTube videos" (red flag `pay-far-above-work`, tactic `too-good-to-be-true`), "No experience needed. Interested?". Choices: "Yes, interested!" → `task`; "Ignore and block" → `safe-early`.
   - `task` (instagram): "Task: like 3 videos, send screenshots. ₹50 per like.", system "₹150 credited to your UPI" (red flag `instant-small-payout`, tactic `small-win-first`), "More tasks in our Telegram group". Choice: "Join the group" → `group`.
   - `group` (telegram, "Earn Daily VIP · 1,204 members"): sender Rahul "Got ₹2,800 today [screenshot]" (flag `payout-screenshots`, `social-proof`); sender Mentor "Prepaid task: send ₹1,000, receive ₹1,300 in 10 min" (flag `pay-to-earn`, `pay-to-earn`); Mentor "Only 3 slots left!" (flag `slots-left`, `urgency`). Choices: "Pay ₹1,000" → `lost`; "Leave and report the group" → `safe-late`.
   - Outcomes: `safe-early` (safe), `safe-late` (safe, kept the ₹150 bait), `lost` (loss, moneyDelta −12550, body "You paid ₹14,000 over three 'tasks' and got back ₹1,450.", rewindToNodeId `group`).
   - Debrief rule: "If you have to pay to get paid, it's a scam." Real-world action: "Lost money? Call 1930 right away and report at cybercrime.gov.in."
9. `tests/scenarios.test.ts` validating every registered scenario (§5 rules).
10. GitHub Actions workflow on pull requests and pushes to `main`: install, lint, typecheck, test, build.
11. `.github/CODEOWNERS` (lead owns `src/engine/`, `src/shells/`, `src/app/`, `src/dojos/registry.ts`; each pair owns its dojo folder; use placeholder usernames to fill in), and a PR template (what changed, screenshots, checklist: lint/typecheck/test/build pass, no real brands, no real secrets asked).
12. README: what the app is (2 lines), setup (Node version, `npm install`, `npm run dev`), folder map, **"How to add a scenario" in under 10 steps**, branch and PR rules.

Acceptance:

- `npm run dev`: home shows 4 dojos → Easy Money → the example scenario plays end to end with delays, typing indicator, flag-on-tap, choices, outcome, rewind and debrief (caught, missed, false alarms).
- The other 3 dojos open and show their "Coming soon" scenario.
- Looks right at 390 px and centred at desktop width.
- `npm run lint && npm run typecheck && npm test && npm run build` all pass.

Not in the scaffold (later phases): database and auth, the AI voice call (Vapi), the belt test, the before/after pilot test, Day-7 rematch, share card, PWA, analytics (PostHog), final visual design.

## 7. Ownership

| Area                                                             | Owner            |
| ---------------------------------------------------------------- | ---------------- |
| Engine, routes, registry, `ChatShell`, CI, reviews               | Lead (Vasumitra) |
| Easy Money dojo + `UpiShell`                                     | Pair 1           |
| Dream Job dojo + `CallShell` (voice integration with the lead)   | Pair 2           |
| Trust Me Bro dojo + Instagram theme polish and voice-note player | Pair 3           |
| Authority dojo + `SmsShell` and video-call screen                | Pair 4           |

## 8. Guardrails

- All people, companies, agencies and apps in scenarios are fictional. No real logos or brand names.
  - Exception agreed by the lead: Dream Job's player-facing text keeps the blueprint's platform names (LinkedIn, Gmail, WhatsApp, `@gmail.com` addresses, an `@okaxis` UPI handle), because spotting a free-mail sender is the lesson. The shells still use our own look and no logos. All companies, people and domains stay fictional (`*.example`).
- Never ask players for real OTPs, PINs, card numbers or passwords.
- No "play the scammer" mode. Sextortion appears only as a text guidance card, never a simulation.
- No political content.
