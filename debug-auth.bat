@echo off
echo 🔍 DEBUGGING AUTHENTICATION ISSUES
echo ===================================

echo 📋 Checking localStorage contents...
echo.

echo 🔑 Auth Token:
if exist "%APPDATA%\POS-System\data\pos.db" (
    echo ✅ Database exists at: %APPDATA%\POS-System\data\pos.db
) else (
    echo ❌ Database not found
)

echo.
echo 📂 Checking packaged app structure...
if exist "packaged-app\POS System-win32-x64\POS System.exe" (
    echo ✅ POS System.exe exists
    echo 📁 Location: packaged-app\POS System-win32-x64\
) else (
    echo ❌ Packaged app not found
)

echo.
echo 🎯 Testing application startup...
echo Opening DevTools to check console for auth errors...
start "" "packaged-app\POS System-win32-x64\POS System.exe"

echo.
echo 📋 Common Authentication Issues:
echo 1. localStorage not accessible in packaged app
echo 2. Database connection failing
echo 3. Auth store not initializing properly
echo 4. Router guard interfering with initial render
echo.
echo 🔧 Check DevTools Console for:
echo - "Auth initialization:" messages
echo - "Error loading auth state" messages
echo - Database connection errors
echo - Router navigation errors
echo.
pause
