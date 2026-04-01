import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PricePrediction, BuyRecommendation, PriceTrend } from '../services/pricePrediction';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/theme';

interface Props {
  prediction: PricePrediction;
  compact?: boolean;
}

const RECOMMENDATION_CONFIG: Record<BuyRecommendation, { icon: string; color: string; bg: string; label: string }> = {
  buy_now: { icon: 'flash', color: Colors.success, bg: Colors.successLight, label: 'Buy Now' },
  wait: { icon: 'time', color: Colors.warning, bg: Colors.warningLight, label: 'Wait' },
  neutral: { icon: 'remove-circle', color: Colors.info, bg: Colors.infoLight, label: 'Neutral' },
};

const TREND_CONFIG: Record<PriceTrend, { icon: string; color: string; label: string }> = {
  rising: { icon: 'trending-up', color: Colors.error, label: 'Rising' },
  falling: { icon: 'trending-down', color: Colors.success, label: 'Falling' },
  stable: { icon: 'remove', color: Colors.info, label: 'Stable' },
};

export const PredictionBadge: React.FC<Props> = ({ prediction, compact }) => {
  const rec = RECOMMENDATION_CONFIG[prediction.recommendation];
  const trend = TREND_CONFIG[prediction.trend];

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: rec.bg }]}>
        <Ionicons name={rec.icon as any} size={12} color={rec.color} />
        <Text style={[styles.compactText, { color: rec.color }]}>{rec.label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.mainBadge, { backgroundColor: rec.bg }]}>
        <Ionicons name={rec.icon as any} size={22} color={rec.color} />
        <View style={styles.mainContent}>
          <Text style={[styles.recommendation, { color: rec.color }]}>{rec.label}</Text>
          <Text style={styles.confidence}>{prediction.confidence}% confidence</Text>
        </View>
        <View style={[styles.trendBadge, { backgroundColor: trend.color + '15' }]}>
          <Ionicons name={trend.icon as any} size={14} color={trend.color} />
          <Text style={[styles.trendText, { color: trend.color }]}>{trend.label}</Text>
        </View>
      </View>

      <Text style={styles.reasoning}>{prediction.reasoning}</Text>

      {prediction.percentChange !== 0 && (
        <Text style={styles.forecast}>
          Forecast: prices may {prediction.percentChange > 0 ? 'increase' : 'decrease'} by{' '}
          {Math.abs(prediction.percentChange)}% over the next few days
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  mainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  mainContent: {
    flex: 1,
  },
  recommendation: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  confidence: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  trendText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
  reasoning: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  forecast: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    gap: 3,
  },
  compactText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
});
