import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { DealCard } from '../components/DealCard';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/theme';
import { getDealsOfTheDay } from '../services/flightService';
import { CabinClass } from '../types';

export const DealsScreen = ({ navigation }: any) => {
  const { state, setDeals } = useApp();
  const { deals } = state;
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCabin, setFilterCabin] = useState<CabinClass | 'all'>('all');

  useEffect(() => {
    if (deals.length === 0) loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    const d = await getDealsOfTheDay();
    setDeals(d);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const d = await getDealsOfTheDay();
    setDeals(d);
    setRefreshing(false);
  };

  const filteredDeals =
    filterCabin === 'all' ? deals : deals.filter((d) => d.cabinClass === filterCabin);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Premium Deals</Text>
          <Text style={styles.headerSubtitle}>Handpicked discounts updated daily</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'business', 'first'] as const).map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.filterTab, filterCabin === opt && styles.filterTabActive]}
            onPress={() => setFilterCabin(opt)}
          >
            <Text
              style={[styles.filterTabText, filterCabin === opt && styles.filterTabTextActive]}
            >
              {opt === 'all' ? 'All' : opt === 'business' ? 'Business' : 'First Class'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding the best deals...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDeals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          renderItem={({ item }) => (
            <DealCard
              deal={item}
              onPress={() =>
                navigation.navigate('SearchTab', {
                  screen: 'Results',
                  params: {
                    dealOrigin: item.origin,
                    dealDestination: item.destination,
                    dealCabin: item.cabinClass,
                  },
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="pricetag-outline" size={64} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Deals Found</Text>
              <Text style={styles.emptyText}>
                No {filterCabin !== 'all' ? filterCabin : ''} class deals available right now.
                Pull to refresh or check back later.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 55,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.textInverse,
    fontWeight: FontWeights.bold,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  listContent: {
    padding: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
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
    paddingHorizontal: Spacing.xxl,
  },
});
