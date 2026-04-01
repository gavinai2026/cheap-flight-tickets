import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { searchFlights } from '../services/flightService';
import { Flight } from '../types';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';
import { formatPrice, formatDuration, getStopsLabel, getCabinClassLabel } from '../utils/helpers';

export const CompareScreen = ({ navigation }: any) => {
  const { state } = useApp();
  const { searchQuery } = state;
  const [businessFlights, setBusinessFlights] = useState<Flight[]>([]);
  const [firstFlights, setFirstFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComparison();
  }, []);

  const loadComparison = async () => {
    if (!searchQuery.origin || !searchQuery.destination) return;
    setLoading(true);

    const [biz, first] = await Promise.all([
      searchFlights({ ...searchQuery, cabinClass: 'business' }),
      searchFlights({ ...searchQuery, cabinClass: 'first' }),
    ]);

    setBusinessFlights(biz.slice(0, 3));
    setFirstFlights(first.slice(0, 3));
    setLoading(false);
  };

  const bizBest = businessFlights[0];
  const firstBest = firstFlights[0];

  const COMPARISON_ROWS = bizBest && firstBest ? [
    { label: 'Lowest Price', business: formatPrice(bizBest.price), first: formatPrice(firstBest.price), highlight: bizBest.price < firstBest.price ? 'business' : 'first' },
    { label: 'Duration', business: formatDuration(bizBest.totalDuration), first: formatDuration(firstBest.totalDuration), highlight: bizBest.totalDuration <= firstBest.totalDuration ? 'business' : 'first' },
    { label: 'Stops', business: getStopsLabel(bizBest.stops), first: getStopsLabel(firstBest.stops), highlight: bizBest.stops <= firstBest.stops ? 'business' : 'first' },
    { label: 'Baggage', business: bizBest.baggageAllowance, first: firstBest.baggageAllowance, highlight: 'first' },
    { label: 'Refundable', business: bizBest.refundable ? 'Yes' : 'No', first: firstBest.refundable ? 'Yes' : 'No', highlight: firstBest.refundable ? 'first' : bizBest.refundable ? 'business' : 'none' },
    { label: 'Lounge Access', business: 'Yes', first: 'Yes', highlight: 'both' },
    { label: 'Seat Type', business: 'Lie-flat', first: 'Private Suite', highlight: 'first' },
    { label: 'Seats Left', business: String(bizBest.seatsRemaining), first: String(firstBest.seatsRemaining), highlight: 'none' },
  ] : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Compare Cabins</Text>
          {searchQuery.origin && searchQuery.destination && (
            <Text style={styles.headerRoute}>{searchQuery.origin.code} → {searchQuery.destination.code}</Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Comparing cabin classes...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Column Headers */}
          <View style={styles.columnHeaders}>
            <View style={styles.labelCol} />
            <View style={[styles.cabinCol, styles.businessCol]}>
              <Ionicons name="briefcase" size={18} color={Colors.business} />
              <Text style={[styles.cabinTitle, { color: Colors.business }]}>Business</Text>
            </View>
            <View style={[styles.cabinCol, styles.firstCol]}>
              <Ionicons name="diamond" size={18} color={Colors.first} />
              <Text style={[styles.cabinTitle, { color: Colors.first }]}>First</Text>
            </View>
          </View>

          {/* Comparison Table */}
          <View style={styles.table}>
            {COMPARISON_ROWS.map((row, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                <View style={styles.labelCol}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                </View>
                <View style={[styles.valueCol, row.highlight === 'business' && styles.highlightCol]}>
                  <Text style={[styles.rowValue, row.highlight === 'business' && styles.highlightValue]}>{row.business}</Text>
                </View>
                <View style={[styles.valueCol, row.highlight === 'first' && styles.highlightCol]}>
                  <Text style={[styles.rowValue, row.highlight === 'first' && styles.highlightValue]}>{row.first}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Price Difference */}
          {bizBest && firstBest && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Upgrade Cost</Text>
              <Text style={styles.upgradePrice}>{formatPrice(firstBest.price - bizBest.price)}</Text>
              <Text style={styles.summaryNote}>
                First Class costs {Math.round(((firstBest.price - bizBest.price) / bizBest.price) * 100)}% more than Business
              </Text>
            </View>
          )}

          {/* Amenity Comparison */}
          {bizBest && firstBest && (
            <View style={styles.amenityCard}>
              <Text style={styles.amenityTitle}>Exclusive First Class Amenities</Text>
              {firstBest.segments[0].amenities
                .filter((a) => !bizBest.segments[0].amenities.includes(a))
                .map((amenity, i) => (
                  <View key={i} style={styles.amenityRow}>
                    <Ionicons name="star" size={14} color={Colors.first} />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: Spacing.md, paddingHorizontal: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.md },
  headerInfo: {},
  headerTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text },
  headerRoute: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.md },
  content: { padding: Spacing.lg },
  columnHeaders: { flexDirection: 'row', marginBottom: Spacing.md },
  labelCol: { flex: 1.2 },
  cabinCol: { flex: 1, alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md, gap: 4 },
  businessCol: { backgroundColor: Colors.businessBg, marginRight: Spacing.xs },
  firstCol: { backgroundColor: Colors.firstBg },
  cabinTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  table: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.md, marginBottom: Spacing.lg },
  tableRow: { flexDirection: 'row', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md },
  tableRowAlt: { backgroundColor: Colors.background },
  rowLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, color: Colors.textSecondary },
  valueCol: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.xs },
  highlightCol: { backgroundColor: Colors.successLight, borderRadius: BorderRadius.sm, marginHorizontal: 2 },
  rowValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text, textAlign: 'center' },
  highlightValue: { color: Colors.success },
  summaryCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.md, ...Shadows.md },
  summaryTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.textSecondary },
  upgradePrice: { fontSize: FontSizes.display, fontWeight: FontWeights.bold, color: Colors.first, marginVertical: Spacing.sm },
  summaryNote: { fontSize: FontSizes.sm, color: Colors.textTertiary },
  amenityCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadows.md },
  amenityTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
  amenityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  amenityText: { fontSize: FontSizes.sm, color: Colors.text },
});
