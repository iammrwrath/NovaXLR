$ErrorActionPreference = "Stop"
$scriptRoot = $PSScriptRoot
if (-not $scriptRoot) { $scriptRoot = (Get-Location).Path }

$localDir = "C:\Users\icell\.goxlr-ui-build"
$sourceDir = "$scriptRoot\ui"
$targetWebDir = "$scriptRoot\daemon\web-content"

Write-Host "Syncing UI source files to local build directory..."
robocopy $sourceDir $localDir /MIR /XD node_modules .git dist /NP /NFL /NDL /NJH /NJS

Push-Location $localDir
try {
    Write-Host "Compiling UI bundle with Vite..."
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Vite build failed with code $LASTEXITCODE" }

    Write-Host "Deploying built assets to daemon/web-content..."
    if (Test-Path "$targetWebDir\assets") {
        Remove-Item "$targetWebDir\assets" -Recurse -Force
    }
    Copy-Item "$localDir\dist\*" $targetWebDir -Recurse -Force
    Write-Host "UI assets successfully updated in daemon/web-content!"
} finally {
    Pop-Location
}
