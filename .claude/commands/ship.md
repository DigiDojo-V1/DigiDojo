---
description: Check, commit, push and open a pull request for the current branch
---

Get my current work ready for review:

1. If the current branch is `main`, stop. Tell me to create a branch named `<dojo-id>/<short-desc>` (or `core/<short-desc>` for shared work) first and show me the command.
2. Run `git fetch origin` and merge `origin/main` into this branch. If there are conflicts outside my dojo folder, stop and explain them instead of resolving them.
3. Run `npm run lint && npm run typecheck && npm test && npm run build`. Fix failures in files changed on this branch. If a failure is in shared code (`src/engine/`, `src/shells/`, `src/app/`), stop and tell me to message the lead.
4. Show `git status` and a one-line summary per changed file. If any changed file is outside `src/dojos/<my-dojo>/` or `docs/scenarios/<my-dojo>/`, list it and ask me to confirm it's intended before going on.
5. Commit with a short imperative message (example: `Add money-mule recruitment scenario`) and push the branch.
6. If the `gh` CLI is installed and logged in, open a pull request into `main` using `.github/pull_request_template.md`: fill in what changed and how to play it (`http://localhost:3000/dojo/<dojo-id>/<scenario-id>`). Otherwise, give me the link to open it myself: `https://github.com/DigiDojo-V1/DigiDojo/compare/main...<branch>?expand=1`.
7. Remind me to attach a screenshot or short screen recording of playing the scenario to the PR.
