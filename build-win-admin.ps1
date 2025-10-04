# POS System Windows Build Script with Admin Privileges
# This script requests admin privileges and builds the app

param(
    [switch]$Force
)

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    if (!$Force) {
        Write-Host "This script requires administrator privileges." -ForegroundColor Red
        Write-Host "Restarting with elevated privileges..." -ForegroundColor Yellow
        
        # Restart with elevated privileges
        Start-Process PowerShell -Verb RunAs -ArgumentList "-File", "`"$PSCommandPath`"", "-Force"
        exit
    } else {
        Write-Host "Running without admin privileges (may fail)" -ForegroundColor Yellow
    }
}

Write-Host "🏪 Building POS System for Windows with Admin Privileges..." -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green

# Set environment variables to disable code signing
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
$env:WIN_CSC_LINK = ""
$env:WIN_CSC_KEY_PASSWORD = ""

# Build preload
Write-Host "📦 Building preload..." -ForegroundColor Cyan
npm run build:preload
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Preload build failed" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

# Build frontend
Write-Host "🎨 Building frontend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

# Build Windows app
Write-Host "🔨 Building Windows app..." -ForegroundColor Cyan
npm run electron:build:win
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Windows build failed" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host "📁 Check the 'release' folder for your app" -ForegroundColor Green
Read-Host "Press Enter to continue"
