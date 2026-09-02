---
name: daily
description: Create today's daily note from the vault template, link yesterday's note, and carry over unfinished tasks. Use when the user asks for their daily note, says "start my day", or invokes /daily.
---

# Daily note

Follow the vault conventions in `CLAUDE.md` (folder layout, frontmatter, tags).

1. Determine today's date and the path `daily/YYYY-MM-DD.md`.
   - If the note already exists, don't recreate it — report that it exists
     and offer to carry over tasks into it instead.
2. Find the most recent previous daily note (it may not be yesterday —
   scan `daily/` for the latest date before today).
3. Collect every unfinished task (`- [ ]`) from that note.
4. If `templates/daily.md` exists, use it as the base (fill in dates).
   Otherwise use:

   ```markdown
   ---
   created: <today>
   tags: [daily]
   ---
   # <YYYY-MM-DD>

   ← [[<previous daily note>]]

   ## Plan

   ## Carried over
   <unfinished tasks from the previous daily note>

   ## Notes

   ## Done
   ```

5. Create the note. Do not modify the previous daily note (carried-over
   tasks stay checked-off-able in both places; the new note is the live copy).
6. Reply with the note path and the number of tasks carried over.
