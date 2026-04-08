import { PricePoint } from '../types';
import { createLogger } from './logger';

const log = createLogger('PricePrediction');

export type PriceTrend = 'rising' | 'falling' | 'stable';
export type BuyRecommendation = 'buy_now' | 'wait' | 'neutral';

export interface PricePrediction {
  trend: PriceTrend;
  recommendation: BuyRecommendation;
  confidence: number; // 0-100
  predictedPrice: number;
  percentChange: number;
  reasoning: string;
  historicalAverage: number;
  lowestRecent: number;
  highestRecent: number;
}

// Simple linear regression
const linearRegression = (points: { x: number; y: number }[]): { slope: number; intercept: number; r2: number } => {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y || 0, r2: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
  for (const { x, y } of points) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
    sumYY += y * y;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const yMean = sumY / n;
  let ssRes = 0, ssTot = 0;
  for (const { x, y } of points) {
    const predicted = slope * x + intercept;
    ssRes += (y - predicted) ** 2;
    ssTot += (y - yMean) ** 2;
  }
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
};

// Moving average
const movingAverage = (values: number[], window: number): number[] => {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = values.slice(start, i + 1);
    result.push(subset.reduce((a, b) => a + b, 0) / subset.length);
  }
  return result;
};

export const predictPrice = (priceHistory: PricePoint[], currentPrice: number): PricePrediction => {
  if (priceHistory.length < 3) {
    return {
      trend: 'stable',
      recommendation: 'neutral',
      confidence: 20,
      predictedPrice: currentPrice,
      percentChange: 0,
      reasoning: 'Not enough price history data for accurate prediction.',
      historicalAverage: currentPrice,
      lowestRecent: currentPrice,
      highestRecent: currentPrice,
    };
  }

  const prices = priceHistory.map((p) => p.price);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const lowestRecent = Math.min(...prices);
  const highestRecent = Math.max(...prices);

  // Linear regression on price history
  const regressionPoints = priceHistory.map((p, i) => ({ x: i, y: p.price }));
  const { slope, r2 } = linearRegression(regressionPoints);

  // Moving average trend (last 7 vs first 7)
  const ma = movingAverage(prices, 3);
  const recentMA = ma.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const earlierMA = ma.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const maTrend = (recentMA - earlierMA) / earlierMA;

  // Determine trend
  const slopePercent = (slope / avg) * 100;
  let trend: PriceTrend;
  if (slopePercent > 1) trend = 'rising';
  else if (slopePercent < -1) trend = 'falling';
  else trend = 'stable';

  // Determine confidence (0-100)
  const confidence = Math.min(100, Math.round(Math.abs(r2) * 70 + Math.min(priceHistory.length, 30)));

  // Predict next price
  const predictedPrice = Math.round(
    slope * (priceHistory.length + 3) + (avg - slope * (priceHistory.length / 2))
  );

  const percentChange = ((predictedPrice - currentPrice) / currentPrice) * 100;

  // Recommendation
  let recommendation: BuyRecommendation;
  let reasoning: string;

  const isNearLow = currentPrice <= lowestRecent * 1.05;
  const isNearHigh = currentPrice >= highestRecent * 0.95;

  if (trend === 'rising' && isNearLow) {
    recommendation = 'buy_now';
    reasoning = 'Prices are trending upward and currently near the lowest point. Buy now before they rise further.';
  } else if (trend === 'falling' && !isNearLow) {
    recommendation = 'wait';
    reasoning = 'Prices are trending downward. Consider waiting a few days for a potential better deal.';
  } else if (isNearLow && trend !== 'rising') {
    recommendation = 'buy_now';
    reasoning = 'Price is near the historical low for this route. This is a great time to book.';
  } else if (isNearHigh) {
    recommendation = 'wait';
    reasoning = 'Price is near the historical high. Prices may drop if you can wait.';
  } else if (trend === 'stable') {
    recommendation = 'neutral';
    reasoning = 'Prices have been stable. No strong indication to wait or buy immediately.';
  } else {
    recommendation = 'neutral';
    reasoning = 'Mixed price signals. Consider your travel flexibility when deciding.';
  }

  return {
    trend,
    recommendation,
    confidence,
    predictedPrice: Math.max(0, predictedPrice),
    percentChange: Math.round(percentChange * 10) / 10,
    reasoning,
    historicalAverage: Math.round(avg),
    lowestRecent,
    highestRecent,
  };
};

// Generate synthetic price history for demo purposes
export const generatePriceHistory = (
  basePrice: number,
  days: number = 30
): PricePoint[] => {
  const history: PricePoint[] = [];
  const now = new Date();
  let price = basePrice * (0.9 + Math.random() * 0.3);

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Random walk with mean reversion
    const change = (Math.random() - 0.48) * basePrice * 0.05;
    const meanReversion = (basePrice - price) * 0.02;
    price = Math.max(basePrice * 0.6, price + change + meanReversion);

    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price),
    });
  }

  return history;
};
