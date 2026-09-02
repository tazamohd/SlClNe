---
name: inbox
description: Process quick-capture notes in inbox/ — title, tag, add frontmatter, and file each into the right vault folder. Use for "process my inbox", "clean up captures", or /inbox.
---

# Inbox processing

Follow the vault conventions in `CLAUDE.md`. This skill moves the user's
raw captures, so work transparently and never discard content.

1. List every note in `inbox/`. If empty, say so and stop.
2. For each note, read it and decide:
   - **Title**: a clear, searchable title (rename the file to match, keeping
     wikilink-safe characters).
   - **Frontmatter**: add the standard block from `CLAUDE.md` with sensible
     tags; keep any frontmatter already present.
   - **Destination**: `projects/<project>/` if it belongs to an active
     project, `reference/` if it's an evergreen idea or fact, `daily/`'s
     "Notes" section if it's a diary-ish fragment, `archive/` only if it's
     clearly obsolete. If genuinely ambiguous, leave it in `inbox/` and flag it.
   - **Links**: add wikilinks to obviously related existing notes.
3. Never merge or delete a capture during processing — one capture, one note
   (use `/merge` separately for consolidation).
4. Before moving anything, show the full plan as a table (current name →
   new title, destination, tags) and apply it in one pass.
5. Fix any wikilinks elsewhere in the vault that pointed at the old filenames.
6. Reply with the table of what moved where and which notes were left
   in the inbox and why.
