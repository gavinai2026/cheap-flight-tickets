import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';
import { formatPrice, formatDate, getCabinClassLabel } from '../utils/helpers';
import { PriceAlert } from '../types';

export const AlertsScreen = ({ navigation }: any) => {
  const { state, togglePriceAlert, removePriceAlert } = useApp();
  const { priceAlerts } = state;

  const handleDelete = (alert: PriceAlert) => {
    Alert.alert('Delete Alert', 'Are you sure you want to remove this price alert?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removePriceAlert(alert.id) },
    ]);
  };

  const renderAlert = ({ item }: { item: PriceAlert }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={styles.routeRow}>
          <Text style={styles.routeText}>
            {item.searchQuery.origin?.code} → {item.searchQuery.destination?.code}
          </Text>
          <View
            style={[
              styles.cabinBadge,
              item.searchQuery.cabinClass === 'first' ? styles.firstBadge : styles.businessBadge,
            ]}
          >
            <Text
              style={[
                styles.cabinText,
                item.searchQuery.cabinClass === 'first' ? styles.firstText : styles.businessText,
              ]}
            >
              {getCabinClassLabel(item.searchQuery.cabinClass)}
            </Text>
          </View>
        </View>
        <Switch
          value={item.isActive}
          onValueChange={() => togglePriceAlert(item.id)}
          trackColor={{ false: Colors.border, true: Colors.primaryLight }}
          thumbColor={item.isActive ? Colors.primary : Colors.textTertiary}
        />
      </View>

      <View style={styles.alertBody}>
        <View style={styles.priceInfo}>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>Target Price</Text>
            <Text style={styles.priceValue}>{formatPrice(item.targetPrice)}</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={Colors.textTertiary} />
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>Current Low</Text>
            <Text
              style={[
                styles.priceValue,
                item.currentLowestPrice <= item.targetPrice
                  ? styles.priceGood
                  : styles.priceBad,
              ]}
            >
              {item.currentLowestPrice > 0 ? formatPrice(item.currentLowestPrice) : 'Checking...'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{formatDate(item.searchQuery.departureDate)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
            <Text style={styles.metaText}>
              Created {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.alertActions}>
        <TouchableOpacity
          style={styles.searchAction}
          onPress={() => {
            navigation.navigate('SearchTab');
          }}
        >
          <Ionicons name="search" size={14} color={Colors.primary} />
          <Text style={styles.searchActionText}>Search Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={14} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Price Alerts</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {priceAlerts.filter((a) => a.isActive).length} active
          </Text>
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={18} color={Colors.info} />
        <Text style={styles.infoText}>
          We check prices every hour and notify you when fares drop below your target.
        </Text>
      </View>

      <FlatList
        data={priceAlerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderAlert}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Price Alerts</Text>
            <Text style={styles.emptyText}>
              Set alerts on flights to get notified when prices drop. Search for flights and tap the
              bell icon to create an alert.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('SearchTab')}
            >
              <Text style={styles.emptyButtonText}>Search Flights</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  headerBadge: {
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  headerBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoLight,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.info,
  },
  listContent: {
    padding: Spacing.lg,
  },
  alertCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  routeRow: {
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
  cabinText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
  businessText: {
    color: Colors.business,
  },
  firstText: {
    color: Colors.first,
  },
  alertBody: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  priceColumn: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  priceGood: {
    color: Colors.success,
  },
  priceBad: {
    color: Colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
  },
  searchAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  searchActionText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  deleteAction: {
    padding: Spacing.sm,
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
  emptyButton: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
  },
  emptyButtonText: {
    color: Colors.textInverse,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.md,
  },
});
