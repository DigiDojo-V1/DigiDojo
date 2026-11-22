# How we work

You write the story. Claude builds it. The checks catch mistakes. You play it before anyone reviews it.

## One-time setup (15 minutes)

1. Install Node (version in `.nvmrc`), Git, VS Code and Claude Code.
2. Clone the repo, then:
   ```bash
   git clone https://github.com/DigiDojo-V1/DigiDojo.git
   cd DigiDojo
   npm install
   npm run dev
   ```
3. Open http://localhost:3000, go into Easy Money and play the example scenario to the end. That's the pattern every scenario follows.

## Adding a scenario (one scenario = one pull request)

1. **Write the script.** Copy `docs/SCENARIO_TEMPLATE.md` to `docs/scenarios/<dojo-id>/<scenario-id>.md` and fill it in from a real reported case. Go through the checklist at the bottom with your partner.
2. **Start a branch from fresh main:**
   ```bash
   git checkout main && git pull
   git checkout -b <dojo-id>/<scenario-id>
   ```
3. **Build it.** In Claude Code, run:
   ```
   /new-scenario docs/scenarios/<dojo-id>/<scenario-id>.md
   ```
   If Claude asks questions about gaps in the script, fix the script, not the code.
4. **Play every path** in the browser at phone width (DevTools → device toolbar → 390 px). Anything off? Tell Claude what to change.
5. **Ship it.** In Claude Code, run `/ship`. It checks everything, commits, pushes and opens the PR. Attach a screen recording of you playing it.
6. **Review.** The lead or another pair checks out your branch, plays it and approves. Then merge.

## Building something that isn't a scenario

For a shell, an animation or any new feature:

1. Put Claude Code in plan mode (press Shift+Tab until it says plan mode) and describe what you want.
2. If the plan touches `src/engine/`, `src/shells/` or `src/app/`, paste it in the group chat and wait for the lead's OK.
3. Then let Claude build it, and finish with `/ship`.

## Rules of thumb

- **Never let Claude write the story.** Ask it for help with code, not scam scripts.
- **Stay in your dojo folder.** If Claude wants to change shared code, stop and message the lead.
- **Small PRs.** One scenario or one feature each.
- **Pull `main` before you start anything.**
- **Run `/clear` between tasks** so Claude starts fresh and stays focused.
- **Stuck for more than 30 minutes?** Ask in the group chat.
