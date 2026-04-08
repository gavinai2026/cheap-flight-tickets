import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TripDay, TripItem, TripItemType } from '../types/trip';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/theme';

const TYPE_CONFIG: Record<TripItemType, { icon: string; color: string }> = {
  flight: { icon: 'airplane', color: Colors.primary },
  hotel: { icon: 'bed', color: '#8B5CF6' },
  transport: { icon: 'car', color: '#F59E0B' },
  activity: { icon: 'flag', color: '#10B981' },
  note: { icon: 'document-text', color: Colors.textSecondary },
};

interface Props {
  days: TripDay[];
  onItemPress?: (dayDate: string, item: TripItem) => void;
  onDeleteItem?: (dayDate: string, itemId: string) => void;
}

const formatDayHeader = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatItemTime = (isoStr?: string): string => {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const TripTimeline: React.FC<Props> = ({ days, onItemPress, onDeleteItem }) => {
  if (days.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="calendar-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.emptyTitle}>No items yet</Text>
        <Text style={styles.emptyText}>Add flights, hotels, activities and more to your trip.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {days.map((day, dayIndex) => (
        <View key={day.date} style={styles.dayBlock}>
          <View style={styles.dayHeader}>
            <View style={styles.dayDot} />
            <Text style={styles.dayDate}>{formatDayHeader(day.date)}</Text>
            <Text style={styles.dayLabel}>Day {dayIndex + 1}</Text>
          </View>

          <View style={styles.dayItems}>
            {day.items.map((item, itemIndex) => {
              const config = TYPE_CONFIG[item.type];
              const isLast = itemIndex === day.items.length - 1 && dayIndex === days.length - 1;
              return (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.timelineTrack}>
                    <View style={[styles.itemDot, { backgroundColor: config.color }]}>
                      <Ionicons name={config.icon as any} size={10} color="#FFF" />
                    </View>
                    {!isLast && <View style={styles.itemLine} />}
                  </View>

                  <TouchableOpacity
                    style={styles.itemCard}
                    onPress={() => onItemPress?.(day.date, item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                      {onDeleteItem && (
                        <TouchableOpacity onPress={() => onDeleteItem(day.date, item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                          <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
                        </TouchableOpacity>
                      )}
                    </View>
                    {item.subtitle && <Text style={styles.itemSubtitle} numberOfLines={1}>{item.subtitle}</Text>}
                    <View style={styles.itemMeta}>
                      {item.startTime && (
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
                          <Text style={styles.metaText}>{formatItemTime(item.startTime)}{item.endTime ? ` - ${formatItemTime(item.endTime)}` : ''}</Text>
                        </View>
                      )}
                      {item.location && (
                        <View style={styles.metaItem}>
                          <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
                          <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
                        </View>
                      )}
                      {item.cost != null && item.cost > 0 && (
                        <View style={styles.metaItem}>
                          <Text style={styles.costText}>${item.cost.toFixed(0)}</Text>
                        </View>
                      )}
                    </View>
                    {item.confirmationCode && (
                      <View style={styles.confirmRow}>
                        <Text style={styles.confirmLabel}>Conf:</Text>
                        <Text style={styles.confirmCode}>{item.confirmationCode}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginTop: Spacing.md },
  emptyText: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xs, paddingHorizontal: Spacing.xl },
  dayBlock: { marginBottom: Spacing.md },
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  dayDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  dayDate: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text },
  dayLabel: { fontSize: FontSizes.xs, color: Colors.textTertiary, backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  dayItems: { marginLeft: 4 },
  itemRow: { flexDirection: 'row' },
  timelineTrack: { width: 24, alignItems: 'center' },
  itemDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemLine: { width: 2, flex: 1, backgroundColor: Colors.border, marginVertical: 2 },
  itemCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginLeft: Spacing.sm, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.borderLight },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, flex: 1 },
  itemSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  itemMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  costText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: Colors.primary },
  confirmRow: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.xs },
  confirmLabel: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  confirmCode: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: Colors.text },
});
