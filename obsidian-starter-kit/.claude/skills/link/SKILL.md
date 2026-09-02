---
name: link
description: Find unlinked mentions of existing notes inside a given note and turn them into wikilinks. Use for "add backlinks", "link this note up", or /link <note>.
---

# Link suggester

Follow the vault conventions in `CLAUDE.md`. Argument: a note path or title;
if none is given, ask which note to process.

1. Read the target note.
2. Build the set of linkable names: every note's filename (without `.md`)
   plus every `aliases:` entry in frontmatter across the vault. Exclude
   `templates/` and `.obsidian/`.
3. Scan the note body for occurrences of those names that are NOT already
   inside a wikilink, code block, inline code span, URL, or frontmatter.
   Match case-insensitively but only whole words/phrases.
4. For each genuine mention, wrap it as a wikilink, preserving the original
   casing via the pipe form when it differs: `[[Note Title|the mention text]]`.
   Skip false positives — a note named "Go" must not swallow every "go" in
   prose; when the match is a common word, only link it if the surrounding
   sentence is clearly about that note's topic. When unsure, leave it and
   list it as a suggestion instead of editing.
5. Change nothing else in the note.
6. Reply with: links added (with the sentence fragment each appears in), and
   suggestions you skipped as uncertain so the user can decide.
