# Obsidian Vault Guidelines

This directory is an Obsidian vault: a personal knowledge base of markdown
notes, not a codebase. Treat notes as the user's own writing.

<!-- CUSTOMIZE: everything below describes a common default layout.
     Edit folders, tags, and frontmatter keys to match this vault. -->

## Folder structure

- `daily/` — daily notes, one per day: `daily/YYYY-MM-DD.md`
- `inbox/` — quick captures waiting to be processed
- `projects/` — one folder or note per active project
- `reference/` — evergreen/permanent notes on topics
- `mocs/` — Maps of Content (hub notes that link out to a topic's notes)
- `templates/` — note templates (never edit or file these as real notes)
- `archive/` — completed projects and stale notes
- `.obsidian/` — app config; never touch anything in here

## Note conventions

- Every note starts with YAML frontmatter:

  ```yaml
  ---
  created: YYYY-MM-DD
  tags: []
  aliases: []
  ---
  ```

- Internal links use wikilinks: `[[Note Title]]` or `[[Note Title|display text]]`.
  Embeds use `![[Note Title]]`. Never convert wikilinks to standard markdown
  links, and preserve every existing wikilink when editing a note.
- Tags are lowercase and hierarchical where useful: `#project`,
  `#status/active`, `#status/done`, `#type/idea`, `#type/reference`.
- One H1 per note, matching the filename; sections start at H2.
- Tasks use `- [ ]` / `- [x]` checkboxes.

## How Claude should behave here

- **Match my voice.** When summarizing or rewriting, keep the existing tone.
  Don't formalize casual notes or pad them with filler.
- **Edit conservatively.** Only change what was asked. Never reformat,
  re-wrap, or "clean up" parts of a note that weren't part of the request.
- **Suggest links.** When creating or editing a note, add wikilinks to
  existing notes it clearly relates to (check that the target note exists
  first — search by filename and aliases).
- **New notes get frontmatter** using the template above, filed into the
  folder that fits (`inbox/` if unsure).
- **Deletion is opt-in.** Never delete or overwrite a note's content without
  being explicitly asked; prefer moving to `archive/`.
- **Bulk operations need a plan.** For anything touching more than ~10 notes,
  list the planned changes first, then apply them.
- Filenames: match the note title, spaces allowed, no `/ \ : # ^ [ ] |`
  characters (they break wikilinks).
