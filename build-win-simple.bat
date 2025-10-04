@echo off
REM POS System Windows Build Script - Bypass Code Signing Issues
REM This script creates a working Windows app without code signing

echo 🏪 Building POS System for Windows (No Code Signing)...
echo =====================================================

REM Set environment variables to completely disable code signing
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set WIN_CSC_KEY_PASSWORD=
set CSC_LINK=
set CSC_KEY_PASSWORD=

REM Build preload
echo 📦 Building preload...
call npm run build:preload
if %errorlevel% neq 0 (
    echo ❌ Preload build failed
    pause
    exit /b 1
)

REM Build frontend
echo 🎨 Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

REM Create release directory
if not exist "release" mkdir release

REM Build unpacked version (no installer, no code signing)
echo 🔨 Building unpacked Windows app...
call npx electron-builder --win --dir --config.win.sign=false --config.win.target=dir
if %errorlevel% neq 0 (
    echo ❌ Unpacked build failed
    pause
    exit /b 1
)

echo ✅ Build completed successfully!
echo 📁 Your app is ready in: release\win-unpacked\
echo 🚀 To run your app: Go to release\win-unpacked\ and double-click "POS System.exe"
echo.
echo 📝 Note: This creates an unpacked version (folder with exe file)
echo    For a single .exe installer, we need to resolve the code signing issue first.
pause
