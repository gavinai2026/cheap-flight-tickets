# PremiumFlights - Cheap Business & First Class Ticket Finder

A cross-platform mobile app (iOS & Android) built with React Native / Expo that helps travelers find the cheapest business and first class airline tickets worldwide.

## Features

- **Global Flight Search** - Search business and first class flights across 35+ airlines worldwide
- **50+ Airports** - Coverage spanning North America, Europe, Middle East, Asia, Oceania, South America, and Africa
- **Smart Filtering** - Filter by stops, airlines, price range, and sort by price, duration, or departure time
- **Price Calendar** - Visual calendar showing cheapest dates to fly with color-coded pricing
- **Price Alerts** - Set target prices and get notified when fares drop
- **Daily Deals Feed** - Curated premium cabin deals with deep discounts (up to 50% off)
- **Flight Details** - Comprehensive view with amenities, fare rules, baggage allowance, and layover info
- **Saved Searches** - Bookmark frequent routes for quick re-search
- **Favorites** - Heart flights to compare later
- **Flexible Dates** - Search with +/- 3 day flexibility
- **Multi-passenger** - Support for adults, children, and infants
- **Round Trip & One Way** - Both trip types supported

## Airlines Covered

Emirates, Qatar Airways, Singapore Airlines, Cathay Pacific, Etihad, Turkish Airlines, Lufthansa, British Airways, Air France, KLM, American Airlines, United, Delta, Qantas, ANA, Japan Airlines, Korean Air, and 20+ more covering all major alliances (Star Alliance, oneworld, SkyTeam).

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (bottom tabs + stack)
- **State Management**: React Context API + useReducer
- **Storage**: AsyncStorage for persistence
- **Platform**: iOS, Android, and Web

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Project Structure

```
src/
  components/     # Reusable UI components
  constants/      # Theme, airports, airlines data
  context/        # App state management (Context + Reducer)
  navigation/     # Tab and stack navigators
  screens/        # App screens
  services/       # API/flight search service layer
  types/          # TypeScript type definitions
  utils/          # Helper utilities
```

## Screens

1. **Search** - Main search interface with airport picker, date selection, cabin class toggle
2. **Results** - Flight listings with sort/filter capabilities
3. **Flight Details** - Full flight info, amenities, fare rules, booking
4. **Deals** - Daily curated premium cabin deals
5. **Price Calendar** - Month view with per-day pricing
6. **Price Alerts** - Manage fare drop notifications
7. **Saved** - Saved searches and favorited flights
8. **Settings** - Preferences, currency, notifications, data management
