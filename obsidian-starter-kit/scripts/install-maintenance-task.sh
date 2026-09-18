#!/usr/bin/env bash
# Registers the nightly Obsidian vault maintenance script with cron.
# Run this once per vault.
#
# Usage:
#   ./scripts/install-maintenance-task.sh /path/to/vault ["0 2 * * *"]
#
# The optional second argument is a cron schedule (default: 02:00 daily).
#
# To remove it later: crontab -e, and delete the line this script added
# (marked with the "# obsidian-vault-maintenance:" comment below).
set -euo pipefail

VAULT="${1:?usage: install-maintenance-task.sh /path/to/vault [\"cron schedule\"]}"
SCHEDULE="${2:-0 2 * * *}"
VAULT="$(cd "$VAULT" && pwd)"
SCRIPT="$VAULT/scripts/vault-maintenance.sh"
MARKER="# obsidian-vault-maintenance: $VAULT"

if [ ! -x "$SCRIPT" ]; then
  if [ -f "$SCRIPT" ]; then
    chmod +x "$SCRIPT"
  else
    echo "vault-maintenance.sh not found at $SCRIPT — copy obsidian-starter-kit/scripts/ into the vault first." >&2
    exit 1
  fi
fi

if ! command -v claude >/dev/null 2>&1; then
  echo "Warning: 'claude' was not found on PATH in this shell. cron uses a minimal PATH, so add its full path or source your profile in the cron line if the job fails to find it." >&2
fi

CRON_LINE="$SCHEDULE $SCRIPT \"$VAULT\" $MARKER"

# Replace any existing entry for this vault, then add the current one.
( crontab -l 2>/dev/null | grep -vF "$MARKER" ; echo "$CRON_LINE" ) | crontab -

echo "Registered cron job: $CRON_LINE"
echo "Logs land in: $VAULT/maintenance-logs/"
echo "Remove it later with: crontab -e   (delete the line containing '$MARKER')"
