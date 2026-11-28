---
description: Set up a worktree session for one task, then ship it via a PR and remove the worktree
argument-hint: <what you want done, e.g. update the landing demo to use the new photo>
---

You are running in a git worktree under `.claude/worktrees/`, separate from the main DigiDojo checkout. Other Claude sessions may be working in other worktrees at the same time.

Task: $ARGUMENTS

## Setup (do this first)

1. Find the main checkout's path: it's the first entry of `git worktree list`. Call it `<main-checkout>` below.
2. Rename this branch to our convention: `git branch -m <dojo-id>/<short-desc>`, or `core/<short-desc>` for shared work. Pick a name that fits the task.
3. Rebase onto the local `main` (`git rebase main`). Local `main` is often ahead of `origin/main`.
4. Run `npm install`. If you need the dev server, run it on a free port other than 3000 (for example `npm run dev -- -p 3001`).

## While working

- Only edit files inside this worktree. Never touch `<main-checkout>` or other worktrees.
- Follow `CLAUDE.md`. Commit small and often, with short imperative messages. Never mention Claude in commits, PRs or code.
- Before calling anything done, run `npm run lint && npm run typecheck && npm test && npm run build`. All four must pass.

## Shipping (only when I say the work is finished)

1. Rebase onto `main` again, rerun the four checks, and push the branch.
2. Open a PR into `main` with `gh pr create`, filling in `.github/pull_request_template.md`: what changed and why, and how to see it.
3. Wait for CI with `gh pr checks --watch`. Fix any failures and push again.
4. Once CI is green, merge with `gh pr merge --merge --delete-branch`.
5. Update the local `main`: `git -C <main-checkout> pull --ff-only`. If `<main-checkout>` has uncommitted changes, isn't on `main`, or the pull can't fast-forward, stop and tell me instead of forcing anything.

## Cleanup (only after the PR is merged)

1. Remove this worktree and its local branch. Use the ExitWorktree tool with remove if you have it. Otherwise `cd <main-checkout>`, then run `git worktree remove .claude/worktrees/<name>` and `git branch -D <branch>`.
2. Tell me it's safe to `/exit`.
