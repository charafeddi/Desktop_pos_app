@echo off
REM POS System Build Script for Windows
REM This script helps build the POS desktop application for different platforms

echo 🏪 POS System Build Script
echo ==========================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM Function to check dependencies
:check_dependencies
echo 🔍 Checking dependencies...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)

echo ✅ Dependencies check passed
goto :eof

REM Function to install dependencies
:install_dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
goto :eof

REM Function to build for current platform
:build_current
echo 🔨 Building for current platform...
call npm run electron:build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✅ Build completed! Check the 'release' folder
goto :eof

REM Function to build for Windows
:build_windows
echo 🔨 Building for Windows...
call npm run electron:build:win
if %errorlevel% neq 0 (
    echo ❌ Windows build failed
    pause
    exit /b 1
)
echo ✅ Windows build completed!
goto :eof

REM Function to build for macOS
:build_macos
echo 🔨 Building for macOS...
call npm run electron:build:mac
if %errorlevel% neq 0 (
    echo ❌ macOS build failed
    pause
    exit /b 1
)
echo ✅ macOS build completed!
goto :eof

REM Function to build for Linux
:build_linux
echo 🔨 Building for Linux...
call npm run electron:build:linux
if %errorlevel% neq 0 (
    echo ❌ Linux build failed
    pause
    exit /b 1
)
echo ✅ Linux build completed!
goto :eof

REM Function to build for all platforms
:build_all
echo 🔨 Building for all platforms...
call npm run electron:build:all
if %errorlevel% neq 0 (
    echo ❌ All platform build failed
    pause
    exit /b 1
)
echo ✅ All platform builds completed!
goto :eof

REM Function to create a portable build
:build_portable
echo 🔨 Creating portable build...
call npm run pack
if %errorlevel% neq 0 (
    echo ❌ Portable build failed
    pause
    exit /b 1
)
echo ✅ Portable build completed!
goto :eof

REM Function to clean build artifacts
:clean
echo 🧹 Cleaning build artifacts...
if exist "dist" rmdir /s /q "dist"
if exist "release" rmdir /s /q "release"
if exist "electron\dist" rmdir /s /q "electron\dist"
echo ✅ Clean completed!
goto :eof

REM Function to show help
:show_help
echo Usage: %0 [OPTION]
echo.
echo Options:
echo   current    Build for current platform
echo   windows    Build for Windows
echo   macos      Build for macOS
echo   linux      Build for Linux
echo   all        Build for all platforms
echo   portable   Create portable build (no installer)
echo   clean      Clean build artifacts
echo   help       Show this help message
echo.
echo Examples:
echo   %0 current    # Build for your current OS
echo   %0 windows    # Build Windows installer
echo   %0 all        # Build for all platforms
goto :eof

REM Main script logic
if "%1"=="current" (
    call :check_dependencies
    call :install_dependencies
    call :build_current
) else if "%1"=="windows" (
    call :check_dependencies
    call :install_dependencies
    call :build_windows
) else if "%1"=="macos" (
    call :check_dependencies
    call :install_dependencies
    call :build_macos
) else if "%1"=="linux" (
    call :check_dependencies
    call :install_dependencies
    call :build_linux
) else if "%1"=="all" (
    call :check_dependencies
    call :install_dependencies
    call :build_all
) else if "%1"=="portable" (
    call :check_dependencies
    call :install_dependencies
    call :build_portable
) else if "%1"=="clean" (
    call :clean
) else if "%1"=="help" (
    call :show_help
) else if "%1"=="-h" (
    call :show_help
) else if "%1"=="--help" (
    call :show_help
) else if "%1"=="" (
    echo No option specified. Use '%0 help' for usage information.
) else (
    echo Unknown option: %1
    echo Use '%0 help' for usage information.
    exit /b 1
)

pause
