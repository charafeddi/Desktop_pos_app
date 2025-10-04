#!/bin/bash

# POS System Build Script
# This script helps build the POS desktop application for different platforms

echo "🏪 POS System Build Script"
echo "=========================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if required tools are installed
check_dependencies() {
    echo "🔍 Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed"
        exit 1
    fi
    
    echo "✅ Dependencies check passed"
}

# Function to install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
}

# Function to build for current platform
build_current() {
    echo "🔨 Building for current platform..."
    npm run electron:build
    echo "✅ Build completed! Check the 'release' folder"
}

# Function to build for Windows
build_windows() {
    echo "🔨 Building for Windows..."
    npm run electron:build:win
    echo "✅ Windows build completed!"
}

# Function to build for macOS
build_macos() {
    echo "🔨 Building for macOS..."
    npm run electron:build:mac
    echo "✅ macOS build completed!"
}

# Function to build for Linux
build_linux() {
    echo "🔨 Building for Linux..."
    npm run electron:build:linux
    echo "✅ Linux build completed!"
}

# Function to build for all platforms
build_all() {
    echo "🔨 Building for all platforms..."
    npm run electron:build:all
    echo "✅ All platform builds completed!"
}

# Function to create a portable build (no installer)
build_portable() {
    echo "🔨 Creating portable build..."
    npm run pack
    echo "✅ Portable build completed!"
}

# Function to clean build artifacts
clean() {
    echo "🧹 Cleaning build artifacts..."
    rm -rf dist/
    rm -rf release/
    rm -rf electron/dist/
    echo "✅ Clean completed!"
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  current    Build for current platform"
    echo "  windows    Build for Windows"
    echo "  macos      Build for macOS"
    echo "  linux      Build for Linux"
    echo "  all        Build for all platforms"
    echo "  portable   Create portable build (no installer)"
    echo "  clean      Clean build artifacts"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 current    # Build for your current OS"
    echo "  $0 windows    # Build Windows installer"
    echo "  $0 all        # Build for all platforms"
}

# Main script logic
case "$1" in
    "current")
        check_dependencies
        install_dependencies
        build_current
        ;;
    "windows")
        check_dependencies
        install_dependencies
        build_windows
        ;;
    "macos")
        check_dependencies
        install_dependencies
        build_macos
        ;;
    "linux")
        check_dependencies
        install_dependencies
        build_linux
        ;;
    "all")
        check_dependencies
        install_dependencies
        build_all
        ;;
    "portable")
        check_dependencies
        install_dependencies
        build_portable
        ;;
    "clean")
        clean
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    "")
        echo "No option specified. Use '$0 help' for usage information."
        ;;
    *)
        echo "Unknown option: $1"
        echo "Use '$0 help' for usage information."
        exit 1
        ;;
esac
