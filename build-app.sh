#!/bin/bash

echo "🚀 Starting POS System Build Process..."
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf desktop-app/
rm -rf electron/dist/
rm -rf app-build/
rm -rf final-build/
rm -rf pos-app-build/
rm -rf release/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build preload script
echo "🔧 Building preload script..."
npm run build:preload

# Check TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
npm run build:check

# Build Vue application
echo "🎨 Building Vue application..."
npm run build

# Build Electron application
echo "⚡ Building Electron application..."
npm run electron:pack:win

echo "✅ Build completed successfully!"
echo "📁 Output directory: packaged-app/POS System-win32-x64/"
echo ""
echo "🎉 Your POS System is ready to use!"
echo "   Run the executable from: packaged-app/POS System-win32-x64/"
