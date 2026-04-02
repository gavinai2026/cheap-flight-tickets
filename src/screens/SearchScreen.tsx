import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useSubscription } from '../context/SubscriptionContext';
import { AirportSearch } from '../components/AirportSearch';
import { DatePicker } from '../components/DatePicker';
import { DealCard } from '../components/DealCard';
import { UsageBanner } from '../components/UsageBanner';
import { PremiumLock } from '../components/PremiumBadge';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';
import { searchFlights, getDealsOfTheDay } from '../services/flightService';
import { CabinClass, TripType } from '../types';

export const SearchScreen = ({ navigation }: any) => {
  const { state, dispatch, updateSearch, swapAirports, setDeals } = useApp();
  const { canSearch, incrementSearchCount, isPremium, canUsePremiumFeature } = useSubscription();
  const { searchQuery, deals } = state;
  const [loadingDeals, setLoadingDeals] = useState(true);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoadingDeals(true);
    const d = await getDealsOfTheDay();
    setDeals(d);
    setLoadingDeals(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.origin || !searchQuery.destination) return;

    if (!canSearch()) {
      navigation.navigate('Paywall');
      return;
    }

    dispatch({ type: 'SET_IS_SEARCHING', payload: true });
    dispatch({ type: 'ADD_RECENT_SEARCH', payload: searchQuery });
    incrementSearchCount();

    try {
      const results = await searchFlights(searchQuery);
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
      navigation.navigate('Results');
    } catch (error) {
      dispatch({ type: 'SET_IS_SEARCHING', payload: false });
    }
  };

  const cabinOptions: { value: CabinClass; label: string; icon: string }[] = [
    { value: 'business', label: 'Business', icon: 'briefcase' },
    { value: 'first', label: 'First Class', icon: 'diamond' },
  ];

  const tripOptions: { value: TripType; label: string }[] = [
    { value: 'roundtrip', label: 'Round Trip' },
    { value: 'oneway', label: 'One Way' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Find Premium Flights</Text>
            <Text style={styles.subtitle}>Business & First Class deals worldwide</Text>
          </View>
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => navigation.navigate('Alerts')}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.textInverse} />
            {state.priceAlerts.filter((a) => a.isActive).length > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {state.priceAlerts.filter((a) => a.isActive).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Card */}
        <View style={styles.searchCard}>
          {/* Trip Type */}
          <View style={styles.tripTypeRow}>
            {tripOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.tripTypeButton,
                  searchQuery.tripType === opt.value && styles.tripTypeButtonActive,
                ]}
                onPress={() => updateSearch({ tripType: opt.value })}
              >
                <Text
                  style={[
                    styles.tripTypeText,
                    searchQuery.tripType === opt.value && styles.tripTypeTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cabin Class */}
          <View style={styles.cabinRow}>
            {cabinOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.cabinButton,
                  searchQuery.cabinClass === opt.value && styles.cabinButtonActive,
                ]}
                onPress={() => updateSearch({ cabinClass: opt.value })}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={16}
                  color={
                    searchQuery.cabinClass === opt.value
                      ? Colors.textInverse
                      : Colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.cabinText,
                    searchQuery.cabinClass === opt.value && styles.cabinTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Airport Selection */}
          <View style={styles.airportSection}>
            <AirportSearch
              label="From"
              value={searchQuery.origin}
              onSelect={(airport) => updateSearch({ origin: airport })}
              placeholder="Departure city"
            />

            <TouchableOpacity style={styles.swapButton} onPress={swapAirports}>
              <Ionicons name="swap-vertical" size={20} color={Colors.primary} />
            </TouchableOpacity>

            <AirportSearch
              label="To"
              value={searchQuery.destination}
              onSelect={(airport) => updateSearch({ destination: airport })}
              placeholder="Arrival city"
            />
          </View>

          {/* Date Selection */}
          <View style={styles.dateSection}>
            <View style={styles.dateField}>
              <DatePicker
                label="Departure"
                value={searchQuery.departureDate}
                onChange={(date) => updateSearch({ departureDate: date })}
              />
            </View>
            {searchQuery.tripType === 'roundtrip' && (
              <View style={styles.dateField}>
                <DatePicker
                  label="Return"
                  value={searchQuery.returnDate || ''}
                  onChange={(date) => updateSearch({ returnDate: date })}
                  minDate={searchQuery.departureDate}
                />
              </View>
            )}
          </View>

          {/* Passengers */}
          <View style={styles.passengersRow}>
            <View style={styles.passengerInfo}>
              <Ionicons name="people" size={18} color={Colors.primary} />
              <Text style={styles.passengerText}>
                {searchQuery.passengers.adults} Adult
                {searchQuery.passengers.adults > 1 ? 's' : ''}
                {searchQuery.passengers.children > 0 &&
                  `, ${searchQuery.passengers.children} Child`}
              </Text>
            </View>
            <View style={styles.passengerControls}>
              <TouchableOpacity
                style={styles.passengerBtn}
                onPress={() =>
                  searchQuery.passengers.adults > 1 &&
                  updateSearch({
                    passengers: {
                      ...searchQuery.passengers,
                      adults: searchQuery.passengers.adults - 1,
                    },
                  })
                }
              >
                <Ionicons name="remove" size={16} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.passengerCount}>{searchQuery.passengers.adults}</Text>
              <TouchableOpacity
                style={styles.passengerBtn}
                onPress={() =>
                  updateSearch({
                    passengers: {
                      ...searchQuery.passengers,
                      adults: searchQuery.passengers.adults + 1,
                    },
                  })
                }
              >
                <Ionicons name="add" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Flexible Dates Toggle */}
          <TouchableOpacity
            style={styles.flexibleToggle}
            onPress={() => updateSearch({ flexibleDates: !searchQuery.flexibleDates })}
          >
            <Ionicons
              name={searchQuery.flexibleDates ? 'checkbox' : 'square-outline'}
              size={20}
              color={searchQuery.flexibleDates ? Colors.primary : Colors.textTertiary}
            />
            <Text style={styles.flexibleText}>Flexible dates (±3 days)</Text>
          </TouchableOpacity>

          {/* Search Button */}
          <TouchableOpacity
            style={[
              styles.searchButton,
              (!searchQuery.origin || !searchQuery.destination) && styles.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={!searchQuery.origin || !searchQuery.destination || state.isSearching}
          >
            {state.isSearching ? (
              <ActivityIndicator color={Colors.textInverse} />
            ) : (
              <>
                <Ionicons name="search" size={20} color={Colors.textInverse} />
                <Text style={styles.searchButtonText}>Search Premium Flights</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Usage Banner for Free Users */}
        <UsageBanner />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Calendar')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.accentLight + '30' }]}>
              <Ionicons name="calendar" size={22} color={Colors.accent} />
            </View>
            <Text style={styles.quickActionText}>Price Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => canUsePremiumFeature('flight_tracker') ? navigation.navigate('FlightTracker') : navigation.navigate('Paywall')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.successLight }]}>
              <Ionicons name="locate" size={22} color={Colors.success} />
            </View>
            <View style={styles.quickActionLabelRow}>
              <Text style={styles.quickActionText}>Track Flight</Text>
              {!isPremium && <PremiumLock />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => canUsePremiumFeature('trip_planner') ? navigation.navigate('TripPlanner') : navigation.navigate('Paywall')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.warningLight }]}>
              <Ionicons name="map" size={22} color={Colors.warning} />
            </View>
            <View style={styles.quickActionLabelRow}>
              <Text style={styles.quickActionText}>Trip Planner</Text>
              {!isPremium && <PremiumLock />}
            </View>
          </TouchableOpacity>
        </View>

        {/* More Tools */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => canUsePremiumFeature('cabin_compare') ? navigation.navigate('Compare') : navigation.navigate('Paywall')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.primaryLight + '30' }]}>
              <Ionicons name="git-compare" size={22} color={Colors.primary} />
            </View>
            <View style={styles.quickActionLabelRow}>
              <Text style={styles.quickActionText}>Compare</Text>
              {!isPremium && <PremiumLock />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => canUsePremiumFeature('visa_checker') ? navigation.navigate('VisaCheck') : navigation.navigate('Paywall')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.infoLight }]}>
              <Ionicons name="document-text" size={22} color={Colors.info} />
            </View>
            <View style={styles.quickActionLabelRow}>
              <Text style={styles.quickActionText}>Visa Check</Text>
              {!isPremium && <PremiumLock />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Alerts')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.errorLight }]}>
              <Ionicons name="notifications" size={22} color={Colors.error} />
            </View>
            <Text style={styles.quickActionText}>Price Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Deals Section */}
        <View style={styles.dealsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Hot Deals Today</Text>
              <Text style={styles.sectionSubtitle}>Premium cabin deals expiring soon</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('DealsTab')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {loadingDeals ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={deals.slice(0, 6)}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
              renderItem={({ item }) => (
                <DealCard
                  deal={item}
                  onPress={() =>
                    navigation.navigate('Results', {
                      dealOrigin: item.origin,
                      dealDestination: item.destination,
                      dealCabin: item.cabinClass,
                    })
                  }
                  compact
                />
              )}
            />
          )}
        </View>

        {/* Recent Searches */}
        {state.recentSearches.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            {state.recentSearches.slice(0, 3).map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentItem}
                onPress={() => {
                  updateSearch(search);
                  handleSearch();
                }}
              >
                <Ionicons name="time-outline" size={18} color={Colors.textTertiary} />
                <View style={styles.recentInfo}>
                  <Text style={styles.recentRoute}>
                    {search.origin?.code} → {search.destination?.code}
                  </Text>
                  <Text style={styles.recentDetails}>
                    {search.cabinClass === 'first' ? 'First' : 'Business'} · {search.departureDate}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.textInverse,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textInverse,
    opacity: 0.8,
    marginTop: 2,
  },
  notifButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    fontSize: 10,
    fontWeight: FontWeights.bold,
    color: Colors.textInverse,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: -Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  tripTypeRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: 3,
  },
  tripTypeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  tripTypeButtonActive: {
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  tripTypeText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textTertiary,
  },
  tripTypeTextActive: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  cabinRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  cabinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  cabinButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cabinText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
  cabinTextActive: {
    color: Colors.textInverse,
  },
  airportSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  swapButton: {
    alignSelf: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -Spacing.sm,
    zIndex: 1,
  },
  dateSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dateField: {},
  passengersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  passengerText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.text,
  },
  passengerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  passengerBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerCount: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  flexibleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  flexibleText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  searchButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textInverse,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  quickAction: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
  quickActionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dealsSection: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  seeAll: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  recentSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  recentInfo: {
    flex: 1,
  },
  recentRoute: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  recentDetails: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});
