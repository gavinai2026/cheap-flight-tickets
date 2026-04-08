import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';

interface RouteEntry {
  route: string;
  count: number;
}

interface AirportEntry {
  code: string;
  country: string;
}

export const FlightStatsScreen = () => {
  const { state } = useApp();
  const { recentSearches, favorites, priceAlerts } = state;

  const stats = useMemo(() => {
    // --- Route counts ---
    const routeMap = new Map<string, number>();
    for (const search of recentSearches) {
      if (search.origin && search.destination) {
        const key = `${search.origin.code} → ${search.destination.code}`;
        routeMap.set(key, (routeMap.get(key) || 0) + 1);
      }
    }
    const allRoutes: RouteEntry[] = Array.from(routeMap.entries())
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count);
    const topRoutes = allRoutes.slice(0, 5);
    const maxRouteCount = topRoutes.length > 0 ? topRoutes[0].count : 0;

    // --- Cabin class breakdown ---
    let businessCount = 0;
    let firstCount = 0;
    for (const search of recentSearches) {
      if (search.cabinClass === 'business') {
        businessCount++;
      } else if (search.cabinClass === 'first') {
        firstCount++;
      }
    }
    const totalClassSearches = businessCount + firstCount;
    const businessPercent = totalClassSearches > 0 ? Math.round((businessCount / totalClassSearches) * 100) : 0;
    const firstPercent = totalClassSearches > 0 ? 100 - businessPercent : 0;

    // --- Unique airports ---
    const airportMap = new Map<string, AirportEntry>();
    for (const search of recentSearches) {
      if (search.origin) {
        airportMap.set(search.origin.code, {
          code: search.origin.code,
          country: search.origin.country,
        });
      }
      if (search.destination) {
        airportMap.set(search.destination.code, {
          code: search.destination.code,
          country: search.destination.country,
        });
      }
    }
    const uniqueAirports = Array.from(airportMap.values());
    const uniqueCountries = new Set(uniqueAirports.map((a) => a.country));

    // --- Average max price from searches that have maxPrice set ---
    const pricesFromSearches = recentSearches
      .filter((s) => s.maxPrice != null && s.maxPrice > 0)
      .map((s) => s.maxPrice as number);
    const averagePrice =
      pricesFromSearches.length > 0
        ? Math.round(pricesFromSearches.reduce((sum, p) => sum + p, 0) / pricesFromSearches.length)
        : null;

    // --- Preferred class ---
    const preferredClass: string =
      totalClassSearches === 0
        ? 'N/A'
        : businessCount >= firstCount
          ? 'Business'
          : 'First';

    // --- Most searched route ---
    const mostSearchedRoute = topRoutes.length > 0 ? topRoutes[0].route : 'N/A';

    return {
      totalSearches: recentSearches.length,
      savedFlights: favorites.length,
      priceAlertsCount: priceAlerts.length,
      topRoutes,
      maxRouteCount,
      businessCount,
      firstCount,
      businessPercent,
      firstPercent,
      totalClassSearches,
      uniqueAirports,
      countriesCount: uniqueCountries.size,
      averagePrice,
      preferredClass,
      mostSearchedRoute,
    };
  }, [recentSearches, favorites, priceAlerts]);

  const hasData = recentSearches.length > 0;

  const formatPrice = (price: number): string => {
    return '$' + price.toLocaleString('en-US');
  };

  if (!hasData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="airplane" size={24} color={Colors.textOnPrimary} />
            <Text style={styles.headerTitle}>Flight Stats</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="bar-chart-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Stats Yet</Text>
          <Text style={styles.emptySubtitle}>Start searching to see your stats</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="airplane" size={24} color={Colors.textOnPrimary} />
          <Text style={styles.headerTitle}>Flight Stats</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="search" size={20} color={Colors.primary} />
            <Text style={styles.summaryNumber}>{stats.totalSearches}</Text>
            <Text style={styles.summaryLabel}>Total Searches</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="heart" size={20} color={Colors.error} />
            <Text style={styles.summaryNumber}>{stats.savedFlights}</Text>
            <Text style={styles.summaryLabel}>Saved Flights</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="notifications" size={20} color={Colors.warning} />
            <Text style={styles.summaryNumber}>{stats.priceAlertsCount}</Text>
            <Text style={styles.summaryLabel}>Price Alerts</Text>
          </View>
        </View>

        {/* Routes Explored Section */}
        {stats.topRoutes.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="navigate" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Routes Explored</Text>
            </View>
            {stats.topRoutes.map((entry) => (
              <View key={entry.route} style={styles.routeRow}>
                <Text style={styles.routeText}>{entry.route}</Text>
                <View style={styles.routeBarContainer}>
                  <View
                    style={[
                      styles.routeBar,
                      {
                        width: `${stats.maxRouteCount > 0 ? (entry.count / stats.maxRouteCount) * 100 : 0}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.routeCount}>{entry.count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Cabin Class Breakdown */}
        {stats.totalClassSearches > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pie-chart" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Cabin Class Breakdown</Text>
            </View>
            <View style={styles.classBarRow}>
              {stats.businessPercent > 0 && (
                <View
                  style={[
                    styles.classBarSegment,
                    {
                      flex: stats.businessPercent,
                      backgroundColor: Colors.business,
                      borderTopLeftRadius: BorderRadius.sm,
                      borderBottomLeftRadius: BorderRadius.sm,
                      borderTopRightRadius: stats.firstPercent === 0 ? BorderRadius.sm : 0,
                      borderBottomRightRadius: stats.firstPercent === 0 ? BorderRadius.sm : 0,
                    },
                  ]}
                />
              )}
              {stats.firstPercent > 0 && (
                <View
                  style={[
                    styles.classBarSegment,
                    {
                      flex: stats.firstPercent,
                      backgroundColor: Colors.first,
                      borderTopRightRadius: BorderRadius.sm,
                      borderBottomRightRadius: BorderRadius.sm,
                      borderTopLeftRadius: stats.businessPercent === 0 ? BorderRadius.sm : 0,
                      borderBottomLeftRadius: stats.businessPercent === 0 ? BorderRadius.sm : 0,
                    },
                  ]}
                />
              )}
            </View>
            <View style={styles.classLegendRow}>
              <View style={styles.classLegendItem}>
                <View style={[styles.classLegendDot, { backgroundColor: Colors.business }]} />
                <Text style={styles.classLegendText}>Business</Text>
                <Text style={styles.classLegendPercent}>{stats.businessPercent}%</Text>
              </View>
              <View style={styles.classLegendItem}>
                <View style={[styles.classLegendDot, { backgroundColor: Colors.first }]} />
                <Text style={styles.classLegendText}>First</Text>
                <Text style={styles.classLegendPercent}>{stats.firstPercent}%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Airports Visited Section */}
        {stats.uniqueAirports.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="globe" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Airports Visited</Text>
              <Text style={styles.sectionBadge}>{stats.uniqueAirports.length}</Text>
            </View>
            <View style={styles.airportGrid}>
              {stats.uniqueAirports.map((airport) => (
                <View key={airport.code} style={styles.airportBadge}>
                  <Text style={styles.airportCode}>{airport.code}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.countriesText}>
              {stats.countriesCount} {stats.countriesCount === 1 ? 'country' : 'countries'}
            </Text>
          </View>
        )}

        {/* Travel Insights Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={18} color={Colors.warning} />
            <Text style={styles.sectionTitle}>Travel Insights</Text>
          </View>
          <View style={styles.insightRow}>
            <Ionicons name="trending-up" size={16} color={Colors.primary} />
            <Text style={styles.insightLabel}>Most searched route:</Text>
            <Text style={styles.insightValue}>{stats.mostSearchedRoute}</Text>
          </View>
          <View style={styles.insightRow}>
            <Ionicons name="ribbon" size={16} color={Colors.first} />
            <Text style={styles.insightLabel}>Preferred class:</Text>
            <Text style={styles.insightValue}>{stats.preferredClass}</Text>
          </View>
          {stats.averagePrice != null && (
            <View style={styles.insightRow}>
              <Ionicons name="cash" size={16} color={Colors.success} />
              <Text style={styles.insightLabel}>Average search price:</Text>
              <Text style={styles.insightValue}>{formatPrice(stats.averagePrice)}</Text>
            </View>
          )}
          <View style={styles.insightRow}>
            <Ionicons name="earth" size={16} color={Colors.accent} />
            <Text style={styles.insightLabel}>Countries explored:</Text>
            <Text style={styles.insightValue}>{stats.countriesCount}</Text>
          </View>
        </View>
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
    paddingTop: 55,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.textOnPrimary,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  emptyTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // Summary cards
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.md,
  },
  summaryNumber: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  summaryLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },

  // Section card
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    flex: 1,
  },
  sectionBadge: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    backgroundColor: Colors.businessBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },

  // Routes
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  routeText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.text,
    width: 100,
  },
  routeBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    marginHorizontal: Spacing.sm,
    overflow: 'hidden',
  },
  routeBar: {
    height: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  routeCount: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    width: 28,
    textAlign: 'right',
  },

  // Cabin class
  classBarRow: {
    flexDirection: 'row',
    height: 24,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  classBarSegment: {
    height: 24,
  },
  classLegendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xxl,
  },
  classLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  classLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  classLegendText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: FontWeights.medium,
  },
  classLegendPercent: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.semibold,
  },

  // Airports
  airportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  airportBadge: {
    backgroundColor: Colors.businessBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  airportCode: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  countriesText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Insights
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  insightLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    flex: 1,
  },
  insightValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
});
