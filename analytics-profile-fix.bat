@echo off
echo 🔧 FIXING ANALYTICS & PROFILE IMAGES
echo ====================================

echo 🧹 Cleaning old builds...
if exist "dist" rmdir /s /q "dist"
if exist "packaged-app" rmdir /s /q "packaged-app"

echo 🔧 Building preload script...
call npm run build:preload

echo 🎨 Building Vue application...
call npm run build

echo ⚡ Packaging Electron application...
call npm run electron:pack:win

echo 🎯 Testing fixes...
start "" "packaged-app\POS System-win32-x64\POS System.exe"

echo.
echo ✅ FIXES APPLIED!
echo.
echo 📋 Changes made:
echo 1. Removed role requirement from Analytics route
echo 2. Added image error handling to Profile component
echo 3. Added debugging for image loading
echo.
echo 🔍 Test these features:
echo 1. Click Analytics - should work now (no role restriction)
echo 2. Check Profile page - images should load with debugging
echo 3. Check DevTools Console for image loading messages
echo.
pause
