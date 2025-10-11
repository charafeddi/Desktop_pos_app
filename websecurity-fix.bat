@echo off
echo 🔧 REBUILDING WITH WEB SECURITY FIX
echo ===================================

echo 🧹 Cleaning old builds...
if exist "dist" rmdir /s /q "dist"
if exist "packaged-app" rmdir /s /q "packaged-app"

echo 🔧 Building preload script...
call npm run build:preload

echo 🎨 Building Vue application...
call npm run build

echo ⚡ Packaging Electron application...
call npm run electron:pack:win

echo 🎯 Testing with web security disabled...
start "" "packaged-app\POS System-win32-x64\POS System.exe"

echo.
echo ✅ REBUILD COMPLETE!
echo The webSecurity: false fix should resolve the empty screen issue.
pause
