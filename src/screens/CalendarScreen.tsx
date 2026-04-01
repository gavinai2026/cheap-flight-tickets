import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';
import { getCalendarPrices } from '../services/flightService';
import { CalendarPrice } from '../types';
import { formatPrice, getCabinClassLabel } from '../utils/helpers';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarScreen = ({ navigation }: any) => {
  const { state, updateSearch } = useApp();
  const { searchQuery } = state;
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [prices, setPrices] = useState<CalendarPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<CalendarPrice | null>(null);

  useEffect(() => {
    loadPrices();
  }, [currentMonth, searchQuery.cabinClass]);

  const loadPrices = async () => {
    if (!searchQuery.origin || !searchQuery.destination) return;
    setLoading(true);
    const data = await getCalendarPrices(
      searchQuery.origin.code,
      searchQuery.destination.code,
      searchQuery.cabinClass,
      currentMonth
    );
    setPrices(data);
    setLoading(false);
  };

  const [year, month] = currentMonth.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const monthLabel = `${MONTHS[month - 1]} ${year}`;

  const navigateMonth = (dir: number) => {
    const d = new Date(year, month - 1 + dir, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    setSelectedDate(null);
  };

  const cheapestPrice = prices.filter((p) => p.available).reduce(
    (min, p) => (p.price < min ? p.price : min),
    Infinity
  );

  const getPriceColor = (price: number) => {
    if (price === cheapestPrice) return Colors.success;
    if (price <= cheapestPrice * 1.2) return Colors.accent;
    if (price <= cheapestPrice * 1.5) return Colors.warning;
    return Colors.textSecondary;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Price Calendar</Text>
          {searchQuery.origin && searchQuery.destination && (
            <Text style={styles.headerRoute}>
              {searchQuery.origin.code} → {searchQuery.destination.code} · {getCabinClassLabel(searchQuery.cabinClass)}
            </Text>
          )}
        </View>
      </View>

      {!searchQuery.origin || !searchQuery.destination ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Select a Route First</Text>
          <Text style={styles.emptyText}>
            Set your departure and arrival airports on the search screen to view price calendar
          </Text>
          <TouchableOpacity style={styles.goSearchBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.goSearchText}>Go to Search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.legendText}>Cheapest</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
              <Text style={styles.legendText}>Good</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
              <Text style={styles.legendText}>Average</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.textSecondary }]} />
              <Text style={styles.legendText}>High</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
          ) : (
            <>
              {/* Calendar Grid */}
              <View style={styles.calendarCard}>
                <View style={styles.weekDays}>
                  {DAYS.map((d) => (
                    <View key={d} style={styles.weekDayCell}>
                      <Text style={styles.weekDayText}>{d}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.daysGrid}>
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.dayCell} />
                  ))}
                  {prices.map((dayPrice) => {
                    const day = new Date(dayPrice.date).getDate();
                    const isSelected = selectedDate?.date === dayPrice.date;
                    return (
                      <TouchableOpacity
                        key={dayPrice.date}
                        style={[
                          styles.dayCell,
                          isSelected && styles.dayCellSelected,
                          dayPrice.cheapest && styles.dayCellCheapest,
                        ]}
                        onPress={() => dayPrice.available && setSelectedDate(dayPrice)}
                        disabled={!dayPrice.available}
                      >
                        <Text
                          style={[
                            styles.dayNumber,
                            !dayPrice.available && styles.dayUnavailable,
                            isSelected && styles.dayNumberSelected,
                          ]}
                        >
                          {day}
                        </Text>
                        {dayPrice.available && (
                          <Text
                            style={[
                              styles.dayPrice,
                              { color: getPriceColor(dayPrice.price) },
                              isSelected && styles.dayPriceSelected,
                            ]}
                          >
                            ${Math.round(dayPrice.price / 1000)}k
                          </Text>
                        )}
                        {dayPrice.cheapest && (
                          <View style={styles.cheapestBadge}>
                            <Ionicons name="star" size={8} color={Colors.success} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Selected Date Details */}
              {selectedDate && (
                <View style={styles.selectedCard}>
                  <View style={styles.selectedInfo}>
                    <Text style={styles.selectedDate}>
                      {new Date(selectedDate.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.selectedPrice}>
                      {formatPrice(selectedDate.price)}
                    </Text>
                    {selectedDate.cheapest && (
                      <View style={styles.cheapestLabel}>
                        <Ionicons name="star" size={12} color={Colors.success} />
                        <Text style={styles.cheapestLabelText}>Cheapest day this month</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.searchDateButton}
                    onPress={() => {
                      updateSearch({ departureDate: selectedDate.date });
                      navigation.navigate('SearchTab');
                    }}
                  >
                    <Ionicons name="search" size={18} color={Colors.textInverse} />
                    <Text style={styles.searchDateText}>Search This Date</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>
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
  headerInfo: {},
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  headerRoute: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  navBtn: {
    padding: Spacing.sm,
  },
  monthLabel: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  calendarCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.md,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  weekDayText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    color: Colors.textTertiary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
    padding: 2,
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  dayCellCheapest: {
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
  },
  dayNumber: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.text,
  },
  dayUnavailable: {
    color: Colors.textTertiary,
    opacity: 0.4,
  },
  dayNumberSelected: {
    color: Colors.textInverse,
    fontWeight: FontWeights.bold,
  },
  dayPrice: {
    fontSize: 9,
    fontWeight: FontWeights.semibold,
  },
  dayPriceSelected: {
    color: Colors.textInverse,
  },
  cheapestBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  selectedCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadows.md,
  },
  selectedInfo: {
    marginBottom: Spacing.md,
  },
  selectedDate: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  selectedPrice: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  cheapestLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  cheapestLabelText: {
    fontSize: FontSizes.sm,
    color: Colors.success,
    fontWeight: FontWeights.medium,
  },
  searchDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchDateText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textInverse,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
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
  goSearchBtn: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
  },
  goSearchText: {
    color: Colors.textInverse,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.md,
  },
});
