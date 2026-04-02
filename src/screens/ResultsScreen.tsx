import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useSubscription } from '../context/SubscriptionContext';
import { FlightCard } from '../components/FlightCard';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/theme';
import { FREE_LIMITS } from '../types/subscription';
import { SortOption } from '../types';
import { searchFlights } from '../services/flightService';
import { formatPrice, getCabinClassLabel } from '../utils/helpers';

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: 'price_asc', label: 'Price: Low to High', icon: 'trending-down' },
  { value: 'price_desc', label: 'Price: High to Low', icon: 'trending-up' },
  { value: 'duration', label: 'Duration: Shortest', icon: 'time' },
  { value: 'stops', label: 'Stops: Fewest', icon: 'git-commit' },
  { value: 'departure', label: 'Departure: Earliest', icon: 'sunny' },
];

const STOP_FILTERS = [
  { value: -1, label: 'Any' },
  { value: 0, label: 'Nonstop' },
  { value: 1, label: '1 Stop' },
  { value: 2, label: '2+ Stops' },
];

export const ResultsScreen = ({ navigation, route }: any) => {
  const { state, dispatch, toggleFavorite, isFavorite } = useApp();
  const { canViewFullResults } = useSubscription();
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [maxStopsFilter, setMaxStopsFilter] = useState(-1);
  const [maxPriceFilter, setMaxPriceFilter] = useState(0);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);

  const { searchResults, searchQuery, sortOption, isSearching } = state;

  useEffect(() => {
    if (route.params?.dealOrigin) {
      const q = {
        ...searchQuery,
        origin: route.params.dealOrigin,
        destination: route.params.dealDestination,
        cabinClass: route.params.dealCabin,
      };
      dispatch({ type: 'SET_IS_SEARCHING', payload: true });
      searchFlights(q).then((results) => {
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
      });
    }
  }, [route.params]);

  const uniqueAirlines = useMemo(() => {
    const airlines = new Map();
    searchResults.forEach((f) => {
      f.segments.forEach((s) => {
        if (!airlines.has(s.airline.code)) {
          airlines.set(s.airline.code, s.airline);
        }
      });
    });
    return Array.from(airlines.values());
  }, [searchResults]);

  const filteredAndSorted = useMemo(() => {
    let results = [...searchResults];

    if (maxStopsFilter >= 0) {
      results = results.filter((f) =>
        maxStopsFilter === 2 ? f.stops >= 2 : f.stops === maxStopsFilter
      );
    }

    if (maxPriceFilter > 0) {
      results = results.filter((f) => f.price <= maxPriceFilter);
    }

    if (selectedAirlines.length > 0) {
      results = results.filter((f) =>
        f.segments.some((s) => selectedAirlines.includes(s.airline.code))
      );
    }

    switch (sortOption) {
      case 'price_asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'duration':
        results.sort((a, b) => a.totalDuration - b.totalDuration);
        break;
      case 'stops':
        results.sort((a, b) => a.stops - b.stops);
        break;
      case 'departure':
        results.sort(
          (a, b) =>
            new Date(a.segments[0].departureTime).getTime() -
            new Date(b.segments[0].departureTime).getTime()
        );
        break;
    }

    return results;
  }, [searchResults, sortOption, maxStopsFilter, maxPriceFilter, selectedAirlines]);

  const lowestPrice = useMemo(
    () => (searchResults.length > 0 ? Math.min(...searchResults.map((f) => f.price)) : 0),
    [searchResults]
  );

  if (isSearching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Searching premium flights...</Text>
        <Text style={styles.loadingSubtext}>
          Comparing {getCabinClassLabel(searchQuery.cabinClass)} fares across all airlines
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerRoute}>
            {searchQuery.origin?.code} → {searchQuery.destination?.code}
          </Text>
          <Text style={styles.headerDetails}>
            {getCabinClassLabel(searchQuery.cabinClass)} · {searchQuery.passengers.adults} pax
          </Text>
        </View>
        <TouchableOpacity style={styles.modifyButton} onPress={() => navigation.goBack()}>
          <Text style={styles.modifyText}>Modify</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {filteredAndSorted.length} flight{filteredAndSorted.length !== 1 ? 's' : ''} found
        </Text>
        {lowestPrice > 0 && (
          <Text style={styles.statsPrice}>from {formatPrice(lowestPrice)}</Text>
        )}
      </View>

      {/* Sort & Filter Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setSortModalVisible(true)}
        >
          <Ionicons name="swap-vertical" size={16} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Sort</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={16} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Filter</Text>
          {(maxStopsFilter >= 0 || selectedAirlines.length > 0) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      <FlatList
        data={canViewFullResults() ? filteredAndSorted : filteredAndSorted.slice(0, FREE_LIMITS.maxResults)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <FlightCard
            flight={item}
            onPress={() => navigation.navigate('FlightDetails', { flight: item })}
            onFavorite={() => toggleFavorite(item.id)}
            isFavorite={isFavorite(item.id)}
          />
        )}
        ListFooterComponent={
          !canViewFullResults() && filteredAndSorted.length > FREE_LIMITS.maxResults ? (
            <TouchableOpacity
              style={styles.premiumUpsell}
              onPress={() => navigation.navigate('Paywall')}
              activeOpacity={0.8}
            >
              <Ionicons name="diamond" size={20} color={Colors.premium} />
              <Text style={styles.premiumUpsellTitle}>
                See {filteredAndSorted.length - FREE_LIMITS.maxResults} more results
              </Text>
              <Text style={styles.premiumUpsellText}>
                Upgrade to Premium for full search results
              </Text>
              <View style={styles.premiumUpsellButton}>
                <Text style={styles.premiumUpsellButtonText}>Unlock All Results</Text>
              </View>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Flights Found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your filters or searching different dates
            </Text>
          </View>
        }
      />

      {/* Sort Modal */}
      <Modal visible={sortModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <TouchableOpacity onPress={() => setSortModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.sortOption, sortOption === opt.value && styles.sortOptionActive]}
              onPress={() => {
                dispatch({ type: 'SET_SORT_OPTION', payload: opt.value });
                setSortModalVisible(false);
              }}
            >
              <Ionicons
                name={opt.icon as any}
                size={20}
                color={sortOption === opt.value ? Colors.primary : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.sortOptionText,
                  sortOption === opt.value && styles.sortOptionTextActive,
                ]}
              >
                {opt.label}
              </Text>
              {sortOption === opt.value && (
                <Ionicons name="checkmark" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Stops</Text>
            <View style={styles.filterRow}>
              {STOP_FILTERS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.filterChip,
                    maxStopsFilter === opt.value && styles.filterChipActive,
                  ]}
                  onPress={() => setMaxStopsFilter(opt.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      maxStopsFilter === opt.value && styles.filterChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Airlines</Text>
            <View style={styles.filterRow}>
              {uniqueAirlines.slice(0, 8).map((airline) => (
                <TouchableOpacity
                  key={airline.code}
                  style={[
                    styles.filterChip,
                    selectedAirlines.includes(airline.code) && styles.filterChipActive,
                  ]}
                  onPress={() => {
                    setSelectedAirlines((prev) =>
                      prev.includes(airline.code)
                        ? prev.filter((c) => c !== airline.code)
                        : [...prev, airline.code]
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedAirlines.includes(airline.code) && styles.filterChipTextActive,
                    ]}
                  >
                    {airline.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setMaxStopsFilter(-1);
                setSelectedAirlines([]);
                setMaxPriceFilter(0);
              }}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>
                Show {filteredAndSorted.length} Results
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  loadingText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  loadingSubtext: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerRoute: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  headerDetails: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  modifyButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  modifyText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryLight + '10',
  },
  statsText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  statsPrice: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  actionButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.primary,
  },
  filterBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.deal,
    marginLeft: 2,
  },
  listContent: {
    paddingVertical: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  sortOptionActive: {
    backgroundColor: Colors.primaryLight + '10',
  },
  sortOptionText: {
    flex: 1,
    fontSize: FontSizes.lg,
    color: Colors.text,
  },
  sortOptionTextActive: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  filterSection: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterLabel: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  filterChipTextActive: {
    color: Colors.textInverse,
    fontWeight: FontWeights.semibold,
  },
  filterActions: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  clearButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
  applyButton: {
    flex: 2,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
  },
  applyButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textInverse,
  },
  premiumUpsell: {
    alignItems: 'center',
    backgroundColor: Colors.premiumBg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.premium + '30',
  },
  premiumUpsellTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  premiumUpsellText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  premiumUpsellButton: {
    backgroundColor: Colors.premium,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  premiumUpsellButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: '#FFF',
  },
});
