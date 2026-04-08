import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PricePrediction, BuyRecommendation, PriceTrend } from '../services/pricePrediction';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/theme';
import { formatPrice } from '../utils/helpers';

interface Props {
  prediction: PricePrediction;
  compact?: boolean;
}

const RECOMMENDATION_CONFIG: Record<BuyRecommendation, { icon: string; color: string; bg: string; label: string; emoji: string }> = {
  buy_now: { icon: 'flash', color: Colors.success, bg: Colors.successLight, label: 'Buy Now', emoji: 'Great price!' },
  wait: { icon: 'time', color: Colors.warning, bg: Colors.warningLight, label: 'Wait', emoji: 'Prices may drop' },
  neutral: { icon: 'remove-circle', color: Colors.info, bg: Colors.infoLight, label: 'Neutral', emoji: 'Fair price' },
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

  const savingsVsHigh = prediction.highestRecent - prediction.lowestRecent;
  const confidenceBarWidth = Math.max(10, Math.min(100, prediction.confidence));

  return (
    <View style={styles.container}>
      {/* Main Recommendation Card */}
      <View style={[styles.mainBadge, { backgroundColor: rec.bg, borderLeftWidth: 4, borderLeftColor: rec.color }]}>
        <View style={styles.recIconCircle}>
          <Ionicons name={rec.icon as any} size={24} color={rec.color} />
        </View>
        <View style={styles.mainContent}>
          <Text style={[styles.recommendation, { color: rec.color }]}>{rec.label}</Text>
          <Text style={styles.recSubtitle}>{rec.emoji}</Text>
        </View>
        <View style={[styles.trendBadge, { backgroundColor: trend.color + '15' }]}>
          <Ionicons name={trend.icon as any} size={14} color={trend.color} />
          <Text style={[styles.trendText, { color: trend.color }]}>{trend.label}</Text>
        </View>
      </View>

      {/* Confidence Meter */}
      <View style={styles.confidenceSection}>
        <View style={styles.confidenceHeader}>
          <Text style={styles.confidenceLabel}>Prediction Confidence</Text>
          <Text style={[styles.confidenceValue, { color: rec.color }]}>{prediction.confidence}%</Text>
        </View>
        <View style={styles.confidenceBarBg}>
          <View style={[styles.confidenceBarFill, { width: `${confidenceBarWidth}%`, backgroundColor: rec.color }]} />
        </View>
      </View>

      {/* Reasoning */}
      <Text style={styles.reasoning}>{prediction.reasoning}</Text>

      {/* Price Range Summary */}
      <View style={styles.priceRangeCard}>
        <View style={styles.priceRangeRow}>
          <View style={styles.priceRangeItem}>
            <Ionicons name="arrow-down-circle" size={16} color={Colors.success} />
            <Text style={styles.priceRangeLabel}>30-Day Low</Text>
            <Text style={[styles.priceRangeValue, { color: Colors.success }]}>{formatPrice(prediction.lowestRecent)}</Text>
          </View>
          <View style={styles.priceRangeDivider} />
          <View style={styles.priceRangeItem}>
            <Ionicons name="analytics" size={16} color={Colors.info} />
            <Text style={styles.priceRangeLabel}>Average</Text>
            <Text style={[styles.priceRangeValue, { color: Colors.info }]}>{formatPrice(prediction.historicalAverage)}</Text>
          </View>
          <View style={styles.priceRangeDivider} />
          <View style={styles.priceRangeItem}>
            <Ionicons name="arrow-up-circle" size={16} color={Colors.error} />
            <Text style={styles.priceRangeLabel}>30-Day High</Text>
            <Text style={[styles.priceRangeValue, { color: Colors.error }]}>{formatPrice(prediction.highestRecent)}</Text>
          </View>
        </View>
        {savingsVsHigh > 100 && (
          <View style={styles.savingsNote}>
            <Ionicons name="information-circle" size={14} color={Colors.primary} />
            <Text style={styles.savingsText}>
              Price range of {formatPrice(savingsVsHigh)} over the last 30 days
            </Text>
          </View>
        )}
      </View>

      {/* Forecast */}
      {prediction.percentChange !== 0 && (
        <View style={[styles.forecastCard, { backgroundColor: prediction.percentChange > 0 ? Colors.errorLight : Colors.successLight }]}>
          <Ionicons
            name={prediction.percentChange > 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={prediction.percentChange > 0 ? Colors.error : Colors.success}
          />
          <Text style={[styles.forecastText, { color: prediction.percentChange > 0 ? Colors.error : Colors.success }]}>
            Forecast: prices may {prediction.percentChange > 0 ? 'increase' : 'decrease'} by{' '}
            {Math.abs(prediction.percentChange)}% in the next 3 days
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  mainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  recIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
  },
  recommendation: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  recSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 1,
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
  confidenceSection: {
    gap: Spacing.xs,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  confidenceValue: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  confidenceBarBg: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: 6,
    borderRadius: 3,
  },
  reasoning: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  priceRangeCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  priceRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  priceRangeItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  priceRangeLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
  priceRangeValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  priceRangeDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  savingsNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  savingsText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    flex: 1,
  },
  forecastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  forecastText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    flex: 1,
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
