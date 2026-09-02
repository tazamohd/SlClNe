# Obsidian + Claude Code Starter Kit

A ready-to-use `CLAUDE.md` and a set of Claude Code skills for working on an
Obsidian vault. Copy the contents of this folder into your vault root:

```bash
# macOS/Linux
cp -r obsidian-starter-kit/CLAUDE.md obsidian-starter-kit/.claude \
      obsidian-starter-kit/.mcp.json obsidian-starter-kit/scripts /path/to/your/vault/
```

```powershell
# Windows (PowerShell)
Copy-Item obsidian-starter-kit\CLAUDE.md, obsidian-starter-kit\.mcp.json M:\obo\
Copy-Item -Recurse obsidian-starter-kit\.claude, obsidian-starter-kit\scripts M:\obo\
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
| `.claude/skills/clip/` | `/clip <url>` — save a URL as a summarized reference note |
| `.claude/skills/orphans/` | `/orphans` — find disconnected notes, suggest where they belong |
| `.claude/skills/tag-audit/` | `/tag-audit` — find and consolidate near-duplicate tags |
| `.claude/skills/question/` | `/question` — answer a question from your notes only, with citations |
| `scripts/vault-maintenance.ps1` | Nightly unattended maintenance (Windows / Task Scheduler) |
| `scripts/vault-maintenance.sh` | Same for macOS/Linux (cron) |
| `.mcp.json` | Project-scoped Obsidian MCP server (auto-detected by Claude Code) |
| `.claude/agents/vault-analyst.md` | Read-only subagent for whole-vault analysis (see below) |

## The vault-analyst subagent

Heavy structural questions — "map my vault", "what should I reorganize?",
"find all my orphaned notes and clusters" — mean scanning hundreds of notes.
The `vault-analyst` subagent runs that scan in its own context so your main
conversation stays responsive, and reports back paths, counts, and a
concrete proposal. It is deliberately read-only: it never edits notes, so
you can point it at the whole vault without worrying.

Claude Code uses it automatically when a request calls for vault-wide
analysis, or you can ask for it explicitly: "use the vault-analyst agent to
audit my folder structure".

## Obsidian MCP server (optional but recommended)

`.mcp.json` wires up the [mcp-obsidian](https://github.com/MarkusPfundstein/mcp-obsidian)
server, which gives Claude Obsidian-aware tools — vault search, reading the
note you currently have open, appending relative to headings — instead of
plain file access. One-time setup on your machine:

1. **In Obsidian**: Settings → Community plugins → Browse → install
   **"Local REST API"** (by coddingtonbear) → enable it → copy the API key
   from the plugin's settings page.
2. **Install `uv`** (provides the `uvx` launcher the config uses):
   - Windows: `winget install astral-sh.uv`
   - macOS/Linux: `curl -LsSf https://astral.sh/uv/install.sh | sh`
3. **Set the API key as an environment variable** (the config reads
   `${OBSIDIAN_API_KEY}`, so the key never lives in a file):
   - Windows (PowerShell): `setx OBSIDIAN_API_KEY "your-key-here"` — then
     open a **new** terminal (setx only affects new sessions).
   - macOS/Linux: add `export OBSIDIAN_API_KEY="your-key-here"` to your
     shell profile.
4. **Copy `.mcp.json` into the vault root** along with the rest of the kit.
5. Start `claude` in the vault. It detects the project MCP server and asks
   once whether to trust it — approve, then verify with `/mcp` (the
   `obsidian` server should show as connected).

Notes: Obsidian must be running for the server to work (plain file access
keeps working when it isn't), and the plugin's default HTTPS port is
`27124` — if you changed it, update `OBSIDIAN_PORT` in `.mcp.json`.

## Customize first

1. **`CLAUDE.md`** — the folder layout, tag scheme, and frontmatter keys are a
   common default (`daily/`, `inbox/`, `projects/`, `reference/`, `archive/`).
   Edit them to match how your vault is actually organized. Every skill reads
   `CLAUDE.md`, so fixing it once fixes all the skills.
2. **Skills** — each `SKILL.md` is plain markdown instructions. Tweak
   templates, folder names, and output style to taste.

## Automated nightly maintenance

The `scripts/` folder holds an unattended maintenance run: it processes
unambiguous inbox captures, validates wikilinks and frontmatter in recently
modified notes, appends a summary to `maintenance-log.md`, and (if the vault
is a git repo) commits the result so every change is reviewable.

**Test it manually a few times before scheduling it:**

```powershell
# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File scripts\vault-maintenance.ps1 -VaultPath "M:\obo"

# Then schedule nightly at 02:00 via Task Scheduler:
schtasks /Create /TN "ObsidianVaultMaintenance" /SC DAILY /ST 02:00 `
  /TR "powershell -NoProfile -ExecutionPolicy Bypass -File \"M:\obo\scripts\vault-maintenance.ps1\" -VaultPath \"M:\obo\""
```

```bash
# macOS/Linux: test, then add to crontab
./scripts/vault-maintenance.sh /path/to/vault
# crontab -e:  0 2 * * * /path/to/vault/scripts/vault-maintenance.sh /path/to/vault
```

The script's prompt is deliberately conservative (never deletes or merges,
skips anything ambiguous). Edit the `$prompt`/`PROMPT` block to add your own
nightly chores.

## Recommended: put the vault in git

Before letting Claude do bulk edits, version the vault so every change is
reviewable and reversible:

```bash
cd /path/to/your/vault
git init && git add -A && git commit -m "Initial vault snapshot"
```

Add `.obsidian/workspace*.json` to `.gitignore` to avoid noisy diffs from
Obsidian's window state.
