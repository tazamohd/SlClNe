# Nightly vault maintenance via Claude Code headless mode (Windows).
#
# Test it manually a few times before scheduling:
#   powershell -ExecutionPolicy Bypass -File scripts\vault-maintenance.ps1 -VaultPath "M:\obo"
#
# Then register it with Task Scheduler (run as your user, 02:00 nightly):
#   schtasks /Create /TN "ObsidianVaultMaintenance" /SC DAILY /ST 02:00 `
#     /TR "powershell -NoProfile -ExecutionPolicy Bypass -File \"M:\obo\scripts\vault-maintenance.ps1\" -VaultPath \"M:\obo\""

param(
    [Parameter(Mandatory = $true)]
    [string]$VaultPath
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $VaultPath)) {
    Write-Error "Vault path not found: $VaultPath"
    exit 1
}

Set-Location $VaultPath

$logDir = Join-Path $VaultPath "maintenance-logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir ("run-{0}.log" -f (Get-Date -Format "yyyy-MM-dd"))

$prompt = @"
You are running unattended nightly maintenance on this Obsidian vault.
Follow CLAUDE.md conventions. Rules for unattended mode: never delete or
merge notes, never touch .obsidian/, and if a step needs a judgment call
you can't make safely, skip it and note it in the log entry instead.

Do the following:
1. Process notes in inbox/ per the /inbox skill rules, but only file notes
   whose destination is unambiguous; leave the rest and list them.
2. Check notes modified in the last day for broken wikilinks (targets that
   don't exist) and invalid YAML frontmatter; fix frontmatter syntax errors,
   list broken links without changing them.
3. Append one summary entry for tonight to maintenance-log.md at the vault
   root: date, notes filed, notes skipped and why, broken links found,
   frontmatter fixed. Create the file if missing.
"@

"=== Vault maintenance started $(Get-Date -Format o) ===" | Tee-Object -FilePath $log -Append

# --permission-mode acceptEdits lets the unattended run write files without
# interactive prompts, while still blocking anything beyond file edits.
claude -p $prompt --permission-mode acceptEdits 2>&1 | Tee-Object -FilePath $log -Append

"=== Finished $(Get-Date -Format o) (exit $LASTEXITCODE) ===" | Tee-Object -FilePath $log -Append

# If the vault is a git repo, snapshot the result so every unattended
# change is reviewable and reversible.
if (Test-Path (Join-Path $VaultPath ".git")) {
    git add -A
    git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
        git commit -m ("Nightly vault maintenance {0}" -f (Get-Date -Format "yyyy-MM-dd")) | Tee-Object -FilePath $log -Append
    }
}
