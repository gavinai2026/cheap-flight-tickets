import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MilesEstimate as MilesEstimateType } from '../services/milesCalculator';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/theme';

interface Props {
  estimate: MilesEstimateType;
  compact?: boolean;
}

export const MilesEstimateView: React.FC<Props> = ({ estimate, compact }) => {
  if (compact) {
    return (
      <View style={styles.compactBadge}>
        <Ionicons name="star" size={10} color={Colors.premium} />
        <Text style={styles.compactText}>
          {estimate.totalMiles.toLocaleString()} mi
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="star" size={18} color={Colors.premium} />
        <Text style={styles.title}>Miles Earned</Text>
        <Text style={styles.program}>{estimate.loyaltyProgram}</Text>
      </View>

      <View style={styles.milesGrid}>
        <View style={styles.milesItem}>
          <Text style={styles.milesValue}>{estimate.baseMiles.toLocaleString()}</Text>
          <Text style={styles.milesLabel}>Base Miles</Text>
        </View>
        <View style={styles.milesPlus}>
          <Text style={styles.plusText}>+</Text>
        </View>
        <View style={styles.milesItem}>
          <Text style={[styles.milesValue, { color: Colors.premium }]}>
            {estimate.cabinBonusMiles.toLocaleString()}
          </Text>
          <Text style={styles.milesLabel}>Cabin Bonus</Text>
        </View>
        <View style={styles.milesPlus}>
          <Text style={styles.plusText}>=</Text>
        </View>
        <View style={styles.milesItem}>
          <Text style={[styles.milesValue, styles.totalMiles]}>
            {estimate.totalMiles.toLocaleString()}
          </Text>
          <Text style={styles.milesLabel}>Total Miles</Text>
        </View>
      </View>

      <View style={styles.extraInfo}>
        <View style={styles.extraItem}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.accent} />
          <Text style={styles.extraText}>
            {estimate.eliteQualifyingMiles.toLocaleString()} Elite Qualifying Miles
          </Text>
        </View>
        <View style={styles.extraItem}>
          <Ionicons name="cash-outline" size={14} color={Colors.success} />
          <Text style={styles.extraText}>
            Estimated value: ${estimate.estimatedValue.toFixed(0)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    flex: 1,
  },
  program: {
    fontSize: FontSizes.xs,
    color: Colors.premium,
    fontWeight: FontWeights.semibold,
  },
  milesGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  milesItem: {
    alignItems: 'center',
    flex: 1,
  },
  milesPlus: {
    width: 20,
    alignItems: 'center',
  },
  plusText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textTertiary,
  },
  milesValue: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  totalMiles: {
    fontSize: FontSizes.xl,
    color: Colors.primary,
  },
  milesLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  extraInfo: {
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  extraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  extraText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.premiumBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 3,
  },
  compactText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.premium,
  },
});
