# Running PremiumFlights Locally

## Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn**
- For mobile testing: **Expo Go** app on your phone (free from App Store / Play Store)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npx expo start
```

This opens the Expo developer tools. From here you have several options:

---

## Option 1: Phone (Expo Go) — Recommended

The fastest way to see the app running on a real device.

1. Install **Expo Go** on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Run `npx expo start`
3. **iPhone:** Open Camera and scan the QR code
4. **Android:** Open Expo Go and scan the QR code

The app loads directly on your phone — no build needed.

## Option 2: Web Browser — Instant Preview

```bash
npx expo start --web
```

Opens the app in your browser at `http://localhost:8081`. Great for quick visual testing.

## Option 3: iOS Simulator (Mac only)

Requires Xcode installed.

```bash
npx expo start --ios
```

Automatically opens the iOS Simulator and loads the app.

## Option 4: Android Emulator

Requires Android Studio with an AVD configured.

```bash
npx expo start --android
```

Automatically opens the Android Emulator and loads the app.

---

## Testing Premium Features

The app has a **Free/Premium** tier system. By default you start on the Free tier with:
- 5 searches per day
- 5 results per search
- Basic flight details only

### Toggle Premium (Dev Mode)

In development mode, you can instantly switch between Free and Premium:

1. Go to **Settings** tab (bottom right)
2. Tap the yellow **"Dev: Toggle Premium"** button at the top
3. All premium features instantly unlock/lock

You can also access the Paywall screen:
- Tap any locked feature (PRO badge)
- Or tap "Upgrade to Pro" in Settings
- Use the **"Dev: Toggle Premium On"** button on the Paywall

---

## Troubleshooting

### "Unable to resolve module" errors
```bash
npx expo start --clear
```

### Metro bundler cache issues
```bash
rm -rf node_modules/.cache
npx expo start --clear
```

### Dependencies out of sync
```bash
rm -rf node_modules
npm install
npx expo start
```

### Expo Go version mismatch
Update Expo Go to the latest version from the app store.
