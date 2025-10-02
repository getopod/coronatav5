# Coronata Game - Build Automation Script
# PowerShell script for comprehensive project management
# Usage: .\scripts\build-automation.ps1 [command] [options]

param(
    [Parameter(Position=0)]
    [ValidateSet('help', 'install', 'dev', 'build', 'test', 'lint', 'clean', 'analyze', 'full-check', 'release', 'electron')]
    [string]$Command = 'help',
    
    [switch]$Verbose,
    [switch]$Fix,
    [switch]$Watch,
    [switch]$Coverage
)

# Script configuration
$ErrorActionPreference = "Stop"
$WarningPreference = "Continue"

# Color functions for better output
function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Error($message) {
    Write-Host "❌ $message" -ForegroundColor Red
}

function Write-Warning($message) {
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Write-Info($message) {
    Write-Host "ℹ️  $message" -ForegroundColor Cyan
}

function Write-Header($message) {
    Write-Host "`n🚀 $message" -ForegroundColor Magenta
    Write-Host ("=" * ($message.Length + 4)) -ForegroundColor Magenta
}

# Check if we're in the correct directory
function Test-ProjectDirectory {
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json not found. Please run this script from the project root directory."
        exit 1
    }
    
    if (-not (Test-Path "src")) {
        Write-Error "src directory not found. Please run this script from the project root directory."
        exit 1
    }
}

# Check dependencies
function Test-Dependencies {
    Write-Info "Checking required dependencies..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js version: $nodeVersion"
    } catch {
        Write-Error "Node.js is not installed or not in PATH"
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm version: $npmVersion"
    } catch {
        Write-Error "npm is not installed or not in PATH"
        exit 1
    }
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Warning "node_modules not found. Installing dependencies..."
        Invoke-Install
    }
}

# Install dependencies
function Invoke-Install {
    Write-Header "Installing Dependencies"
    
    Write-Info "Running npm install..."
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencies installed successfully"
    } else {
        Write-Error "Failed to install dependencies"
        exit 1
    }
}

# Development server
function Invoke-Dev {
    Write-Header "Starting Development Server"
    Test-Dependencies
    
    Write-Info "Starting Vite development server..."
    if ($Watch) {
        Write-Info "Running in watch mode..."
    }
    
    npm run dev
}

# Build project
function Invoke-Build {
    Write-Header "Building Project"
    Test-Dependencies
    
    Write-Info "Building for production..."
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build completed successfully"
        
        # Check if dist directory was created
        if (Test-Path "dist") {
            $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
            $distSizeMB = [math]::Round($distSize / 1MB, 2)
            Write-Info "Build output size: $distSizeMB MB"
        }
    } else {
        Write-Error "Build failed"
        exit 1
    }
}

# Run tests
function Invoke-Test {
    Write-Header "Running Tests"
    Test-Dependencies
    
    $testArgs = @()
    if ($Coverage) {
        $testArgs += "--coverage"
        Write-Info "Running tests with coverage..."
    }
    if ($Watch) {
        $testArgs += "--watch"
        Write-Info "Running tests in watch mode..."
    }
    
    if ($testArgs.Count -gt 0) {
        npm test $testArgs
    } else {
        npm test
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All tests passed"
    } else {
        Write-Error "Some tests failed"
        exit 1
    }
}

# Lint code
function Invoke-Lint {
    Write-Header "Running Code Linting"
    Test-Dependencies
    
    Write-Info "Running ESLint..."
    if ($Fix) {
        Write-Info "Auto-fixing issues where possible..."
        npm run lint -- --fix
    } else {
        npm run lint
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Linting passed"
    } else {
        Write-Warning "Linting issues found"
        if (-not $Fix) {
            Write-Info "Run with -Fix flag to automatically fix some issues"
        }
    }
}

# Clean project
function Invoke-Clean {
    Write-Header "Cleaning Project"
    
    # Remove build artifacts
    $dirsToClean = @("dist", "coverage", "node_modules/.cache")
    
    foreach ($dir in $dirsToClean) {
        if (Test-Path $dir) {
            Write-Info "Removing $dir..."
            Remove-Item -Path $dir -Recurse -Force
            Write-Success "Removed $dir"
        }
    }
    
    # Clean npm cache
    Write-Info "Cleaning npm cache..."
    npm cache clean --force
    
    Write-Success "Project cleaned successfully"
}

# Analyze code quality
function Invoke-Analyze {
    Write-Header "Code Quality Analysis"
    Test-Dependencies
    
    Write-Info "Running comprehensive code analysis..."
    
    # TypeScript compilation check
    Write-Info "Checking TypeScript compilation..."
    npx tsc --noEmit
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "TypeScript compilation check passed"
    } else {
        Write-Error "TypeScript compilation errors found"
    }
    
    # Bundle analyzer (if available)
    if (Test-Path "node_modules/.bin/vite-bundle-analyzer") {
        Write-Info "Running bundle analysis..."
        npm run analyze 2>$null
    }
    
    # Security audit
    Write-Info "Running security audit..."
    npm audit --audit-level moderate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "No security vulnerabilities found"
    } else {
        Write-Warning "Security vulnerabilities detected. Consider running 'npm audit fix'"
    }
}

# Full check (lint + test + build)
function Invoke-FullCheck {
    Write-Header "Full Project Check"
    
    try {
        Invoke-Lint
        Invoke-Test
        Invoke-Build
        Invoke-Analyze
        
        Write-Success "All checks passed! ✨"
        Write-Info "Project is ready for deployment."
    } catch {
        Write-Error "Full check failed. Please fix the issues above."
        exit 1
    }
}

# Release preparation
function Invoke-Release {
    Write-Header "Preparing Release"
    
    # Ensure we're on a clean git state
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Warning "Git working directory is not clean. Commit or stash changes first."
        Write-Info "Uncommitted changes:"
        git status --short
        return
    }
    
    # Run full check
    Invoke-FullCheck
    
    # Create release build
    Write-Info "Creating release build..."
    Invoke-Build
    
    # Get current version
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $currentVersion = $packageJson.version
    
    Write-Success "Release build completed for version $currentVersion"
    Write-Info "Next steps:"
    Write-Info "1. Review the build output in 'dist' directory"
    Write-Info "2. Test the production build"
    Write-Info "3. Create a git tag: git tag v$currentVersion"
    Write-Info "4. Push to repository: git push origin v$currentVersion"
}

# Electron build
function Invoke-Electron {
    Write-Header "Building Electron Application"
    Test-Dependencies
    
    # First build the web version
    Invoke-Build
    
    # Check if electron is available
    if (-not (Test-Path "node_modules/.bin/electron")) {
        Write-Warning "Electron not found. Installing..."
        npm install --save-dev electron
    }
    
    Write-Info "Building Electron app..."
    npm run electron-pack 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Electron build completed"
        if (Test-Path "dist-electron") {
            Write-Info "Electron build output available in 'dist-electron' directory"
        }
    } else {
        Write-Error "Electron build failed"
        Write-Info "Make sure 'electron-pack' script is defined in package.json"
    }
}

# Show help
function Show-Help {
    Write-Host @"
🎮 Coronata Game - Build Automation Script

USAGE:
    .\scripts\build-automation.ps1 [COMMAND] [OPTIONS]

COMMANDS:
    help         Show this help message
    install      Install project dependencies
    dev          Start development server
    build        Build project for production
    test         Run test suite
    lint         Run code linting
    clean        Clean build artifacts and cache
    analyze      Run code quality analysis
    full-check   Run comprehensive checks (lint + test + build + analyze)
    release      Prepare release build with full validation
    electron     Build Electron desktop application

OPTIONS:
    -Verbose     Show verbose output
    -Fix         Auto-fix linting issues (with lint command)
    -Watch       Run in watch mode (with test/dev commands)
    -Coverage    Include test coverage (with test command)

EXAMPLES:
    .\scripts\build-automation.ps1 dev                 # Start development server
    .\scripts\build-automation.ps1 test -Coverage      # Run tests with coverage
    .\scripts\build-automation.ps1 lint -Fix           # Lint and auto-fix issues
    .\scripts\build-automation.ps1 full-check          # Complete project validation
    .\scripts\build-automation.ps1 release             # Prepare for release

For more information, visit: https://github.com/your-repo/coronata-game
"@ -ForegroundColor Cyan
}

# Main execution
function Main {
    Write-Host "🎮 Coronata Game Build Automation" -ForegroundColor Magenta
    Write-Host "PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Gray
    Write-Host "Directory: $(Get-Location)" -ForegroundColor Gray
    
    # Test project directory (except for help command)
    if ($Command -ne 'help') {
        Test-ProjectDirectory
    }
    
    switch ($Command) {
        'help'       { Show-Help }
        'install'    { Invoke-Install }
        'dev'        { Invoke-Dev }
        'build'      { Invoke-Build }
        'test'       { Invoke-Test }
        'lint'       { Invoke-Lint }
        'clean'      { Invoke-Clean }
        'analyze'    { Invoke-Analyze }
        'full-check' { Invoke-FullCheck }
        'release'    { Invoke-Release }
        'electron'   { Invoke-Electron }
        default      { Show-Help }
    }
}

# Error handling
try {
    Main
} catch {
    Write-Error "Script execution failed: $($_.Exception.Message)"
    if ($Verbose) {
        Write-Host $_.ScriptStackTrace -ForegroundColor Red
    }
    exit 1
}