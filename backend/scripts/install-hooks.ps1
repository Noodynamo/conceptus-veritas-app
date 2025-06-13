# PowerShell script to install git hooks
# This script copies hooks from .github/hooks to .git/hooks

# Ensure we're in the root directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
Set-Location $RootDir

Write-Host "Installing git hooks..."

# Ensure the hooks directory exists
if (-not (Test-Path ".git/hooks")) {
    New-Item -ItemType Directory -Path ".git/hooks" -Force | Out-Null
}

# Copy all hooks and make them executable
Get-ChildItem -Path ".github/hooks" -File | ForEach-Object {
    $hookName = $_.Name
    Write-Host "Installing $hookName hook"
    Copy-Item $_.FullName -Destination ".git/hooks/$hookName"
    
    # Set executable bit (this is for Git Bash to recognize the scripts)
    # Windows doesn't have the concept of executable bits, but Git for Windows looks for this
    if (Test-Path ".git/hooks/$hookName") {
        $file = Get-Item ".git/hooks/$hookName"
        $file.IsReadOnly = $false
    }
}

Write-Host "Git hooks installed successfully!" 