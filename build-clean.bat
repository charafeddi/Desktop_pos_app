@echo off
echo Building POS App...

REM Kill any running processes
taskkill /f /im "Desktop POS App.exe" 2>nul
taskkill /f /im "electron.exe" 2>nul

REM Clean directories
if exist "release" rmdir /s /q "release"
if exist "dist-electron" rmdir /s /q "dist-electron"
if exist "dist" rmdir /s /q "dist"

REM Build the app
npm run build
npm run build:preload
npm run electron:build:win

echo Build complete!
pause
