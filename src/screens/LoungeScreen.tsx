import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLoungesByAirport, Lounge } from '../constants/lounges';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';

export const LoungeScreen = ({ navigation, route }: any) => {
  const airportCode = route.params?.airportCode || '';
  const airportName = route.params?.airportName || airportCode;
  const lounges = getLoungesByAirport(airportCode);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const renderLounge = ({ item }: { item: Lounge }) => {
    const isExpanded = expandedId === item.id;
    return (
      <TouchableOpacity style={styles.card} onPress={() => setExpandedId(isExpanded ? null : item.id)} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.loungeName}>{item.name}</Text>
            <Text style={styles.loungeLocation}>{item.terminal} - {item.location}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={Colors.warning} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.hoursRow}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.hoursText}>{item.hours}</Text>
        </View>

        <View style={styles.accessSection}>
          <Text style={styles.sectionLabel}>Access</Text>
          <View style={styles.tagRow}>
            {item.accessRules.map((rule, i) => (
              <View key={i} style={styles.accessTag}>
                <Text style={styles.accessTagText}>{rule}</Text>
              </View>
            ))}
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedSection}>
            <Text style={styles.sectionLabel}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {item.amenities.map((amenity, i) => (
                <View key={i} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.expandHint}>
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textTertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Airport Lounges</Text>
          <Text style={styles.headerSubtitle}>{airportName} ({airportCode})</Text>
        </View>
      </View>

      <FlatList
        data={lounges}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderLounge}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="wine-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Lounge Data</Text>
            <Text style={styles.emptyText}>Lounge information not available for this airport yet.</Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.infoBar}>
            <Ionicons name="information-circle" size={16} color={Colors.info} />
            <Text style={styles.infoText}>{lounges.length} lounge{lounges.length !== 1 ? 's' : ''} at this airport</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: Spacing.md, paddingHorizontal: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.md },
  headerInfo: {},
  headerTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text },
  headerSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  infoBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.infoLight, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md, gap: Spacing.sm },
  infoText: { fontSize: FontSizes.sm, color: Colors.info },
  listContent: { padding: Spacing.lg },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  cardHeaderLeft: { flex: 1, marginRight: Spacing.md },
  loungeName: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text },
  loungeLocation: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.warningLight, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.md, gap: 3 },
  ratingText: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.warning },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md },
  hoursText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  accessSection: { marginBottom: Spacing.sm },
  sectionLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  accessTag: { backgroundColor: Colors.premiumBg, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  accessTagText: { fontSize: FontSizes.xs, fontWeight: FontWeights.medium, color: Colors.premium },
  expandedSection: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  amenitiesGrid: { gap: Spacing.xs },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  amenityText: { fontSize: FontSizes.sm, color: Colors.text },
  expandHint: { alignItems: 'center', marginTop: Spacing.sm },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text, marginTop: Spacing.lg },
  emptyText: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
});
