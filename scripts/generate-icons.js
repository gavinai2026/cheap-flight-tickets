#!/usr/bin/env node
/**
 * App Icon Generator for PremiumFlights
 *
 * Generates all required icon sizes for iOS and Android from a single source icon.
 *
 * Requirements:
 *   npm install sharp
 *
 * Usage:
 *   node scripts/generate-icons.js
 *
 * Source: assets/icon.png (must be at least 1024x1024)
 * Output: assets/icons/ directory with all required sizes
 */

const ICON_SIZES = {
  ios: [
    { name: 'icon-20@2x.png', size: 40 },
    { name: 'icon-20@3x.png', size: 60 },
    { name: 'icon-29@2x.png', size: 58 },
    { name: 'icon-29@3x.png', size: 87 },
    { name: 'icon-40@2x.png', size: 80 },
    { name: 'icon-40@3x.png', size: 120 },
    { name: 'icon-60@2x.png', size: 120 },
    { name: 'icon-60@3x.png', size: 180 },
    { name: 'icon-76.png', size: 76 },
    { name: 'icon-76@2x.png', size: 152 },
    { name: 'icon-83.5@2x.png', size: 167 },
    { name: 'icon-1024.png', size: 1024 },
  ],
  android: [
    { name: 'mipmap-mdpi/ic_launcher.png', size: 48 },
    { name: 'mipmap-hdpi/ic_launcher.png', size: 72 },
    { name: 'mipmap-xhdpi/ic_launcher.png', size: 96 },
    { name: 'mipmap-xxhdpi/ic_launcher.png', size: 144 },
    { name: 'mipmap-xxxhdpi/ic_launcher.png', size: 192 },
    { name: 'play-store-icon.png', size: 512 },
  ],
  expo: [
    { name: 'icon.png', size: 1024 },
    { name: 'adaptive-icon.png', size: 1024 },
    { name: 'splash-icon.png', size: 288 },
    { name: 'favicon.png', size: 48 },
  ],
};

console.log('=== PremiumFlights Icon Generator ===');
console.log('');
console.log('To generate icons, install sharp and run:');
console.log('  npm install --save-dev sharp');
console.log('  node scripts/generate-icons.js --run');
console.log('');
console.log('Or use an online tool:');
console.log('  1. Go to https://icon.kitchen or https://appicon.co');
console.log('  2. Upload your 1024x1024 icon');
console.log('  3. Download the generated icon set');
console.log('  4. Place files in assets/ directory');
console.log('');
console.log('Required icon files for Expo:');
ICON_SIZES.expo.forEach(({ name, size }) => {
  console.log(`  assets/${name} — ${size}x${size}px`);
});
console.log('');
console.log('Expo handles iOS and Android icon generation automatically from:');
console.log('  - icon (1024x1024) → All iOS sizes');
console.log('  - adaptive-icon (1024x1024) → All Android adaptive icon sizes');
console.log('');
console.log('Your current assets/ directory already has these files.');
console.log('Ensure icon.png is at least 1024x1024 for best quality.');

if (process.argv.includes('--run')) {
  try {
    const sharp = require('sharp');
    const fs = require('fs');
    const path = require('path');

    const srcIcon = path.join(__dirname, '..', 'assets', 'icon.png');
    const outDir = path.join(__dirname, '..', 'assets', 'icons');

    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const allSizes = [...ICON_SIZES.ios, ...ICON_SIZES.android];

    Promise.all(allSizes.map(async ({ name, size }) => {
      const outPath = path.join(outDir, name);
      const dir = path.dirname(outPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      await sharp(srcIcon)
        .resize(size, size, { fit: 'contain', background: { r: 26, g: 115, b: 232, alpha: 1 } })
        .png()
        .toFile(outPath);

      console.log(`  ✅ ${name} (${size}x${size})`);
    })).then(() => {
      console.log('\n✅ All icons generated successfully!');
    });
  } catch (e) {
    console.error('Error: sharp not installed. Run: npm install --save-dev sharp');
  }
}
