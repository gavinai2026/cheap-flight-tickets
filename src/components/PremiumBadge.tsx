import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '../constants/theme';

interface Props {
  size?: 'small' | 'medium';
  onPress?: () => void;
}

export const PremiumBadge: React.FC<Props> = ({ size = 'small', onPress }) => {
  const isSmall = size === 'small';
  const badge = (
    <View style={[styles.badge, isSmall ? styles.badgeSmall : styles.badgeMedium]}>
      <Ionicons name="diamond" size={isSmall ? 8 : 12} color="#FFF" />
      <Text style={[styles.badgeText, isSmall ? styles.textSmall : styles.textMedium]}>PRO</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {badge}
      </TouchableOpacity>
    );
  }

  return badge;
};

export const PremiumLock: React.FC<{ onPress?: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.lockBadge} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name="lock-closed" size={10} color={Colors.premium} />
    <Text style={styles.lockText}>PRO</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.premium,
    gap: 3,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeMedium: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  badgeText: {
    fontWeight: FontWeights.bold,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 8,
  },
  textMedium: {
    fontSize: FontSizes.xs,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.premiumBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 3,
  },
  lockText: {
    fontSize: 8,
    fontWeight: FontWeights.bold,
    color: Colors.premium,
    letterSpacing: 0.5,
  },
});
