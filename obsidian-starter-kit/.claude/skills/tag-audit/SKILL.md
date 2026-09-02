---
name: tag-audit
description: Audit vault tags for near-duplicates, inconsistent casing, and one-off tags, then consolidate with approval. Use for "clean up my tags", "tag audit", or /tag-audit.
---

# Tag audit

Follow the vault conventions in `CLAUDE.md`. Renaming tags touches many
notes, so this skill always plans first and applies only with approval.

1. Collect every tag in the vault: frontmatter `tags:` entries and inline
   `#tag` occurrences in note bodies (skip code blocks, `templates/`, and
   `.obsidian/`). Count uses per tag.
2. Flag problems:
   - **Near-duplicates**: singular/plural (`#book`/`#books`), abbreviations
     (`#proj`/`#project`), spelling variants, synonyms used interchangeably.
   - **Casing/format drift**: `#Project` vs `#project`, spaces vs dashes.
   - **Convention violations**: tags that should be hierarchical per
     `CLAUDE.md` (e.g. `#active` → `#status/active`).
   - **Singletons**: tags used exactly once — candidates to drop or merge.
3. Propose a consolidation table: old tag → new tag (or "remove"), with use
   counts and 1-2 example notes each. Pick the canonical form by the vault's
   stated conventions first, then by majority usage.
4. On approval, apply the renames everywhere the tag appears — frontmatter
   and inline — editing nothing else in each note. Do it in one pass and
   keep a list of every file touched.
5. Reply with the summary: tags before/after, notes edited, and any tags
   left alone because intent was unclear.
