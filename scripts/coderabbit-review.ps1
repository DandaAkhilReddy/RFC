# CodeRabbit Review PowerShell Script
# Windows wrapper for CodeRabbit CLI in WSL

param(
    [Parameter(Position=0)]
    [ValidateSet('uncommitted', 'committed', 'all')]
    [string]$ReviewType = 'uncommitted',

    [Parameter(Position=1)]
    [ValidateSet('plain', 'prompt-only', 'interactive')]
    [string]$Mode = 'plain'
)

Write-Host "🤖 CodeRabbit Review - ReddyFit Project" -ForegroundColor Cyan
Write-Host ""

# Convert mode to CLI flag
$modeFlag = switch ($Mode) {
    'plain' { '--plain' }
    'prompt-only' { '--prompt-only' }
    'interactive' { '' }
}

# Path to WSL script
$scriptPath = "/mnt/c/users/akhil/ReddyfitWebsiteready/scripts/coderabbit-review.sh"

# Make script executable if not already
wsl bash -c "chmod +x '$scriptPath'"

# Run CodeRabbit review via WSL
Write-Host "📊 Running CodeRabbit review..." -ForegroundColor Yellow
wsl bash -c "bash '$scriptPath' $ReviewType $modeFlag"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Review complete!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Review failed. Please check authentication." -ForegroundColor Red
    Write-Host "💡 Run authentication: wsl bash -c 'coderabbit auth login'" -ForegroundColor Yellow
    exit 1
}
