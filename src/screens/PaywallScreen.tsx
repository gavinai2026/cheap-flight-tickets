import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../context/SubscriptionContext';
import { PLANS, PREMIUM_FEATURES, SubscriptionPlan } from '../types/subscription';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';

export const PaywallScreen = ({ navigation }: any) => {
  const { subscribe, restorePurchase, toggleDevPremium, isPremium } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(PLANS[1]); // yearly default

  const handleSubscribe = () => {
    subscribe(selectedPlan);
    Alert.alert(
      'Welcome to Premium!',
      `You now have full access to all PremiumFlights features.${__DEV__ ? ' (Dev mode — no real charge)' : ''}`,
      [{ text: 'Start Exploring', onPress: () => navigation.goBack() }]
    );
  };

  const handleRestore = () => {
    restorePurchase();
    Alert.alert('Restore Purchase', 'No previous purchases found. Subscribe to get Premium access.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.textInverse} />
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <View style={styles.diamondCircle}>
            <Ionicons name="diamond" size={36} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>PremiumFlights Pro</Text>
          <Text style={styles.heroSubtitle}>
            Unlock the full power of premium flight search
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Feature Comparison */}
        <View style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>What you get with Pro</Text>

          {PREMIUM_FEATURES.map((feature) => {
            const freeVal = feature.freeValue;
            const proVal = feature.premiumValue;
            return (
              <View key={feature.key} style={styles.featureRow}>
                <View style={styles.featureInfo}>
                  <Ionicons
                    name={proVal === true ? 'checkmark-circle' : 'trending-up'}
                    size={18}
                    color={Colors.premium}
                  />
                  <Text style={styles.featureLabel}>{feature.label}</Text>
                </View>
                <View style={styles.featureTiers}>
                  <View style={styles.tierValue}>
                    {freeVal === false ? (
                      <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
                    ) : (
                      <Text style={styles.freeValue}>{String(freeVal)}</Text>
                    )}
                  </View>
                  <View style={styles.tierValue}>
                    {proVal === true ? (
                      <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    ) : (
                      <Text style={styles.proValue}>{String(proVal)}</Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          {/* Column headers */}
          <View style={styles.tierHeaders}>
            <View style={{ flex: 1 }} />
            <View style={styles.featureTiers}>
              <Text style={styles.tierHeader}>Free</Text>
              <Text style={[styles.tierHeader, styles.tierHeaderPro]}>Pro</Text>
            </View>
          </View>
        </View>

        {/* Plan Selection */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choose your plan</Text>

          {PLANS.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;
            const isYearly = plan.interval === 'yearly';
            return (
              <TouchableOpacity
                key={plan.id}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
                onPress={() => setSelectedPlan(plan)}
                activeOpacity={0.7}
              >
                {isYearly && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>{plan.savings}</Text>
                  </View>
                )}

                <View style={styles.planRadio}>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>

                <View style={styles.planInfo}>
                  <Text style={[styles.planName, isSelected && styles.planNameSelected]}>
                    {plan.interval === 'yearly' ? 'Annual' : 'Monthly'}
                  </Text>
                  <Text style={styles.planDetail}>
                    {plan.interval === 'yearly'
                      ? `$${(plan.price / 12).toFixed(2)}/month`
                      : 'Billed monthly'}
                  </Text>
                </View>

                <View style={styles.planPricing}>
                  <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                    ${plan.price.toFixed(2)}
                  </Text>
                  <Text style={styles.planInterval}>
                    /{plan.interval === 'yearly' ? 'year' : 'month'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton} onPress={handleSubscribe} activeOpacity={0.8}>
          <Ionicons name="diamond" size={18} color="#FFF" />
          <Text style={styles.ctaText}>Start 7-Day Free Trial</Text>
        </TouchableOpacity>

        <Text style={styles.ctaNote}>
          {selectedPlan.trialDays}-day free trial, then ${selectedPlan.price.toFixed(2)}/{selectedPlan.interval === 'yearly' ? 'year' : 'month'}. Cancel anytime.
        </Text>

        {/* Secondary Actions */}
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.goBack()}>
          <Text style={styles.skipText}>Continue with Free</Text>
        </TouchableOpacity>

        {/* Dev Toggle */}
        {__DEV__ && (
          <TouchableOpacity style={styles.devButton} onPress={() => {
            toggleDevPremium();
            navigation.goBack();
          }}>
            <Ionicons name="code-slash" size={14} color={Colors.warning} />
            <Text style={styles.devText}>
              Dev: {isPremium ? 'Switch to Free' : 'Toggle Premium On'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.premium,
    paddingTop: 50,
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: { alignItems: 'center', marginTop: Spacing.md },
  diamondCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: { fontSize: FontSizes.xxxl, fontWeight: FontWeights.bold, color: '#FFF' },
  heroSubtitle: { fontSize: FontSizes.md, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },
  content: { padding: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
  featuresCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.xl, ...Shadows.md },
  tierHeaders: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: Spacing.sm, marginBottom: Spacing.sm },
  tierHeader: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: Colors.textTertiary, width: 55, textAlign: 'center' },
  tierHeaderPro: { color: Colors.premium },
  featureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  featureInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  featureLabel: { fontSize: FontSizes.sm, color: Colors.text, flex: 1 },
  featureTiers: { flexDirection: 'row', gap: Spacing.md },
  tierValue: { width: 55, alignItems: 'center' },
  freeValue: { fontSize: FontSizes.xs, color: Colors.textTertiary, fontWeight: FontWeights.medium },
  proValue: { fontSize: FontSizes.xs, color: Colors.success, fontWeight: FontWeights.bold },
  plansSection: { marginBottom: Spacing.xl },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  planCardSelected: { borderColor: Colors.premium, backgroundColor: Colors.premiumBg + '30' },
  savingsBadge: { position: 'absolute', top: -10, right: Spacing.md, backgroundColor: Colors.deal, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  savingsText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: '#FFF' },
  planRadio: { marginRight: Spacing.md },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioOuterSelected: { borderColor: Colors.premium },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.premium },
  planInfo: { flex: 1 },
  planName: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text },
  planNameSelected: { color: Colors.premium },
  planDetail: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  planPricing: { alignItems: 'flex-end' },
  planPrice: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text },
  planPriceSelected: { color: Colors.premium },
  planInterval: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.premium,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  ctaText: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: '#FFF' },
  ctaNote: { fontSize: FontSizes.xs, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.sm },
  restoreButton: { alignItems: 'center', paddingVertical: Spacing.lg },
  restoreText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold },
  skipButton: { alignItems: 'center', paddingVertical: Spacing.sm },
  skipText: { fontSize: FontSizes.sm, color: Colors.textTertiary },
  devButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md, marginTop: Spacing.md, backgroundColor: Colors.warningLight, borderRadius: BorderRadius.md, gap: Spacing.xs },
  devText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.warning },
});
