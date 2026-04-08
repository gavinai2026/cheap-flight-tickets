import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../context/SubscriptionContext';
import { PremiumFeatureKey } from '../types/subscription';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/theme';

interface Props {
  feature: PremiumFeatureKey;
  children: React.ReactNode;
  fallbackTitle?: string;
}

export const PremiumGate: React.FC<Props> = ({ feature, children, fallbackTitle }) => {
  const { canUsePremiumFeature } = useSubscription();
  const navigation = useNavigation<any>();

  if (canUsePremiumFeature(feature)) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.blurOverlay}>
        <View style={styles.lockContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="diamond" size={24} color={Colors.premium} />
          </View>
          <Text style={styles.title}>
            {fallbackTitle || 'Premium Feature'}
          </Text>
          <Text style={styles.subtitle}>
            Upgrade to Premium to unlock this feature
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('Paywall')}
            activeOpacity={0.8}
          >
            <Ionicons name="diamond" size={14} color="#FFF" />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  blurOverlay: {
    backgroundColor: Colors.premiumBg,
    borderWidth: 1,
    borderColor: Colors.premium + '30',
    borderRadius: BorderRadius.xl,
  },
  lockContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.premium + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.premium,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  upgradeButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: '#FFF',
  },
});
