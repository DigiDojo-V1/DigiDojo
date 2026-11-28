# DigiDojo: rules for Claude Code

DigiDojo is a mobile-first webapp where Indians aged 15 to 25 practise against real scams inside fake versions of the apps those scams happen in. Read `docs/CONTEXT.md` before any non-trivial task: it has the product, the learning design, the architecture and the scenario format.

## Stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui · motion (Framer Motion) · zustand · zod · Vitest · ESLint + Prettier · npm.

## Where things live

| Path                    | What                                                                        | Who edits                                                                  |
| ----------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `src/dojos/<dojo-id>/`  | One dojo: its meta, scenarios and any dojo-only components                  | The pair that owns that dojo                                               |
| `src/dojos/registry.ts` | The list of dojos shown on the home screen                                  | Lead only                                                                  |
| `src/engine/`           | Scenario types, zod schema, the player state machine, debrief logic         | Lead reviews every change                                                  |
| `src/shells/`           | Fake app UIs: chat (WhatsApp / Telegram / Instagram themes), SMS, UPI, call | Shared. Extend with props or themes, never copy a shell into a dojo folder |
| `src/i18n/`             | Language toggle, UI strings (`ui.ts`), `useT()` / `useText()` hooks         | Lead reviews. Add every new UI string to `en` in `ui.ts`                   |
| `src/components/ui/`    | shadcn primitives                                                           | Add with `npx shadcn@latest add <name>`, don't hand-edit                   |
| `src/app/`              | Routes only, kept thin                                                      | Lead reviews                                                               |

## Rules

- **Scenarios are data.** Write them as typed objects with `defineScenario()` in `src/dojos/<dojo-id>/scenarios/`. Never hard-code a scenario's story in JSX.
- **Stay in your folder.** Never import from another dojo's folder. Need something shared? Propose it for `src/engine/` or `src/shells/` in its own PR.
- **Mobile-first, responsive.** Design at 390 px, then check 768 px and 1280 px. Phones: one 420 px column. From `lg` (1024 px) each fake app uses its real desktop layout (webmail, professional-network messaging, messenger web) with the Dojo panel docked on the right; phone-only apps (SMS, UPI, calls) sit in `PhoneFrame`. DigiDojo's own pages use `HomeShell`; the screens around a scenario (intro, how to play, outcome, debrief) sit in one `ScreenCard`. In a shell, branch on `useInDojoPanel()` for desktop structure; use `lg:` classes for styling only.
- **Everything fictional.** No real company, bank, agency, app brand, logo or officer names. Every simulation screen carries a small "Simulation" label. Exception: the Instagram shell (`src/shells/instagram/`) replicates Instagram's real UI and logo, as the product owner asked; people, handles and stories in it stay fictional. Its inbox also shows the IIM Bangalore logo for an "IIMB UG" group, used with permission. Likewise the mail shell (`src/shells/MailShell.tsx`, `src/shells/gmail/`) replicates Gmail's real UI and logo, and PDFs open in a Google Drive-style viewer, as the product owner asked; senders, addresses and documents in it stay fictional. The landing page's phone (`src/components/landing/figures/LinkedInPhone.tsx`) likewise replicates LinkedIn's mobile messaging UI, as the product owner asked; the person and messages in it stay fictional.
- **Never collect real secrets.** The app never asks for real OTPs, PINs, card numbers or passwords. Fields that look like it accept anything and store nothing.
- **Language.** Write all player-facing text in English. Hinglish is added later with /translate-hinglish; never change en text while translating.
- **No hard-coded UI text.** Components get UI strings from `useT()` (`src/i18n/ui.ts`) and scenario text from `useText()`. Never read `.en` or `.hinglish` directly.
- **Types.** No `any`. Validate data at boundaries with zod.
- **Done means green.** Before you say a task is finished, run `npm run lint && npm run typecheck && npm test && npm run build`. All four must pass.

## Workflow

Adding a scenario: write it from docs/SCENARIO_TEMPLATE.md, then run /new-scenario <path>. Finishing work: run /ship. Full workflow: docs/HOW_WE_WORK.md.

## Git

- Never commit to `main`. Branch as `<dojo-id>/<short-desc>` (example: `easy-money/telegram-group`). Shared work uses `core/<short-desc>`.
- Small PRs into `main`. CI must pass and one teammate must approve.
- Commit messages: imperative, short (`Add UPI collect-request screen`).
