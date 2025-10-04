# 🏪 POS System - Desktop App Build Guide

This guide will help you package your POS system into a distributable desktop application.

## 📋 Prerequisites

Before building, make sure you have:

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **Git** (for version control)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build for Your Platform
```bash
# Windows
npm run electron:build:win

# macOS  
npm run electron:build:mac

# Linux
npm run electron:build:linux

# All platforms
npm run electron:build:all
```

### 3. Find Your App
After building, check the `release/` folder for your installable app!

## 🛠️ Build Options

### Platform-Specific Builds

| Platform | Command | Output |
|----------|---------|--------|
| Windows | `npm run electron:build:win` | `.exe` installer + portable |
| macOS | `npm run electron:build:mac` | `.dmg` installer |
| Linux | `npm run electron:build:linux` | `.AppImage` + `.deb` package |

### Build Scripts

Use the provided build scripts for easier building:

**Windows:**
```cmd
build.bat current    # Build for Windows
build.bat all        # Build for all platforms
build.bat clean      # Clean build files
```

**Linux/macOS:**
```bash
chmod +x build.sh
./build.sh current   # Build for current platform
./build.sh all       # Build for all platforms
./build.sh clean     # Clean build files
```

## 📁 Output Files

After building, you'll find these files in the `release/` folder:

### Windows
- `POS System-1.0.0-x64.exe` - Windows installer
- `POS System-1.0.0-x64-portable.exe` - Portable version

### macOS
- `POS System-1.0.0-x64.dmg` - macOS installer
- `POS System-1.0.0-arm64.dmg` - Apple Silicon installer

### Linux
- `POS System-1.0.0-x64.AppImage` - Portable Linux app
- `POS System-1.0.0-x64.deb` - Debian package

## 🎨 App Icons

To add custom app icons:

1. **Create your logo** (512x512 PNG)
2. **Convert to required formats**:
   - Windows: `.ico` file
   - macOS: `.icns` file  
   - Linux: `.png` file
3. **Place in `build/` directory**:
   ```
   build/
   ├── icon.ico
   ├── icon.icns
   └── icon.png
   ```

**Icon Tools:**
- Online: https://www.favicon-generator.org/
- Windows: IcoFX
- macOS: Icon Composer
- Linux: GIMP

## ⚙️ Configuration

### App Metadata
Edit `package.json` to customize:
- App name and description
- Version number
- Author information
- Copyright notice

### Build Settings
The `build` section in `package.json` controls:
- Installer behavior
- File inclusion/exclusion
- Platform-specific settings
- Icon locations

## 🔧 Troubleshooting

### Common Issues

**Build fails with "electron-builder not found"**
```bash
npm install electron-builder --save-dev
```

**Icons not showing**
- Make sure icon files are in `build/` directory
- Check file names match configuration
- Verify icon file formats

**App won't start**
- Check if all dependencies are included
- Verify database files are copied correctly
- Test in development mode first

### Debug Build
```bash
npm run pack  # Creates unpacked app for testing
```

## 📦 Distribution

### Windows
- **Installer**: Professional NSIS installer with shortcuts
- **Portable**: Single `.exe` file, no installation needed

### macOS
- **DMG**: Drag-and-drop installer
- **Code Signing**: Add certificates for distribution

### Linux
- **AppImage**: Universal Linux package
- **DEB**: Debian/Ubuntu package

## 🚀 Advanced Features

### Auto-Updates
Add update server configuration to enable automatic updates.

### Code Signing
Sign your app for trusted distribution:
- Windows: Authenticode certificates
- macOS: Apple Developer certificates

### Notarization (macOS)
Required for macOS distribution outside App Store.

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all dependencies are installed
3. Test in development mode first
4. Check the `release/` folder for error logs

## 🎉 Success!

Once built successfully, you'll have:
- ✅ Professional desktop application
- ✅ Cross-platform compatibility  
- ✅ Easy installation process
- ✅ Automatic shortcuts and file associations
- ✅ Uninstaller included

Your POS system is now ready for distribution! 🎊
