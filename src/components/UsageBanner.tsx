import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../context/SubscriptionContext';
import { FREE_LIMITS } from '../types/subscription';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/theme';

export const UsageBanner: React.FC = () => {
  const { isPremium, getRemainingSearches } = useSubscription();
  const navigation = useNavigation<any>();

  if (isPremium) return null;

  const remaining = getRemainingSearches();
  const used = FREE_LIMITS.maxSearchesPerDay - remaining;
  const progress = used / FREE_LIMITS.maxSearchesPerDay;
  const isLow = remaining <= 2;

  return (
    <View style={[styles.container, isLow && styles.containerWarning]}>
      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <Ionicons
            name={isLow ? 'warning' : 'search'}
            size={14}
            color={isLow ? Colors.warning : Colors.textSecondary}
          />
          <Text style={[styles.label, isLow && styles.labelWarning]}>
            {remaining === 0
              ? 'Daily search limit reached'
              : `${remaining} of ${FREE_LIMITS.maxSearchesPerDay} free searches remaining`}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Paywall')}>
          <Text style={styles.upgradeLink}>Go Premium</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }, isLow && styles.progressFillWarning]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  containerWarning: {
    borderColor: Colors.warning + '40',
    backgroundColor: Colors.warningLight + '30',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  labelWarning: {
    color: Colors.warning,
    fontWeight: FontWeights.semibold,
  },
  upgradeLink: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.premium,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressFillWarning: {
    backgroundColor: Colors.warning,
  },
});
