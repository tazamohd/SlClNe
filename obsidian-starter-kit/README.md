# Obsidian + Claude Code Starter Kit

A ready-to-use `CLAUDE.md` and a set of Claude Code skills for working on an
Obsidian vault. Copy the contents of this folder into your vault root:

```bash
cp -r obsidian-starter-kit/CLAUDE.md obsidian-starter-kit/.claude /path/to/your/vault/
```

Then open Claude Code inside the vault:

```bash
cd /path/to/your/vault
claude
```

## What's inside

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Vault conventions Claude reads at the start of every session |
| `.claude/skills/daily/` | `/daily` — create today's daily note, carry over open tasks |
| `.claude/skills/weekly-review/` | `/weekly-review` — synthesize the week's daily notes |
| `.claude/skills/link/` | `/link` — find unlinked mentions and add wikilinks |
| `.claude/skills/inbox/` | `/inbox` — process capture notes into the right folders |
| `.claude/skills/moc/` | `/moc` — build or update a Map of Content for a topic |
| `.claude/skills/merge/` | `/merge` — merge overlapping notes without losing content |

## Customize first

1. **`CLAUDE.md`** — the folder layout, tag scheme, and frontmatter keys are a
   common default (`daily/`, `inbox/`, `projects/`, `reference/`, `archive/`).
   Edit them to match how your vault is actually organized. Every skill reads
   `CLAUDE.md`, so fixing it once fixes all the skills.
2. **Skills** — each `SKILL.md` is plain markdown instructions. Tweak
   templates, folder names, and output style to taste.

## Recommended: put the vault in git

Before letting Claude do bulk edits, version the vault so every change is
reviewable and reversible:

```bash
cd /path/to/your/vault
git init && git add -A && git commit -m "Initial vault snapshot"
```

Add `.obsidian/workspace*.json` to `.gitignore` to avoid noisy diffs from
Obsidian's window state.
