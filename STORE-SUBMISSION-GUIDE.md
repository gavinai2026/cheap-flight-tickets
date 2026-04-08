# PremiumFlights - App Store Submission Guide

Complete step-by-step guide to publish PremiumFlights on both iOS App Store and Google Play Store.

---

## Prerequisites

- Node.js 18+
- EAS CLI: `npm install -g eas-cli`
- Expo account: Create at https://expo.dev/signup
- Your app icon (1024x1024 PNG, no transparency for iOS)

---

## STEP 1: Create Expo Account & Link Project

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in (creates account if needed)
eas login

# Link this project to your Expo account
eas init
# This will assign a real projectId — update app.json and eas.json with it
```

---

## STEP 2: Apple Developer Account (iOS)

### Create Account ($99/year)
1. Go to https://developer.apple.com/programs/
2. Click "Enroll" → Sign in with your Apple ID (or create one)
3. Enroll as Individual or Organization ($99/year)
4. Complete identity verification (may take 24-48 hours)

### Set Up in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform:** iOS
   - **Name:** PremiumFlights - Business & First
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** com.premiumflights.app
   - **SKU:** premiumflights-001
4. Once created, note the **Apple ID** (numeric) from the App Information page

### Update eas.json with your credentials
```json
"ios": {
  "appleId": "your-actual-apple-id@email.com",
  "ascAppId": "1234567890",     // from App Store Connect
  "appleTeamId": "ABCD1234EF"  // from developer.apple.com → Membership
}
```

### App Store Connect Listing
1. Go to your app → "App Information"
   - Category: Travel
   - Secondary Category: Finance
   - Content Rights: "Does not contain third-party content"
2. Go to "Pricing and Availability"
   - Price: Free
   - Available in all territories
3. Go to "1.0 Prepare for Submission"
   - Copy description from `store-listing/app-store-metadata.json`
   - Add keywords from metadata file
   - Set promotional text
   - Upload screenshots (see Screenshot section below)
   - Set age rating: 4+
   - Set Privacy Policy URL (host the `store-listing/privacy-policy.html` file)

---

## STEP 3: Google Play Developer Account (Android)

### Create Account ($25 one-time)
1. Go to https://play.google.com/console/signup
2. Sign in with your Google account
3. Pay $25 registration fee
4. Complete identity verification

### Create Service Account for Automated Submission
1. Go to https://console.cloud.google.com
2. Create a new project or use existing
3. Enable "Google Play Android Developer API"
4. Go to IAM & Admin → Service Accounts → Create Service Account
   - Name: "EAS Submit"
   - Role: No role needed at project level
5. Create JSON key → Download as `play-store-key.json`
6. Place `play-store-key.json` in project root (already gitignored)
7. In Google Play Console → Settings → API access → Link the Cloud project
8. Grant the service account "Release Manager" permission

### Create App in Play Console
1. Go to Google Play Console → "Create app"
2. Fill in:
   - **App name:** PremiumFlights - Business & First Class Deals
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
3. Complete the "Dashboard" checklist:
   - Store listing (copy from `store-listing/app-store-metadata.json`)
   - Content rating questionnaire
   - Target audience and content
   - Privacy policy URL

---

## STEP 4: Screenshots

### Required Sizes
**iOS:**
- iPhone 6.7" (1290 x 2796) — Required
- iPhone 6.5" (1284 x 2778) — Required
- iPad Pro 12.9" (2048 x 2732) — Required if supporting iPad

**Android:**
- Phone (1080 x 1920 minimum) — Required
- Feature graphic (1024 x 500) — Required

### How to Take Screenshots
```bash
# Run app in iOS Simulator
npx expo start --ios

# Take screenshots using Cmd+S in Simulator
# Or use: xcrun simctl io booted screenshot screenshot.png

# Run app in Android Emulator
npx expo start --android

# Take screenshots using emulator toolbar button
```

### Recommended Screenshots (6-8)
1. **Search Screen** — Show the main search with Business/First toggle
2. **Search Results** — Flight list with prices
3. **Flight Details** — Price, itinerary, amenities
4. **Price Trend Chart** — Price prediction with buy/wait recommendation
5. **Compare Screen** — Business vs First Class comparison
6. **Trip Planner** — Trip timeline view
7. **Flight Tracker** — Live flight tracking
8. **Lounge Finder** — Airport lounge listing

---

## STEP 5: Build the App

```bash
# Make sure you're logged in
eas whoami

# Build for BOTH platforms (production)
eas build --platform all --profile production

# Or build individually:
eas build --platform ios --profile production
eas build --platform android --profile production

# Build takes 15-30 minutes. You'll get a URL to download the builds.
```

### First-time iOS Build
- EAS will ask to create provisioning profiles and certificates
- Choose "Let EAS handle it" for the easiest setup
- You'll need to authenticate with your Apple ID

### First-time Android Build
- EAS auto-generates a keystore
- **IMPORTANT:** Back up your keystore! Run: `eas credentials` to download it
- You'll need this same keystore for ALL future updates

---

## STEP 6: Submit to Stores

```bash
# Submit to BOTH stores
eas submit --platform all --profile production

# Or individually:
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

### iOS Submission
- Build will be uploaded to App Store Connect via Transporter
- Go to App Store Connect → Your App → "1.0 Prepare for Submission"
- Select the uploaded build
- Click "Submit for Review"
- **Review typically takes 24-48 hours**

### Android Submission
- Build will be uploaded to Google Play Console
- Go to Play Console → Your App → "Production" or "Internal Testing"
- Review the release → "Start rollout"
- **Internal testing:** Available immediately
- **Production:** Review takes a few hours to a few days

---

## STEP 7: Testing Before Public Release

### Recommended Flow
1. **Internal Testing First** (both platforms)
   ```bash
   # Build preview APK for quick testing
   eas build --platform android --profile preview
   # This generates a direct-install APK
   ```

2. **TestFlight (iOS)**
   - After submitting, go to App Store Connect → TestFlight
   - Add internal testers (up to 100)
   - Build is available within minutes after processing

3. **Internal Test Track (Android)**
   - In Play Console → Testing → Internal testing
   - Add tester email addresses
   - Testers get a Play Store link to install

---

## STEP 8: OTA Updates (After Initial Release)

Once your app is live, push updates without going through store review:

```bash
# Push an update to all production users
eas update --branch production --message "Bug fixes and performance improvements"

# Push to preview channel for testing first
eas update --branch preview --message "Testing new feature"
```

---

## Quick Reference Commands

```bash
# Login
eas login

# Check current status
eas whoami

# Build
eas build --platform all --profile production

# Submit
eas submit --platform all --profile production

# OTA Update
eas update --branch production --message "Description"

# View build status
eas build:list

# Download credentials (backup!)
eas credentials
```

---

## Files Checklist

| File | Status | Notes |
|------|--------|-------|
| `app.json` | ✅ Ready | Full metadata configured |
| `eas.json` | ⚠️ Needs credentials | Update Apple/Google IDs after account creation |
| `assets/icon.png` | ✅ Exists | Ensure 1024x1024 |
| `assets/adaptive-icon.png` | ✅ Exists | For Android |
| `assets/splash-icon.png` | ✅ Exists | Splash screen |
| `store-listing/privacy-policy.html` | ✅ Ready | Host this publicly |
| `store-listing/terms-of-service.html` | ✅ Ready | Host this publicly |
| `store-listing/app-store-metadata.json` | ✅ Ready | Copy descriptions to stores |
| `play-store-key.json` | ❌ Not yet | Create from Google Cloud Console |
| Screenshots | ❌ Not yet | Take from running app |

---

## Estimated Timeline

| Step | Time |
|------|------|
| Create Expo account | 5 minutes |
| Apple Developer enrollment | 24-48 hours (verification) |
| Google Play enrollment | Same day |
| App Store Connect setup | 30 minutes |
| Play Console setup | 30 minutes |
| Build both platforms | 15-30 minutes |
| Take screenshots | 30 minutes |
| Submit iOS | 5 minutes (+ 24-48hr review) |
| Submit Android | 5 minutes (+ few hours review) |
| **Total to first submission** | **~2-3 days** (mostly Apple verification) |
