@echo off
echo 🧹 COMPLETE CLEAN AND REBUILD
echo =============================

echo 🗑️ Step 1: Cleaning all build artifacts...
if exist "dist" rmdir /s /q "dist"
if exist "packaged-app" rmdir /s /q "packaged-app"
if exist "electron\dist" rmdir /s /q "electron\dist"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

echo 📦 Step 2: Installing dependencies...
call npm install

echo 🔧 Step 3: Building preload script...
call npm run build:preload

echo 🎨 Step 4: Building Vue application...
call npm run build

echo 📁 Step 5: Verifying dist folder...
if exist "dist\index.html" (
    echo ✅ dist/index.html created successfully
    if exist "dist\assets" (
        echo ✅ dist/assets folder created
        echo 📄 Assets found:
        dir /b dist\assets | findstr /i "\.js \.css"
    ) else (
        echo ❌ dist/assets folder missing
    )
) else (
    echo ❌ dist/index.html NOT FOUND!
    pause
    exit /b 1
)

echo ⚡ Step 6: Packaging Electron application...
call npm run electron:pack:win

echo 📁 Step 7: Verifying packaged application...
if exist "packaged-app\POS System-win32-x64\POS System.exe" (
    echo ✅ POS System.exe created successfully
    if exist "packaged-app\POS System-win32-x64\resources\app\dist" (
        echo ✅ dist folder included in package
    ) else (
        echo ❌ dist folder missing from package
    )
) else (
    echo ❌ Packaging failed!
    pause
    exit /b 1
)

echo 🎯 Step 8: Testing the application...
echo Opening DevTools to check for any errors...
start "" "packaged-app\POS System-win32-x64\POS System.exe"

echo.
echo ✅ COMPLETE REBUILD FINISHED!
echo.
echo 📋 What to check:
echo 1. App should show loading spinner briefly
echo 2. Then show login screen (if not authenticated)
echo 3. Or show dashboard (if authenticated)
echo 4. Check DevTools Console for any errors
echo.
pause
