<#
  SALIS AUTO — task runner.

  Exists because commands were being transcribed by hand, and at least once my
  *expected output* was pasted into PowerShell as if it were a command. Named
  steps remove the transcription step entirely.

      .\project-control\run.ps1                  # list the steps
      .\project-control\run.ps1 gates            # registry + both ratchets
      .\project-control\run.ps1 all              # the full per-tranche chain
      .\project-control\run.ps1 apply <path>     # apply a patch and push

  Run it from the repository root.
#>
param(
  [Parameter(Position = 0)][string]$Step = "list",
  [Parameter(Position = 1)][string]$Arg
)

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
$app  = Join-Path $repo "app"

function Say($msg, $color = "Cyan") { Write-Host "`n$msg" -ForegroundColor $color }
function Fail($msg) { Write-Host "`n$msg" -ForegroundColor Red; exit 1 }

# npm on Windows is npm.cmd; calling bare `npm` from a script can miss it.
function Npm { param([string[]]$CmdArgs)
  Push-Location $app
  try {
    & npm.cmd @CmdArgs
    if ($LASTEXITCODE -ne 0) { Fail "npm $($CmdArgs -join ' ') failed (exit $LASTEXITCODE)" }
  } finally { Pop-Location }
}

switch ($Step.ToLower()) {

  "list" {
    Write-Host @"

SALIS AUTO task runner

  gates      Rebuild the registry, then the placeholder and design-token ratchets.
             Run this after every tranche — it is what keeps the deck honest.
  test       Unit, component and integration tests (vitest).
  build      Typecheck and production build.
  smoke      Route, behaviour, mobile and brand checks (starts a preview server).
  all        gates -> test -> build -> smoke. The full per-tranche chain.

  apply <p>  git am the patch at <p>, show the log, then push.
  status     Branch, unpushed commits, and the current registry totals.
  deck       Regenerate the deck dataset and open it in your browser.
  install    npm install in app/ (only needed once, or after new dependencies).

Examples
  .\project-control\run.ps1 gates
  .\project-control\run.ps1 apply "C:\Users\Salisco\Desktop\w1.patch"

"@
  }

  "install" { Say "Installing dependencies"; Npm @("install") }

  "gates" {
    Say "Rebuilding the registry and running the ratchets"
    Npm @("run", "gates")
    Say "Gates passed." "Green"
  }

  "test"  { Say "Running tests"; Npm @("run", "test"); Say "Tests passed." "Green" }

  "build" {
    Say "Typecheck"; Npm @("run", "typecheck")
    Say "Build";     Npm @("run", "build")
    Say "Build passed." "Green"
  }

  "smoke" {
    Say "Starting preview server on :4173"
    $preview = Start-Process -FilePath "npx.cmd" -ArgumentList "vite preview --port 4173" `
                             -WorkingDirectory $app -PassThru -WindowStyle Hidden
    try {
      # Poll rather than sleeping a fixed amount — a cold start is slower than a warm one.
      $ready = $false
      foreach ($i in 1..30) {
        Start-Sleep -Milliseconds 500
        try { Invoke-WebRequest "http://localhost:4173" -UseBasicParsing -TimeoutSec 2 | Out-Null
              $ready = $true; break } catch { }
      }
      if (-not $ready) { Fail "Preview server did not come up on :4173" }
      Say "Running smoke checks"
      Npm @("run", "smoke")
      Say "Smoke passed." "Green"
    } finally {
      if ($preview -and -not $preview.HasExited) { Stop-Process -Id $preview.Id -Force }
    }
  }

  "all" {
    & $PSCommandPath gates
    & $PSCommandPath test
    & $PSCommandPath build
    & $PSCommandPath smoke
    Say "Full chain passed." "Green"
  }

  "apply" {
    if (-not $Arg) { Fail "Usage: run.ps1 apply <path-to-patch>" }
    if (-not (Test-Path $Arg)) { Fail "No patch at: $Arg" }
    Push-Location $repo
    try {
      Say "Applying $Arg"
      & git am $Arg
      if ($LASTEXITCODE -ne 0) {
        Write-Host "`ngit am failed. Recover with:  git am --abort" -ForegroundColor Yellow
        Fail "Patch did not apply."
      }
      Say "Applied. Log:"
      & git log --oneline -8
      Say "Pushing"
      & git push
      if ($LASTEXITCODE -ne 0) { Fail "Push failed." }
      Say "Pushed." "Green"
    } finally { Pop-Location }
  }

  "status" {
    Push-Location $repo
    try {
      Say "Branch"; & git rev-parse --abbrev-ref HEAD
      Say "Unpushed commits"
      $ahead = & git log --oneline "@{u}..HEAD" 2>$null
      if ($ahead) { $ahead } else { Write-Host "  none — remote is up to date" -ForegroundColor Green }
      $reg = Join-Path $repo "project-control\MASTER_REGISTRY.json"
      if (Test-Path $reg) {
        Say "Registry"
        $t = (Get-Content $reg -Raw | ConvertFrom-Json).totals
        Write-Host ("  {0} capabilities · {1} rendering · {2} placeholder · {3} mobile owed" -f `
          $t.capabilities, $t.rendered, $t.placeholder, $t.designedMobileOwed)
      }
    } finally { Pop-Location }
  }

  "deck" {
    Say "Regenerating the deck dataset"
    Npm @("run", "registry")
    $deck = Join-Path $repo "project-control\tracker\deck.html"
    if (Test-Path $deck) { Say "Opening the deck"; Start-Process $deck }
    else { Write-Host "  deck.html not built yet — load tracker-data.json into the hosted deck instead" -ForegroundColor Yellow }
  }

  default { Fail "Unknown step '$Step'. Run without arguments to see the list." }
}
