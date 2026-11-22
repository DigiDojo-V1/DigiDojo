---
description: Turn a filled-in scenario script into a playable DigiDojo scenario
argument-hint: <path to script, e.g. docs/scenarios/easy-money/mule-recruitment.md>
---

You are adding ONE scenario to DigiDojo from a script a teammate wrote.

Script: $ARGUMENTS

Follow these steps in order:

1. Read `CLAUDE.md`, `docs/CONTEXT.md` (sections 3 and 5), the script file, and `src/dojos/easy-money/scenarios/task-scam-starter.ts` as the reference pattern.
2. Check the script is complete. Stop and list the gaps as questions, without writing code, if any of these is true:
   - a choice points to a scene or outcome that doesn't exist
   - an outcome has no result type
   - a red flag has no tactic, or isn't attached to any message
   - a rewind points to an outcome instead of a scene
   - a scene uses the sms, upi or call app (those shells are still placeholders)
   - a scam scenario has no "Based on a real case" link

   Never invent story content, messages or red flags. The humans write the story; you build it.

3. Create `src/dojos/<dojo-id>/scenarios/<scenario-id>.ts` with `defineScenario()`. Scripts are written in English, so every text field goes in as a plain string (`title: "Like videos, earn money"`), not as `{ en, hinglish }`. Keep the script's wording exactly as written (fix only obvious typos). **Do not translate anything and do not add `hinglish`**: that happens later, in a separate pass, with `/translate-hinglish <scenario file>`. Give every message a unique kebab-case `id`. Register the scenario in that dojo's `index.ts`; if the dojo still has `scenarios/coming-soon.ts`, delete it and remove it from `index.ts`.
4. Edit only files inside `src/dojos/<dojo-id>/`. If the scenario needs something the engine or shells can't do yet, stop and describe exactly what's missing so the lead can add it. Do not change shared code.
5. Run `npm run lint && npm run typecheck && npm test && npm run build` and fix any failures in the files you created. `npm test` validates every scenario against `src/engine/schema.ts`.
6. Finish with:
   - the URL to play it: `http://localhost:3000/dojo/<dojo-id>/<scenario-id>`
   - every path from the start to each outcome, as a short list
   - any red flag the player can't see on some path, and any scene no path reaches
   - a reminder that the scenario is English-only for now: the app shows English in both languages until someone runs `/translate-hinglish src/dojos/<dojo-id>/scenarios/<scenario-id>.ts`
