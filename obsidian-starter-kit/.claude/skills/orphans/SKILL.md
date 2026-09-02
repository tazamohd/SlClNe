---
name: orphans
description: Find orphaned notes (no incoming or outgoing wikilinks) and suggest where each belongs in the vault's link structure. Use for "find orphans", "what's disconnected", or /orphans.
---

# Orphan finder

Follow the vault conventions in `CLAUDE.md`. This skill is read-only by
default: it reports and suggests, and only edits when the user approves.

1. Enumerate all notes, excluding `templates/`, `archive/`, `.obsidian/`,
   and daily notes (dailies are expected to be leaf-ish).
2. Extract every wikilink target across the vault (`[[Target]]` and
   `[[Target|alias]]`; resolve against filenames and frontmatter aliases).
3. Classify:
   - **Fully orphaned** — no links in, no links out.
   - **Dead ends** — links in, none out.
   - **Unreachable** — links out, none in (nothing points here).
4. For each fully orphaned and unreachable note, read enough of it to
   suggest 1-3 concrete connections: an existing note or MOC that should
   link to it, or a tag that would surface it. If a note looks abandoned
   or superseded, suggest archiving instead — but never move it yourself.
5. Report as a table: note, class, suggested connections. Then offer to
   apply the suggested links (as a batch the user approves) and, on
   approval, add them via `/link`-style edits.
6. Also report broken wikilinks found along the way (links whose target
   doesn't exist) as a separate list.
