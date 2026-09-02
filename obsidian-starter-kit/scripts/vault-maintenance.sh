#!/usr/bin/env bash
# Nightly vault maintenance via Claude Code headless mode (macOS/Linux).
#
# Test manually first:
#   ./scripts/vault-maintenance.sh /path/to/vault
#
# Then schedule with cron (02:00 nightly):
#   0 2 * * * /path/to/vault/scripts/vault-maintenance.sh /path/to/vault
set -euo pipefail

VAULT="${1:?usage: vault-maintenance.sh /path/to/vault}"
cd "$VAULT"

LOG_DIR="$VAULT/maintenance-logs"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/run-$(date +%F).log"

PROMPT='You are running unattended nightly maintenance on this Obsidian vault.
Follow CLAUDE.md conventions. Rules for unattended mode: never delete or
merge notes, never touch .obsidian/, and if a step needs a judgment call
you cannot make safely, skip it and note it in the log entry instead.

Do the following:
1. Process notes in inbox/ per the /inbox skill rules, but only file notes
   whose destination is unambiguous; leave the rest and list them.
2. Check notes modified in the last day for broken wikilinks (targets that
   do not exist) and invalid YAML frontmatter; fix frontmatter syntax
   errors, list broken links without changing them.
3. Append one summary entry for tonight to maintenance-log.md at the vault
   root: date, notes filed, notes skipped and why, broken links found,
   frontmatter fixed. Create the file if missing.'

echo "=== Vault maintenance started $(date -Is) ===" | tee -a "$LOG"

# --permission-mode acceptEdits lets the unattended run write files without
# interactive prompts, while still blocking anything beyond file edits.
claude -p "$PROMPT" --permission-mode acceptEdits 2>&1 | tee -a "$LOG"

echo "=== Finished $(date -Is) ===" | tee -a "$LOG"

# Snapshot the result if the vault is a git repo.
if [ -d "$VAULT/.git" ]; then
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "Nightly vault maintenance $(date +%F)" | tee -a "$LOG"
  fi
fi
