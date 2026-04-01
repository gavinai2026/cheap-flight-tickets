// API Key Management
// In production, these should come from environment variables or a secure config service.
// For development, replace with your own API keys.

export const API_KEYS = {
  // Amadeus Self-Service API (free tier: 500 calls/month)
  // Sign up: https://developers.amadeus.com
  AMADEUS_CLIENT_ID: process.env.AMADEUS_CLIENT_ID || 'YOUR_AMADEUS_CLIENT_ID',
  AMADEUS_CLIENT_SECRET: process.env.AMADEUS_CLIENT_SECRET || 'YOUR_AMADEUS_CLIENT_SECRET',

  // Skyscanner via RapidAPI
  // Sign up: https://rapidapi.com/skyscanner/api/skyscanner-flights
  SKYSCANNER_RAPIDAPI_KEY: process.env.SKYSCANNER_RAPIDAPI_KEY || 'YOUR_RAPIDAPI_KEY',

  // AviationStack (free tier: 100 calls/month)
  // Sign up: https://aviationstack.com
  AVIATIONSTACK_KEY: process.env.AVIATIONSTACK_KEY || 'YOUR_AVIATIONSTACK_KEY',

  // ExchangeRate-API (free tier: 1500 calls/month)
  // Sign up: https://www.exchangerate-api.com
  EXCHANGE_RATE_KEY: process.env.EXCHANGE_RATE_KEY || 'YOUR_EXCHANGE_RATE_KEY',

  // Sentry DSN for crash reporting
  SENTRY_DSN: process.env.SENTRY_DSN || '',
};

export const API_URLS = {
  AMADEUS_AUTH: 'https://api.amadeus.com/v1/security/oauth2/token',
  AMADEUS_BASE: 'https://api.amadeus.com',
  SKYSCANNER_BASE: 'https://skyscanner-api.p.rapidapi.com',
  AVIATIONSTACK_BASE: 'https://api.aviationstack.com/v1',
  EXCHANGE_RATE_BASE: 'https://v6.exchangerate-api.com/v6',
};

export const isApiKeyConfigured = (key: string): boolean => {
  return key !== '' && !key.startsWith('YOUR_');
};
