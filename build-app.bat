@echo off
echo 🚀 Starting POS System Build Process...
echo ======================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist "dist" rmdir /s /q "dist"
if exist "desktop-app" rmdir /s /q "desktop-app"
if exist "electron\dist" rmdir /s /q "electron\dist"
if exist "app-build" rmdir /s /q "app-build"
if exist "final-build" rmdir /s /q "final-build"
if exist "pos-app-build" rmdir /s /q "pos-app-build"
if exist "release" rmdir /s /q "release"

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Build preload script
echo 🔧 Building preload script...
call npm run build:preload

REM Check TypeScript compilation
echo 🔍 Checking TypeScript compilation...
call npm run build:check

REM Build Vue application
echo 🎨 Building Vue application...
call npm run build

REM Build Electron application
echo ⚡ Building Electron application...
call npm run electron:pack:win

echo ✅ Build completed successfully!
echo 📁 Output directory: packaged-app\POS System-win32-x64\
echo.
echo 🎉 Your POS System is ready to use!
echo    Run the executable from: packaged-app\POS System-win32-x64\
pause
