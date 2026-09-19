# Session consolidation plan (2026-09-19)

Snapshot of the 40 most recent Claude sessions and the 57 remote branches,
with a plan to close everything out in the fewest sessions and tokens.

## What is actually still open

| Item | State | Cost so far |
|---|---|---|
| PR #151 wave9-ai-domain | CI green, **merge conflict**, 11 behind main | 618k tokens (session Q37uhgnQUz) |
| PR #128 elegant-carson (staff + portal access) | CI green, **merge conflict**, 29 behind main | 156k + 663k (two sessions on one branch) |
| PR #127 intelligent-heisenberg (F-008/F-010/demo badge) | CI green, **merge conflict**, 80 behind main, 172 files | 292k |
| BLK-004 (mock-only screens) | 224 -> ~227 remaining, 3 branches triaging it | ~1.3M across blk-004-*, wave8, wave9 |
| Netlify + Cloudflare deploy checks | Fail on every PR, not caused by any PR | wasted re-diagnosis per session |

Everything else in the session list is COMPLETED, ARCHIVED, or BLOCKED on
the user (Obsidian/Locize auth, design uploads, DNS), and 45+ branches are
100 to 300 commits behind main with 0 to 2 unique commits.

## Where the tokens went

1. **Three sessions kept re-merging main into the same three PRs** as other
   PRs merged (the "Merge main into X again after PR #NNN merged" commits).
   Each merge re-ran docs regeneration and the full 3.9k-test suite.
2. **Doc regeneration conflicts.** Generated registries (API_REGISTRY,
   TEST_REGISTRY, domain docs) conflict on every concurrent PR and are
   resolved by regenerating, which is correct but repeated 6+ times.
3. **Re-triage of the same BLK-004 screens** by parallel sessions (PR #151
   and PR #152 both fixed the same four files independently).
4. **Netlify/Cloudflare failures** re-investigated in each session although
   they are infra, not code.
5. **Long master prompts** (28-section "finish every workstream") that a
   session cannot complete, producing 100+ comment threads and honest
   "not done" reports instead of merged code.

## Plan: finish in one serial pass

Order is smallest-conflict first so each merge shrinks the next conflict.

1. **Merge PR #151 first** (2 unique files after PR #152, 4 behind main).
   One session: merge main, regenerate docs, `npm run typecheck`, push, merge.
   Budget: 30k tokens.
2. **Merge PR #128 second** (7 unique commits, auth routes + 2 screens).
   Same recipe. Server tests run in CI only, so do not try to start
   Postgres locally. Budget: 60k tokens.
3. **Split PR #127 instead of rebasing it.** It is 172 files and 80 behind;
   another full merge will cost more than re-cutting. Cherry-pick onto a
   fresh branch from main only: the F-008 equity seed fix, the 6 icon
   renames, DemoBadge, the dead auth.ts removal. Drop the PR #124 merge
   (already in main) and all generated-doc churn, then regenerate once.
   Budget: 80k tokens. Close #127 with a link to the new PR.
4. **BLK-004: stop per-screen sessions.** Run `npm run registry` once,
   export the remaining MOCK_ONLY list, and bucket it into
   (a) has a contract collection -> wire, (b) no collection -> EmptyState
   GAP. Do bucket (b) in one mechanical session (it is the same
   EmptyState pattern already used in waves 6-9). Do bucket (a) in
   domain-sized PRs, one branch each, merged serially, never in parallel.
5. **Delete stale branches** (everything 100+ behind with <=2 unique
   commits: agent-w4*, agent-1x/2x, claude/w2..w12, salvage/*, hostinger
   debug branches). Keep only the three PR branches and main. This
   removes the temptation to "resume" dead work.
6. **Archive sessions** that are COMPLETED or BLOCKED on external auth
   so the list only shows live work.

## Rules that cut cost on every future session

- One PR open per generated-doc area at a time. Serialize, do not fan out.
- Regenerate docs only in the final commit before push, not per commit.
- Treat Netlify/Cloudflare checks as non-blocking; do not investigate them.
- Cap prompts to one deliverable per session; no 28-section master prompts.
- Run the narrow check for the change (typecheck + the touched test file),
  and let CI run the full 3.9k-test suite.
- Start every session with `git fetch origin main` and merge before
  editing, so the merge conflict is resolved once, at the start.
