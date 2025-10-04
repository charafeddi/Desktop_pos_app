# App Icons Guide

## Required Icon Files

For a professional desktop app, you need the following icon files in the `build/` directory:

### Windows
- `icon.ico` - Windows icon file (256x256 pixels, multiple sizes)

### macOS  
- `icon.icns` - macOS icon file (512x512 pixels, multiple sizes)

### Linux
- `icon.png` - PNG icon file (512x512 pixels)

## Creating Icons

### Option 1: Online Icon Generator
1. Go to https://www.favicon-generator.org/ or https://iconifier.net/
2. Upload a 512x512 PNG image of your logo
3. Download the generated icons
4. Place them in the `build/` directory

### Option 2: Manual Creation
1. Create a 512x512 PNG logo for your POS system
2. Use tools like:
   - **Windows**: IcoFX, GIMP
   - **macOS**: Icon Composer, GIMP
   - **Linux**: GIMP, Inkscape

### Option 3: Use Default Icons
For now, you can use simple placeholder icons. The app will still work but won't have custom branding.

## Icon Design Tips
- Use your company logo or a POS-related icon (cash register, shopping cart, etc.)
- Keep it simple and recognizable at small sizes
- Use high contrast colors
- Ensure it looks good on both light and dark backgrounds

## File Structure
```
build/
├── icon.ico      (Windows)
├── icon.icns     (macOS)
├── icon.png      (Linux)
└── dmg-background.png (macOS DMG background - optional)
```
