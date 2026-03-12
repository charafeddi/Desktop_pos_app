dev# Quick Start Guide - POS Desktop Application

## 🚀 Running the Application

### Development Mode

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Run Development Server
You have two options:

**Option A: Run Vue + Electron Together**
```bash
# Terminal 1: Start Vue dev server
npm run dev

# Terminal 2: Start Electron (in a new terminal)
npm run electron:dev
```

**Option B: Use the electron-start script**
```bash
# This automatically starts both Vue and Electron
npm run electron:dev
```

The application will open in a desktop window with hot-reload enabled.

---

## 📦 Building/Packaging the Desktop App

### Build for Windows

#### Option 1: Standard Build (Recommended)
```bash
# Build preload script
npm run build:preload

# Build Vue app
npm run build

# Package for Windows
npm run electron:build:win
```

#### Option 2: One Command Build
```bash
# This runs all build steps automatically
npm run electron:build:win
```

#### Option 3: Portable Version (No Installer)
```bash
npm run electron:build:win:portable
```

#### Option 4: Directory Build (Unpacked)
```bash
npm run electron:build:win:dir
```

### Build for macOS
```bash
npm run electron:build:mac
```

### Build for Linux
```bash
npm run electron:build:linux
```

### Build for All Platforms
```bash
npm run electron:build:all
```

---

## 📁 Where to Find Built App

After building, your packaged application will be in:

```
desktop-app/
├── POS System-1.0.0-x64.exe          # Windows installer
├── POS System-1.0.0-x64-portable.exe # Windows portable (if built)
└── win-unpacked/                      # Unpacked Windows app (if built with :dir)
    └── POS System.exe                 # Executable
```

---

## 🔧 Common Commands Reference

### Development
```bash
npm run dev                    # Start Vue dev server only
npm run electron:dev           # Start Electron with Vue dev server
npm run preview               # Preview production build
```

### Building
```bash
npm run build                 # Build Vue app only
npm run build:preload         # Build Electron preload script
npm run build:check           # Type-check without building
```

### Packaging
```bash
npm run electron:build        # Build for current platform
npm run electron:build:win    # Build Windows installer
npm run electron:pack:win     # Package with electron-packager
npm run dist                  # Alias for electron:build
npm run pack                  # Build and pack (no installer)
```

---

## 🐛 Troubleshooting

### Issue: JWT_SECRET Error

**Error Message:**
```
Error: JWT_SECRET is required in production
```

**Solution 1: The app now has a default JWT_SECRET for Electron**
```bash
# Just restart the app - the fix is already applied
npm run electron:dev
```

**Solution 2: Create .env file (optional)**
```bash
# Copy the example file
cp .env.example .env

# Or on Windows
copy .env.example .env

# Edit .env and set JWT_SECRET (optional for desktop app)
```

**Note:** The JWT_SECRET is now automatically provided for Electron desktop apps. You only need to set it manually if deploying as a web application.

### Issue: White Screen on Launch

**Solution 1: Check if Vue is built**
```bash
# Build Vue app first
npm run build

# Then run Electron
npm run electron:dev
```

**Solution 2: Clear cache and rebuild**
```bash
# Delete node_modules and dist
rm -rf node_modules dist desktop-app

# Reinstall and rebuild
npm install
npm run build
npm run electron:build:win
```

### Issue: Database Errors

**Solution: Delete database and restart**
```bash
# Windows: Delete database
del backend\data\pos.db

# Or in AppData (for packaged app)
# Navigate to: %APPDATA%\POS-System\data\
# Delete pos.db

# Restart the app - it will create a new database
```

### Issue: Build Fails

**Solution 1: Clean build**
```bash
npm run build:preload
npm run build
npm run electron:build:win
```

**Solution 2: Check Node version**
```bash
# Ensure you're using Node 16+ and npm 8+
node --version
npm --version
```

---

## 📝 Step-by-Step: First Time Setup

### 1. Clone/Download Project
```bash
cd Desktop_pos_app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run in Development
```bash
# Terminal 1
npm run dev

# Terminal 2 (new terminal)
npm run electron:dev
```

### 4. Build for Production
```bash
# Build everything
npm run build:preload
npm run build

# Package for Windows
npm run electron:build:win
```

### 5. Find Your App
```bash
# Navigate to
cd desktop-app

# Your installer is here:
# POS System-1.0.0-x64.exe
```

### 6. Install and Run
- Double-click `POS System-1.0.0-x64.exe`
- Follow installation wizard
- Launch the app from Start Menu or Desktop shortcut

---

## 🔐 Default Login Credentials

After first launch, use these credentials:

```
Email: admin@pos.com
Password: admin123
```

**⚠️ Important:** Change the password after first login!

---

## 📊 Database Location

### Development
```
backend/data/pos.db
```

### Production (Installed App)
```
Windows: %APPDATA%\POS-System\data\pos.db
macOS: ~/Library/Application Support/POS-System/data/pos.db
Linux: ~/.config/POS-System/data/pos.db
```

---

## 🔄 Applying the Recent Bug Fix

The bug fix for `sale_number` will be applied automatically when you:

1. **Restart the application** - The migration runs on startup
2. **Or rebuild the app** - Fresh build includes the fix

```bash
# To apply the fix:
# Option 1: Just restart the app (if already running)
# Option 2: Rebuild
npm run build
npm run electron:dev
```

The migration `0003_fix_sale_number_constraint.sql` will run automatically and fix the database schema.

---

## 📦 Distribution

### Sharing Your Built App

After building, you can share:

**For Installation:**
- `desktop-app/POS System-1.0.0-x64.exe` (Windows Installer)

**For Portable Use:**
- `desktop-app/POS System-1.0.0-x64-portable.exe` (No installation needed)

**For Development:**
- Share the entire `desktop-app/win-unpacked/` folder

---

## 🎯 Quick Reference Card

| Task | Command |
|------|---------|
| **Run Dev** | `npm run dev` + `npm run electron:dev` |
| **Build App** | `npm run electron:build:win` |
| **Find Built App** | `desktop-app/POS System-1.0.0-x64.exe` |
| **Clean Build** | Delete `dist/` and `desktop-app/`, then rebuild |
| **Reset Database** | Delete `backend/data/pos.db` |
| **Default Login** | admin@pos.com / admin123 |

---

## 💡 Pro Tips

1. **Always build preload first:**
   ```bash
   npm run build:preload
   ```

2. **For faster development, use hot-reload:**
   ```bash
   npm run dev  # Keep this running
   npm run electron:dev  # In another terminal
   ```

3. **To test production build locally:**
   ```bash
   npm run build
   npm run preview
   ```

4. **To create a portable version (no installer):**
   ```bash
   npm run electron:build:win:portable
   ```

5. **Check build configuration in:**
   - `package.json` (under "build" section)
   - `electron-builder.yml` (if exists)

---

## 🆘 Need Help?

1. Check `BUILD_GUIDE.md` for detailed build instructions
2. Check `WHITE-SCREEN-FIX.md` for UI issues
3. Check `DATABASE-FIXED.md` for database problems
4. Check `ARCHITECTURE.md` for technical details

---

## ✅ Verification Checklist

After building, verify:

- [ ] App launches without errors
- [ ] Login works with default credentials
- [ ] Database is created in correct location
- [ ] Can create products
- [ ] Can create sales (bug fix applied)
- [ ] Can view sales history
- [ ] Can print receipts
- [ ] All menu items work

---

**Last Updated:** After bug fix for sale_number constraint
**Version:** 1.0.0
