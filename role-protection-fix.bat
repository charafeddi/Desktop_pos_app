@echo off
echo 🔒 FIXING ROLE-BASED PROTECTION
echo ===============================

echo 🧹 Cleaning old builds...
if exist "dist" rmdir /s /q "dist"
if exist "packaged-app" rmdir /s /q "packaged-app"

echo 🔧 Building preload script...
call npm run build:preload

echo 🎨 Building Vue application...
call npm run build

echo ⚡ Packaging Electron application...
call npm run electron:pack:win

echo 🎯 Testing role-based protection...
start "" "packaged-app\POS System-win32-x64\POS System.exe"

echo.
echo ✅ ROLE PROTECTION RESTORED!
echo.
echo 📋 Changes made:
echo 1. Restored Analytics role requirement (admin/manager only)
echo 2. Added role-based visibility to Sidebar
echo 3. Analytics link only shows for admin/manager users
echo 4. Fixed profile image paths to use relative paths (./assets/)
echo 5. Removed security-sensitive console logs
echo.
echo 🔍 Test these features:
echo 1. Check Profile page - images should load correctly
echo 2. Check Sidebar - Analytics link should only show for admin/manager
echo 3. Try clicking Analytics - should redirect to dashboard if not admin/manager
echo 4. Check Profile images - should now load correctly with relative paths
echo 5. Try clicking Settings - should work for admin users
echo.
echo 💡 To fix Analytics access:
echo - Either change user role to 'admin' or 'manager'
echo - Or create a new user with admin/manager role
echo.
pause
