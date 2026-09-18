# Registers the nightly Obsidian vault maintenance script with Windows
# Task Scheduler. Run this once per vault, from an ordinary (non-admin)
# PowerShell prompt — schtasks /Create for the current user does not need
# elevation.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\install-maintenance-task.ps1 -VaultPath "M:\obo"
#
# Optional: -Time "02:00" (default) and -TaskName (default ObsidianVaultMaintenance,
# so you can run the installer more than once for more than one vault).
#
# To remove the task later:
#   schtasks /Delete /TN "ObsidianVaultMaintenance" /F

param(
    [Parameter(Mandatory = $true)]
    [string]$VaultPath,

    [string]$Time = "02:00",

    [string]$TaskName = "ObsidianVaultMaintenance"
)

$ErrorActionPreference = "Stop"

$VaultPath = (Resolve-Path $VaultPath).Path
$scriptPath = Join-Path $VaultPath "scripts\vault-maintenance.ps1"

if (-not (Test-Path $scriptPath)) {
    Write-Error "vault-maintenance.ps1 not found at $scriptPath — copy obsidian-starter-kit\scripts\ into the vault first."
    exit 1
}

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Warning "'claude' was not found on PATH in this session. Task Scheduler runs with your normal user PATH, so this is usually fine — but if the task fails, confirm 'claude' is reachable outside this shell too."
}

$action = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -VaultPath `"$VaultPath`""

Write-Host "Registering scheduled task '$TaskName': runs vault-maintenance.ps1 daily at $Time." -ForegroundColor Cyan
schtasks /Create /TN $TaskName /SC DAILY /ST $Time /TR $action /F

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Done. The task runs as your Windows user, so your session does not need to be open." -ForegroundColor Green
    Write-Host "Test it immediately with:   schtasks /Run /TN `"$TaskName`""
    Write-Host "Check its logs at:          $VaultPath\maintenance-logs\"
    Write-Host "Remove it later with:       schtasks /Delete /TN `"$TaskName`" /F"
} else {
    Write-Error "schtasks failed (exit $LASTEXITCODE) — see output above."
    exit $LASTEXITCODE
}
