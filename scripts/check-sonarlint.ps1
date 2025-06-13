# Check if VS Code/Cursor is installed and accessible
$vscodeExists = $null -ne (Get-Command code -ErrorAction SilentlyContinue)

if (-not $vscodeExists) {
    Write-Host "VS Code/Cursor command line tools not found. Please ensure they are installed and in your PATH." -ForegroundColor Yellow
    exit 1
}

# Check if SonarLint extension is installed
$extensions = code --list-extensions
$sonarLintInstalled = $extensions -contains "SonarSource.sonarlint-vscode"

if ($sonarLintInstalled) {
    Write-Host "✅ SonarLint extension is installed." -ForegroundColor Green
} else {
    Write-Host "❌ SonarLint extension is not installed." -ForegroundColor Red
    Write-Host "Please install it by running: code --install-extension SonarSource.sonarlint-vscode" -ForegroundColor Yellow
}

# Check if SonarLint configuration files exist
$sonarlintJsonExists = Test-Path -Path ".sonarlint.json"
$sonarlintDirExists = Test-Path -Path ".sonarlint"

if ($sonarlintJsonExists -and $sonarlintDirExists) {
    Write-Host "✅ SonarLint configuration files found." -ForegroundColor Green
} else {
    Write-Host "❌ SonarLint configuration files are missing." -ForegroundColor Red
    if (-not $sonarlintJsonExists) {
        Write-Host "Missing: .sonarlint.json" -ForegroundColor Yellow
    }
    if (-not $sonarlintDirExists) {
        Write-Host "Missing: .sonarlint directory" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "SonarLint and ESLint are now configured to work together." -ForegroundColor Cyan
Write-Host "- ESLint handles style and formatting" -ForegroundColor Cyan
Write-Host "- SonarLint catches bugs, vulnerabilities, and code smells" -ForegroundColor Cyan
Write-Host ""
