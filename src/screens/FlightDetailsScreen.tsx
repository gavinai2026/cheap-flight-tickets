import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Flight } from '../types';
import { useApp } from '../context/AppContext';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';
import {
  formatPrice,
  formatDuration,
  formatTime,
  formatDate,
  getStopsLabel,
  getDiscountPercent,
  getCabinClassLabel,
} from '../utils/helpers';

export const FlightDetailsScreen = ({ navigation, route }: any) => {
  const flight: Flight = route.params.flight;
  const { toggleFavorite, isFavorite, addPriceAlert, addSavedSearch } = useApp();
  const hasDiscount = flight.price < flight.originalPrice;

  const handleSetAlert = () => {
    Alert.alert(
      'Price Alert Set',
      `We'll notify you when ${flight.segments[0].departureAirport.code} to ${flight.segments[flight.segments.length - 1].arrivalAirport.code} ${getCabinClassLabel(flight.cabinClass)} drops below ${formatPrice(flight.price)}.`,
      [{ text: 'OK' }]
    );
    addPriceAlert(flight.price);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flight Details</Text>
        <TouchableOpacity onPress={() => toggleFavorite(flight.id)}>
          <Ionicons
            name={isFavorite(flight.id) ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite(flight.id) ? Colors.error : Colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Price Card */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <View>
              <View style={[styles.cabinBadge, flight.cabinClass === 'first' ? styles.firstBadge : styles.businessBadge]}>
                <Text style={[styles.cabinBadgeText, flight.cabinClass === 'first' ? styles.firstBadgeText : styles.businessBadgeText]}>
                  {getCabinClassLabel(flight.cabinClass)}
                </Text>
              </View>
              {hasDiscount && (
                <Text style={styles.originalPrice}>{formatPrice(flight.originalPrice)}</Text>
              )}
              <Text style={styles.price}>{formatPrice(flight.price)}</Text>
              <Text style={styles.perPerson}>per person, all taxes included</Text>
            </View>
            {hasDiscount && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>
                  Save {getDiscountPercent(flight.originalPrice, flight.price)}%
                </Text>
                <Text style={styles.saveAmount}>
                  {formatPrice(flight.originalPrice - flight.price)}
                </Text>
              </View>
            )}
          </View>

          {flight.seatsRemaining <= 4 && (
            <View style={styles.urgencyBar}>
              <Ionicons name="flame" size={14} color={Colors.error} />
              <Text style={styles.urgencyText}>
                Only {flight.seatsRemaining} seat{flight.seatsRemaining > 1 ? 's' : ''} left at this price!
              </Text>
            </View>
          )}
        </View>

        {/* Flight Segments */}
        <View style={styles.segmentsCard}>
          <Text style={styles.cardTitle}>Flight Itinerary</Text>

          {flight.segments.map((segment, index) => (
            <View key={segment.id}>
              {index > 0 && flight.layoverInfo && flight.layoverInfo[index - 1] && (
                <View style={styles.layoverBar}>
                  <Ionicons name="time-outline" size={14} color={Colors.warning} />
                  <Text style={styles.layoverText}>
                    {formatDuration(flight.layoverInfo[index - 1].duration)} layover at{' '}
                    {flight.layoverInfo[index - 1].airport.city} ({flight.layoverInfo[index - 1].airport.code})
                    {flight.layoverInfo[index - 1].terminalChange && ' · Terminal change'}
                  </Text>
                </View>
              )}

              <View style={styles.segment}>
                <View style={styles.segmentHeader}>
                  <View style={styles.airlineLogo}>
                    <Text style={styles.airlineCode}>{segment.airline.code}</Text>
                  </View>
                  <View style={styles.segmentAirlineInfo}>
                    <Text style={styles.airlineName}>{segment.airline.name}</Text>
                    <Text style={styles.flightMeta}>
                      {segment.flightNumber} · {segment.aircraft}
                    </Text>
                  </View>
                </View>

                <View style={styles.segmentRoute}>
                  <View style={styles.segmentPoint}>
                    <View style={styles.segmentDot} />
                    <View style={styles.segmentTimeInfo}>
                      <Text style={styles.segmentTime}>{formatTime(segment.departureTime)}</Text>
                      <Text style={styles.segmentDate}>{formatDate(segment.departureTime)}</Text>
                      <Text style={styles.segmentAirport}>
                        {segment.departureAirport.code} - {segment.departureAirport.name}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.segmentDuration}>
                    <View style={styles.segmentLine} />
                    <Text style={styles.durationLabel}>{formatDuration(segment.duration)}</Text>
                  </View>

                  <View style={styles.segmentPoint}>
                    <View style={[styles.segmentDot, styles.segmentDotFilled]} />
                    <View style={styles.segmentTimeInfo}>
                      <Text style={styles.segmentTime}>{formatTime(segment.arrivalTime)}</Text>
                      <Text style={styles.segmentDate}>{formatDate(segment.arrivalTime)}</Text>
                      <Text style={styles.segmentAirport}>
                        {segment.arrivalAirport.code} - {segment.arrivalAirport.name}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Amenities */}
        <View style={styles.amenitiesCard}>
          <Text style={styles.cardTitle}>
            {getCabinClassLabel(flight.cabinClass)} Amenities
          </Text>
          <View style={styles.amenitiesGrid}>
            {flight.segments[0].amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Fare Details */}
        <View style={styles.fareCard}>
          <Text style={styles.cardTitle}>Fare Details</Text>

          <View style={styles.fareRow}>
            <View style={styles.fareItem}>
              <Ionicons name="bag-handle-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.fareLabel}>Baggage</Text>
              <Text style={styles.fareValue}>{flight.baggageAllowance}</Text>
            </View>
            <View style={styles.fareItem}>
              <Ionicons
                name={flight.refundable ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={flight.refundable ? Colors.success : Colors.error}
              />
              <Text style={styles.fareLabel}>Refundable</Text>
              <Text style={styles.fareValue}>{flight.refundable ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.fareItem}>
              <Ionicons name="swap-horizontal" size={18} color={Colors.textSecondary} />
              <Text style={styles.fareLabel}>Changeable</Text>
              <Text style={styles.fareValue}>{flight.changeable ? 'Yes' : 'No'}</Text>
            </View>
          </View>

          <View style={styles.fareRules}>
            {flight.fareRules.map((rule, index) => (
              <View key={index} style={styles.fareRuleItem}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.primary} />
                <Text style={styles.fareRuleText}>{rule}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Trip Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Route</Text>
            <Text style={styles.summaryValue}>
              {flight.segments[0].departureAirport.code} → {flight.segments[flight.segments.length - 1].arrivalAirport.code}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Duration</Text>
            <Text style={styles.summaryValue}>{formatDuration(flight.totalDuration)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Stops</Text>
            <Text style={styles.summaryValue}>{getStopsLabel(flight.stops)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cabin</Text>
            <Text style={styles.summaryValue}>{getCabinClassLabel(flight.cabinClass)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Lounge Access</Text>
            <Text style={styles.summaryValue}>{flight.loungAccess ? 'Included' : 'Not Included'}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.alertButton} onPress={handleSetAlert}>
          <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
          <Text style={styles.alertButtonText}>Price Alert</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>
            Book for {formatPrice(flight.price)}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {},
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  content: {
    padding: Spacing.lg,
  },
  priceCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cabinBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    alignSelf: 'flex-start',
  },
  businessBadge: {
    backgroundColor: Colors.businessBg,
  },
  firstBadge: {
    backgroundColor: Colors.firstBg,
  },
  cabinBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  businessBadgeText: {
    color: Colors.business,
  },
  firstBadgeText: {
    color: Colors.first,
  },
  originalPrice: {
    fontSize: FontSizes.md,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  perPerson: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  saveBadge: {
    backgroundColor: Colors.dealBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  saveText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.deal,
  },
  saveAmount: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.deal,
  },
  urgencyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  urgencyText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.error,
  },
  segmentsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  layoverBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  layoverText: {
    fontSize: FontSizes.sm,
    color: Colors.warning,
    fontWeight: FontWeights.medium,
    flex: 1,
  },
  segment: {
    marginBottom: Spacing.md,
  },
  segmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  airlineLogo: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  airlineCode: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  segmentAirlineInfo: {},
  airlineName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  flightMeta: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  segmentRoute: {
    paddingLeft: Spacing.sm,
  },
  segmentPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  segmentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    marginTop: 4,
  },
  segmentDotFilled: {
    backgroundColor: Colors.primary,
  },
  segmentTimeInfo: {},
  segmentTime: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  segmentDate: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  segmentAirport: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  segmentDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    marginVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  segmentLine: {
    width: 2,
    height: 30,
    backgroundColor: Colors.primary + '30',
  },
  durationLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  amenitiesCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  amenitiesGrid: {
    gap: Spacing.sm,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  amenityText: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  fareCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  fareItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  fareLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  fareValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  fareRules: {
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  fareRuleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fareRuleText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  summaryLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: Spacing.lg,
    paddingBottom: 30,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
    ...Shadows.lg,
  },
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    gap: Spacing.xs,
  },
  alertButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  bookButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textInverse,
  },
});
