---
name: merge
description: Merge two or more overlapping notes into one canonical note without losing content, updating wikilinks across the vault. Use for "merge these notes", "dedupe my notes on X", or /merge.
---

# Merge notes

Follow the vault conventions in `CLAUDE.md`. Merging destroys structure if
done carelessly, so this skill is deliberately cautious.

1. Identify the notes to merge: the ones the user named, or — for "dedupe my
   notes on X" — search the vault and propose candidate groups, then confirm
   the grouping with the user before touching anything.
2. Read every note in the group in full.
3. Propose the merge before applying it:
   - Which note becomes canonical (usually the most complete or best-titled).
   - An outline of the merged note showing where each source's content lands.
   - Anything that conflicts between sources (call this out explicitly —
     conflicting claims must both survive, marked as such, not silently
     resolved).
4. On approval, build the merged note: union of content with duplication
   removed, union of tags and aliases (add the other titles as `aliases:` so
   old links and searches still resolve), earliest `created:` date.
5. Update every wikilink in the vault that pointed at the absorbed notes to
   point at the canonical note.
6. Move the absorbed notes to `archive/merged/` with a one-line pointer at
   the top: `> Merged into [[<canonical>]] on <date>.` Never hard-delete them.
7. Reply with the canonical path, what was archived, and how many links were
   rewritten.
