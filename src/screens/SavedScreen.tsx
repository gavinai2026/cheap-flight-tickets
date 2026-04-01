import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';
import { formatDate, formatPrice, getCabinClassLabel } from '../utils/helpers';

type TabType = 'searches' | 'favorites';

export const SavedScreen = ({ navigation }: any) => {
  const { state, removeSavedSearch, updateSearch, toggleFavorite } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('searches');

  const handleSearchAgain = (query: any) => {
    updateSearch(query);
    navigation.navigate('SearchTab');
  };

  const handleDeleteSearch = (id: string) => {
    Alert.alert('Remove Search', 'Remove this saved search?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeSavedSearch(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'searches' && styles.tabActive]}
          onPress={() => setActiveTab('searches')}
        >
          <Ionicons
            name="search"
            size={16}
            color={activeTab === 'searches' ? Colors.primary : Colors.textTertiary}
          />
          <Text style={[styles.tabText, activeTab === 'searches' && styles.tabTextActive]}>
            Saved Searches ({state.savedSearches.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
          onPress={() => setActiveTab('favorites')}
        >
          <Ionicons
            name="heart"
            size={16}
            color={activeTab === 'favorites' ? Colors.primary : Colors.textTertiary}
          />
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
            Favorites ({state.favorites.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'searches' ? (
        <FlatList
          data={state.savedSearches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.searchCard}>
              <View style={styles.searchHeader}>
                <View style={styles.searchRoute}>
                  <Text style={styles.routeText}>
                    {item.query.origin?.code} → {item.query.destination?.code}
                  </Text>
                  <View
                    style={[
                      styles.cabinBadge,
                      item.query.cabinClass === 'first' ? styles.firstBadge : styles.businessBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.cabinBadgeText,
                        item.query.cabinClass === 'first'
                          ? styles.firstBadgeText
                          : styles.businessBadgeText,
                      ]}
                    >
                      {getCabinClassLabel(item.query.cabinClass)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteSearch(item.id)}>
                  <Ionicons name="close" size={20} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.textTertiary} />
                  <Text style={styles.detailText}>{formatDate(item.query.departureDate)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="people-outline" size={14} color={Colors.textTertiary} />
                  <Text style={styles.detailText}>{item.query.passengers.adults} passenger(s)</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
                  <Text style={styles.detailText}>Saved {formatDate(item.savedAt)}</Text>
                </View>
              </View>

              {item.lastPrice && (
                <View style={styles.priceRow}>
                  <Text style={styles.lastPriceLabel}>Last seen from</Text>
                  <Text style={styles.lastPrice}>{formatPrice(item.lastPrice)}</Text>
                  {item.priceChange && item.priceChange !== 0 && (
                    <View
                      style={[
                        styles.priceChangeBadge,
                        item.priceChange < 0 ? styles.priceDown : styles.priceUp,
                      ]}
                    >
                      <Ionicons
                        name={item.priceChange < 0 ? 'trending-down' : 'trending-up'}
                        size={12}
                        color={item.priceChange < 0 ? Colors.success : Colors.error}
                      />
                      <Text
                        style={[
                          styles.priceChangeText,
                          { color: item.priceChange < 0 ? Colors.success : Colors.error },
                        ]}
                      >
                        {formatPrice(Math.abs(item.priceChange))}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={styles.searchAgainButton}
                onPress={() => handleSearchAgain(item.query)}
              >
                <Ionicons name="search" size={16} color={Colors.primary} />
                <Text style={styles.searchAgainText}>Search Again</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={64} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Saved Searches</Text>
              <Text style={styles.emptyText}>
                Save your frequent searches for quick access. Tap the bookmark icon after searching.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={state.favorites}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.favoriteCard}>
              <View style={styles.favoriteRow}>
                <Ionicons name="heart" size={20} color={Colors.error} />
                <Text style={styles.favoriteId}>Flight #{item.substring(0, 8)}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(item)}>
                  <Ionicons name="close" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Favorites</Text>
              <Text style={styles.emptyText}>
                Tap the heart icon on any flight to save it to your favorites for later.
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
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.primaryLight + '15',
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textTertiary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  listContent: {
    padding: Spacing.lg,
  },
  searchCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  searchRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  routeText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  cabinBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  businessBadge: {
    backgroundColor: Colors.businessBg,
  },
  firstBadge: {
    backgroundColor: Colors.firstBg,
  },
  cabinBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
  businessBadgeText: {
    color: Colors.business,
  },
  firstBadgeText: {
    color: Colors.first,
  },
  searchDetails: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  lastPriceLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  lastPrice: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  priceChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  priceDown: {
    backgroundColor: Colors.successLight,
  },
  priceUp: {
    backgroundColor: Colors.errorLight,
  },
  priceChangeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
  searchAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: Spacing.sm,
  },
  searchAgainText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  favoriteCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  favoriteId: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.text,
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
