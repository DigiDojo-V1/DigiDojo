# DigiDojo: Scam Season

DigiDojo is a mobile-first webapp where Indians aged 15 to 25 practise against real scams inside fake versions of the apps those scams happen in.
Players make the decisions, see the consequence, rewind to the moment they slipped, and get a debrief naming each red flag and the trick behind it.

Full product, learning design and scenario format: [`docs/CONTEXT.md`](docs/CONTEXT.md).

## Setup

You need Node **26** (the version in `.nvmrc`; Node 20.9+ also works) and npm.

```bash
nvm use          # or: nvm install
npm install
npm run dev      # http://localhost:3000
```

| Script                 | Does                              |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Dev server                        |
| `npm run build`        | Production build                  |
| `npm run lint`         | ESLint                            |
| `npm run typecheck`    | Generates route types, then `tsc` |
| `npm test`             | Vitest (validates every scenario) |
| `npm run format`       | Prettier, writes changes          |
| `npm run format:check` | Prettier, only checks             |

Before you push: `npm run lint && npm run typecheck && npm test && npm run build`. CI runs the same four.

## Folder map

```
src/
  app/                      routes only (home, dojo, player, 404)
  dojos/
    registry.ts             ordered list of dojos (lead only)
    <dojo-id>/
      index.ts              defineDojo({...}) with its scenarios
      scenarios/*.ts        one file per scenario
      components/           dojo-only components, if any
  engine/                   schema (zod), defineScenario, store, ScenarioPlayer, Debrief, tactics
  shells/                   fake app UIs: ChatShell (whatsapp/telegram/instagram themes), Sms/Upi/Call placeholders
  components/ui/            shadcn primitives (add with npx shadcn@latest add <name>)
tests/                      vitest: schema rules + every registered scenario
docs/CONTEXT.md             the project brief
```

## How to add a scenario

1. Branch from `main`: `git checkout -b <dojo-id>/<short-desc>` (e.g. `easy-money/upi-mule`).
2. Copy `src/dojos/easy-money/scenarios/task-scam-starter.ts` into `src/dojos/<your-dojo>/scenarios/<scenario-id>.ts`.
3. Rename the export, set `id` (kebab-case) and `dojoId`, and write `title`, `summary`, `legit`, and a `primer` (or `coldRun: true`).
4. Write the `nodes`: `thread` nodes (app, contact, messages, choices) leading to `outcome` nodes (safe / loss / partial-loss / missed-opportunity). Put `rewindToNodeId` on losses.
5. Put a `redFlagId` on each message that carries a cue, and define each one in `redFlags` with a `tactic` from `src/engine/tactics.ts`.
6. Fill in `debrief.rule` (one line) and `debrief.realWorldAction`.
7. Import it in your dojo's `index.ts` and add it to `scenarios`. If it's your first real scenario, delete `coming-soon.ts`.
8. Run `npm test` (it tells you exactly which rule is broken), then `npm run dev` and play it at 390 px wide.
9. Open a PR with screenshots.

Rules: everything fictional (no real brands, logos, banks, agencies or officer names); never ask for real OTPs, PINs, card numbers or passwords; player-facing text in natural Hinglish; each dojo needs at least one **legit** scenario so rejecting everything never wins.

## Branches and PRs

- Never commit to `main`. Branch as `<dojo-id>/<short-desc>`. Shared work uses `core/<short-desc>`.
- Stay in your dojo folder. Never import from another dojo. Need something shared? Propose it for `src/engine/` or `src/shells/` in its own PR.
- Small PRs into `main`. CI must pass and one teammate must approve (see `.github/CODEOWNERS`).
- Commit messages: imperative and short (`Add UPI collect-request screen`).
