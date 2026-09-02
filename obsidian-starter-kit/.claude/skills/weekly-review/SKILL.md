---
name: weekly-review
description: Synthesize the past week's daily notes into a weekly review note with themes, wins, open loops, and next-week priorities. Use for "weekly review", "summarize my week", or /weekly-review.
---

# Weekly review

Follow the vault conventions in `CLAUDE.md`.

1. Determine the week to review: the last 7 days by default, or the range the
   user specifies. Read every `daily/` note in that range in full.
2. Also check `git log --since` (if the vault is a git repo) for notes created
   or heavily edited this week outside `daily/` — they are part of the week's
   story too.
3. Write `daily/YYYY-[W]WW-review.md` (e.g. `daily/2026-W36-review.md`):

   ```markdown
   ---
   created: <today>
   tags: [review/weekly]
   ---
   # Week <WW>, <year> review

   ## Themes
   <2-4 recurring threads across the week, each linking to the daily notes
   and any project/reference notes involved>

   ## Wins
   <completed tasks and finished work, grouped, not a raw task dump>

   ## Open loops
   <unfinished tasks and unanswered questions still hanging, with links>

   ## Next week
   <3-5 suggested priorities inferred from the open loops — mark these
   clearly as suggestions>
   ```

4. Synthesize; don't transcribe. A reader should get the week in 2 minutes
   without opening the daily notes. Every claim should link to its source
   note with a wikilink.
5. Reply with the review path and the one-line headline of the week.
