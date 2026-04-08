import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DealOfDay } from '../types';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';
import { formatPrice, formatDate, getCabinClassLabel } from '../utils/helpers';

interface Props {
  deal: DealOfDay;
  onPress: () => void;
  compact?: boolean;
}

export const DealCard: React.FC<Props> = ({ deal, onPress, compact }) => {
  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.compactRoute}>
          <Text style={styles.compactCodes}>
            {deal.origin.code} → {deal.destination.code}
          </Text>
          <View style={[styles.badge, deal.cabinClass === 'first' ? styles.badgeFirst : styles.badgeBusiness]}>
            <Text style={[styles.badgeText, deal.cabinClass === 'first' ? styles.badgeTextFirst : styles.badgeTextBusiness]}>
              {deal.cabinClass === 'first' ? 'F' : 'J'}
            </Text>
          </View>
        </View>
        <Text style={styles.compactAirline}>{deal.airline.name}</Text>
        <View style={styles.compactPriceRow}>
          <Text style={styles.compactPrice}>{formatPrice(deal.price)}</Text>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{deal.discount}%</Text>
          </View>
        </View>
        <Text style={styles.compactDate}>{formatDate(deal.departureDate)}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.routeInfo}>
          <View style={styles.routeCodes}>
            <Text style={styles.code}>{deal.origin.code}</Text>
            <Ionicons name="airplane" size={16} color={Colors.primary} style={styles.planeIcon} />
            <Text style={styles.code}>{deal.destination.code}</Text>
          </View>
          <Text style={styles.cities}>
            {deal.origin.city} to {deal.destination.city}
          </Text>
        </View>
        <View style={styles.discountContainer}>
          <Text style={styles.discountLarge}>-{deal.discount}%</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Ionicons name="briefcase-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{deal.airline.name} · {getCabinClassLabel(deal.cabinClass)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {formatDate(deal.departureDate)}
            {deal.returnDate && ` - ${formatDate(deal.returnDate)}`}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.originalPrice}>{formatPrice(deal.originalPrice)}</Text>
          <Text style={styles.currentPrice}>{formatPrice(deal.price)}</Text>
        </View>
        <View style={styles.bookButton}>
          <Text style={styles.bookButtonText}>View Deal</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.textInverse} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  routeInfo: {},
  routeCodes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  code: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  planeIcon: {
    marginHorizontal: Spacing.sm,
    transform: [{ rotate: '45deg' }],
  },
  cities: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  discountContainer: {
    backgroundColor: Colors.dealBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  discountLarge: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.deal,
  },
  cardBody: {
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  originalPrice: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.deal,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  bookButtonText: {
    color: Colors.textInverse,
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.md,
  },
  // Compact styles
  compactCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: 160,
    marginRight: Spacing.md,
    ...Shadows.sm,
  },
  compactRoute: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  compactCodes: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBusiness: {
    backgroundColor: Colors.businessBg,
  },
  badgeFirst: {
    backgroundColor: Colors.firstBg,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
  badgeTextBusiness: {
    color: Colors.business,
  },
  badgeTextFirst: {
    color: Colors.first,
  },
  compactAirline: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  compactPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  compactPrice: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  discountBadge: {
    backgroundColor: Colors.dealBg,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.deal,
  },
  compactDate: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
