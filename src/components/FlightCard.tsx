import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Flight } from '../types';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';
import { formatPrice, formatDuration, formatTime, getStopsLabel, getDiscountPercent } from '../utils/helpers';

interface Props {
  flight: Flight;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export const FlightCard: React.FC<Props> = ({ flight, onPress, onFavorite, isFavorite }) => {
  const segment = flight.segments[0];
  const lastSegment = flight.segments[flight.segments.length - 1];
  const hasDiscount = flight.price < flight.originalPrice;
  const discount = hasDiscount ? getDiscountPercent(flight.originalPrice, flight.price) : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {hasDiscount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}% OFF</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.airlineInfo}>
          <View style={styles.airlineLogo}>
            <Text style={styles.airlineCode}>{segment.airline.code}</Text>
          </View>
          <View>
            <Text style={styles.airlineName}>{segment.airline.name}</Text>
            <Text style={styles.flightNumber}>{segment.flightNumber}</Text>
          </View>
        </View>
        {onFavorite && (
          <TouchableOpacity onPress={onFavorite} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? Colors.error : Colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.timeBlock}>
          <Text style={styles.time}>{formatTime(segment.departureTime)}</Text>
          <Text style={styles.airportCode}>{segment.departureAirport.code}</Text>
        </View>

        <View style={styles.routeLine}>
          <View style={styles.lineContainer}>
            <View style={styles.dot} />
            <View style={styles.line} />
            {flight.stops > 0 && (
              <View style={styles.stopIndicator}>
                <Text style={styles.stopCount}>{flight.stops}</Text>
              </View>
            )}
            <View style={styles.line} />
            <View style={[styles.dot, styles.dotFilled]} />
          </View>
          <Text style={styles.duration}>{formatDuration(flight.totalDuration)}</Text>
          <Text style={styles.stops}>{getStopsLabel(flight.stops)}</Text>
        </View>

        <View style={[styles.timeBlock, styles.timeBlockRight]}>
          <Text style={styles.time}>{formatTime(lastSegment.arrivalTime)}</Text>
          <Text style={styles.airportCode}>{lastSegment.arrivalAirport.code}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.tags}>
          <View style={[styles.tag, flight.cabinClass === 'first' ? styles.tagFirst : styles.tagBusiness]}>
            <Text style={[styles.tagText, flight.cabinClass === 'first' ? styles.tagTextFirst : styles.tagTextBusiness]}>
              {flight.cabinClass === 'first' ? 'First' : 'Business'}
            </Text>
          </View>
          {flight.refundable && (
            <View style={[styles.tag, styles.tagRefund]}>
              <Text style={[styles.tagText, styles.tagTextRefund]}>Refundable</Text>
            </View>
          )}
          {flight.seatsRemaining <= 4 && (
            <View style={[styles.tag, styles.tagUrgent]}>
              <Text style={[styles.tagText, styles.tagTextUrgent]}>
                {flight.seatsRemaining} left
              </Text>
            </View>
          )}
        </View>

        <View style={styles.priceBlock}>
          {hasDiscount && (
            <Text style={styles.originalPrice}>{formatPrice(flight.originalPrice)}</Text>
          )}
          <Text style={styles.price}>{formatPrice(flight.price)}</Text>
          <Text style={styles.perPerson}>per person</Text>
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
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.deal,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomLeftRadius: BorderRadius.md,
  },
  discountText: {
    color: Colors.textInverse,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  airlineLogo: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  airlineCode: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  airlineName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  flightNumber: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  timeBlock: {
    alignItems: 'flex-start',
  },
  timeBlockRight: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  airportCode: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
    marginTop: 2,
  },
  routeLine: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  dotFilled: {
    backgroundColor: Colors.primary,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.primary + '40',
  },
  stopIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  stopCount: {
    fontSize: 10,
    fontWeight: FontWeights.bold,
    color: Colors.textInverse,
  },
  duration: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  stops: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  tagBusiness: {
    backgroundColor: Colors.businessBg,
  },
  tagFirst: {
    backgroundColor: Colors.firstBg,
  },
  tagRefund: {
    backgroundColor: Colors.successLight,
  },
  tagUrgent: {
    backgroundColor: Colors.errorLight,
  },
  tagText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  tagTextBusiness: {
    color: Colors.business,
  },
  tagTextFirst: {
    color: Colors.first,
  },
  tagTextRefund: {
    color: Colors.success,
  },
  tagTextUrgent: {
    color: Colors.error,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  perPerson: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
});
