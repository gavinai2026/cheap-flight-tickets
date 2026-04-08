import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';
import { lookupFlightByNumber, getFlightSuggestions, FlightLookupResult } from '../services/flightLookup';
import { exportFlightToCalendar } from '../services/icalExport';
import { formatTime, formatDuration, formatPrice, formatDate } from '../utils/helpers';
import { Flight } from '../types';

const buildFlightFromResult = (result: FlightLookupResult): Flight => ({
  id: result.flightNumber,
  segments: [
    {
      id: `${result.flightNumber}-seg1`,
      airline: result.airline,
      flightNumber: result.flightNumber,
      aircraft: result.aircraft,
      departureAirport: result.departureAirport,
      arrivalAirport: result.arrivalAirport,
      departureTime: result.departureTime,
      arrivalTime: result.arrivalTime,
      duration: result.duration,
      cabinClass: 'business' as const,
      amenities: ['Lie-flat seat', 'Wi-Fi', 'Premium dining', 'Amenity kit'],
    },
  ],
  totalDuration: result.duration,
  stops: 0,
  price: result.estimatedPrice,
  originalPrice: result.estimatedPrice,
  currency: result.currency,
  cabinClass: 'business' as const,
  seatsRemaining: 5,
  bookingUrl: '',
  fareRules: ['Changeable with fee', 'Refundable within 24 hours'],
  baggageAllowance: '2 x 32kg',
  refundable: true,
  changeable: true,
  loungAccess: true,
});

const POPULAR_FLIGHTS = ['EK201', 'SQ25', 'BA117', 'QR701', 'CX840', 'NH110'];

export const FlightLookupScreen = ({ navigation }: { navigation: any }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FlightLookupResult | null>(null);
  const [error, setError] = useState('');
  const [errorAirlineCode, setErrorAirlineCode] = useState<string | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSearch = useCallback(async (flightNumber: string) => {
    const trimmed = flightNumber.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setErrorAirlineCode(undefined);
    setResult(null);
    setSuggestions([]);

    const response = await lookupFlightByNumber(trimmed);

    if (response.result) {
      setResult(response.result);
    } else {
      setError(response.error ?? 'An unknown error occurred.');
      setErrorAirlineCode(response.airline?.code);
    }
    setLoading(false);
  }, []);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    if (text.trim().length > 0) {
      setSuggestions(getFlightSuggestions(text));
    } else {
      setSuggestions([]);
    }
  }, []);

  const handleSuggestionPress = useCallback((flightNumber: string) => {
    setQuery(flightNumber);
    setSuggestions([]);
    handleSearch(flightNumber);
  }, [handleSearch]);

  const handleChipPress = useCallback((flightNumber: string) => {
    setQuery(flightNumber);
    setSuggestions([]);
    handleSearch(flightNumber);
  }, [handleSearch]);

  const handleViewDetails = useCallback(() => {
    if (!result) return;
    const flight = buildFlightFromResult(result);
    navigation.navigate('FlightDetails', { flight });
  }, [result, navigation]);

  const handleAddToCalendar = useCallback(() => {
    if (!result) return;
    const flight = buildFlightFromResult(result);
    exportFlightToCalendar(flight);
  }, [result]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flight Lookup</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Input */}
        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <View style={styles.inputContainer}>
              <Ionicons name="airplane" size={18} color={Colors.primary} />
              <TextInput
                style={styles.input}
                placeholder="Enter flight number (e.g. EK201)"
                placeholderTextColor={Colors.textTertiary}
                value={query}
                onChangeText={handleQueryChange}
                autoCapitalize="characters"
                maxLength={6}
                returnKeyType="search"
                onSubmitEditing={() => handleSearch(query)}
              />
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => handleSearch(query)}
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textInverse} />
              ) : (
                <Ionicons name="search" size={20} color={Colors.textInverse} />
              )}
            </TouchableOpacity>
          </View>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Ionicons name="airplane-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Pick */}
        <View style={styles.quickPickSection}>
          <Text style={styles.quickPickLabel}>Popular Flights</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {POPULAR_FLIGHTS.map((fn) => (
              <TouchableOpacity
                key={fn}
                style={[styles.chip, query === fn && styles.chipActive]}
                onPress={() => handleChipPress(fn)}
              >
                <Text style={[styles.chipText, query === fn && styles.chipTextActive]}>
                  {fn}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Looking up flight...</Text>
          </View>
        )}

        {/* Error State */}
        {!loading && error.length > 0 && (
          <View style={styles.errorCard}>
            <View style={styles.errorIconRow}>
              {errorAirlineCode ? (
                <View style={styles.airlineLogoBadge}>
                  <Text style={styles.airlineLogoText}>{errorAirlineCode}</Text>
                </View>
              ) : (
                <Ionicons name="alert-circle" size={24} color={Colors.error} />
              )}
            </View>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Result Section */}
        {!loading && result && (
          <View style={styles.resultCard}>
            {/* Airline Header */}
            <View style={styles.resultHeader}>
              <View style={styles.airlineLogo}>
                <Text style={styles.airlineCode}>{result.airline.code}</Text>
              </View>
              <View style={styles.resultAirlineInfo}>
                <Text style={styles.resultAirlineName}>{result.airline.name}</Text>
                <Text style={styles.resultFlightNumber}>{result.flightNumber}</Text>
              </View>
            </View>

            {/* Route */}
            <View style={styles.routeSection}>
              <View style={styles.routePoint}>
                <Text style={styles.routeCode}>{result.departureAirport.code}</Text>
                <Text style={styles.routeCity}>{result.departureAirport.city}</Text>
              </View>
              <View style={styles.routeArrow}>
                <View style={styles.routeLine} />
                <Ionicons name="airplane" size={18} color={Colors.primary} />
                <View style={styles.routeLine} />
              </View>
              <View style={styles.routePoint}>
                <Text style={styles.routeCode}>{result.arrivalAirport.code}</Text>
                <Text style={styles.routeCity}>{result.arrivalAirport.city}</Text>
              </View>
            </View>

            {/* Aircraft */}
            <View style={styles.detailRow}>
              <Ionicons name="hardware-chip-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailLabel}>Aircraft</Text>
              <Text style={styles.detailValue}>{result.aircraft}</Text>
            </View>

            {/* Departure / Arrival Times */}
            <View style={styles.timesSection}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeBlockLabel}>Departure</Text>
                <Text style={styles.timeBlockTime}>{formatTime(result.departureTime)}</Text>
                <Text style={styles.timeBlockDate}>{formatDate(result.departureTime)}</Text>
              </View>
              <View style={styles.timeDivider} />
              <View style={styles.timeBlock}>
                <Text style={styles.timeBlockLabel}>Arrival</Text>
                <Text style={styles.timeBlockTime}>{formatTime(result.arrivalTime)}</Text>
                <Text style={styles.timeBlockDate}>{formatDate(result.arrivalTime)}</Text>
              </View>
            </View>

            {/* Duration */}
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{formatDuration(result.duration)}</Text>
            </View>

            {/* Estimated Price */}
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Estimated Price</Text>
              <Text style={styles.priceValue}>
                {formatPrice(result.estimatedPrice, result.currency)}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.calendarButton} onPress={handleAddToCalendar}>
                <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                <Text style={styles.calendarButtonText}>Add to Calendar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.detailsButton} onPress={handleViewDetails}>
                <Text style={styles.detailsButtonText}>View Full Details</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.textInverse} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Empty State */}
        {!loading && !result && error.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>Enter a flight number to see details</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  backButton: {
    width: 32,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    padding: Spacing.lg,
  },

  // Search
  searchCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Suggestions
  suggestionsContainer: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  suggestionText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.text,
  },

  // Quick Pick
  quickPickSection: {
    marginBottom: Spacing.lg,
  },
  quickPickLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  chipTextActive: {
    color: Colors.textInverse,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },

  // Error
  errorCard: {
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorIconRow: {
    marginBottom: Spacing.xs,
  },
  airlineLogoBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  airlineLogoText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  errorText: {
    fontSize: FontSizes.md,
    color: Colors.error,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Result
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  airlineLogo: {
    width: 44,
    height: 44,
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
  resultAirlineInfo: {
    flex: 1,
  },
  resultAirlineName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  resultFlightNumber: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },

  // Route
  routeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
  },
  routePoint: {
    alignItems: 'center',
  },
  routeCode: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  routeCity: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  routeArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  routeLine: {
    width: 24,
    height: 2,
    backgroundColor: Colors.primary + '40',
  },

  // Detail rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  detailLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },

  // Times
  timesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  timeBlock: {
    flex: 1,
    alignItems: 'center',
  },
  timeBlockLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  timeBlockTime: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  timeBlockDate: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timeDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },

  // Price
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  priceLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    gap: Spacing.xs,
  },
  calendarButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  detailsButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textInverse,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl * 2,
    gap: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSizes.md,
    color: Colors.textTertiary,
    textAlign: 'center',
  },

  bottomSpacer: {
    height: 40,
  },
});
