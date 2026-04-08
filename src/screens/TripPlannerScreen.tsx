import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTrip } from '../context/TripContext';
import { TripTimeline } from '../components/TripTimeline';
import { Trip, TripItemType } from '../types/trip';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';
import { formatPrice } from '../utils/helpers';

const ITEM_TYPES: { type: TripItemType; icon: string; label: string; color: string }[] = [
  { type: 'flight', icon: 'airplane', label: 'Flight', color: Colors.primary },
  { type: 'hotel', icon: 'bed', label: 'Hotel', color: '#8B5CF6' },
  { type: 'transport', icon: 'car', label: 'Transport', color: '#F59E0B' },
  { type: 'activity', icon: 'flag', label: 'Activity', color: '#10B981' },
  { type: 'note', icon: 'document-text', label: 'Note', color: Colors.textSecondary },
];

export const TripPlannerScreen = ({ navigation }: any) => {
  const { state, createTrip, deleteTrip, setActiveTrip, addItem, removeItem, getTotalCost } = useTrip();
  const { trips, activeTrip } = state;

  const [showNewTrip, setShowNewTrip] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newTripDest, setNewTripDest] = useState('');
  const [newItemType, setNewItemType] = useState<TripItemType>('flight');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemSubtitle, setNewItemSubtitle] = useState('');
  const [newItemLocation, setNewItemLocation] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');

  const handleCreateTrip = () => {
    if (!newTripName.trim() || !newTripDest.trim()) return;
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);
    createTrip(newTripName.trim(), newTripDest.trim(), today.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
    setNewTripName('');
    setNewTripDest('');
    setShowNewTrip(false);
  };

  const handleAddItem = () => {
    if (!activeTrip || !newItemTitle.trim()) return;
    const dayDate = activeTrip.startDate;
    addItem(activeTrip.id, dayDate, {
      type: newItemType,
      title: newItemTitle.trim(),
      subtitle: newItemSubtitle.trim() || undefined,
      location: newItemLocation.trim() || undefined,
      cost: newItemCost ? parseFloat(newItemCost) : undefined,
      notes: newItemNotes.trim() || undefined,
    });
    setNewItemTitle('');
    setNewItemSubtitle('');
    setNewItemLocation('');
    setNewItemCost('');
    setNewItemNotes('');
    setShowAddItem(false);
  };

  // Trip List View
  if (!activeTrip) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trip Planner</Text>
          <TouchableOpacity onPress={() => setShowNewTrip(true)}>
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {trips.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="map-outline" size={64} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Trips Yet</Text>
              <Text style={styles.emptyText}>Create a trip to organize your flights, hotels, and activities.</Text>
              <TouchableOpacity style={styles.createButton} onPress={() => setShowNewTrip(true)}>
                <Ionicons name="add" size={20} color={Colors.textInverse} />
                <Text style={styles.createButtonText}>Create Trip</Text>
              </TouchableOpacity>
            </View>
          ) : (
            trips.map((trip) => (
              <TouchableOpacity key={trip.id} style={styles.tripCard} onPress={() => setActiveTrip(trip.id)}>
                <View style={styles.tripHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tripName}>{trip.name}</Text>
                    <Text style={styles.tripDest}>{trip.destination}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteTrip(trip.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
                <View style={styles.tripMeta}>
                  <View style={styles.tripMetaItem}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.tripMetaText}>{trip.startDate} → {trip.endDate}</Text>
                  </View>
                  <View style={styles.tripMetaItem}>
                    <Ionicons name="list-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.tripMetaText}>{trip.days.reduce((c, d) => c + d.items.length, 0)} items</Text>
                  </View>
                  {getTotalCost(trip) > 0 && (
                    <View style={styles.tripMetaItem}>
                      <Text style={styles.tripCost}>{formatPrice(getTotalCost(trip))}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* New Trip Modal */}
        <Modal visible={showNewTrip} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Trip</Text>
              <TextInput style={styles.modalInput} placeholder="Trip name (e.g. Dubai Getaway)" placeholderTextColor={Colors.textTertiary} value={newTripName} onChangeText={setNewTripName} />
              <TextInput style={styles.modalInput} placeholder="Destination" placeholderTextColor={Colors.textTertiary} value={newTripDest} onChangeText={setNewTripDest} />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setShowNewTrip(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirm} onPress={handleCreateTrip}>
                  <Text style={styles.modalConfirmText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Active Trip Detail View
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setActiveTrip(null)}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{activeTrip.name}</Text>
          <Text style={styles.headerSubtitle}>{activeTrip.destination}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAddItem(true)}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Budget Summary */}
      {getTotalCost(activeTrip) > 0 && (
        <View style={styles.budgetBar}>
          <Ionicons name="wallet-outline" size={16} color={Colors.primary} />
          <Text style={styles.budgetText}>Total: {formatPrice(getTotalCost(activeTrip))}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        <TripTimeline
          days={activeTrip.days}
          onDeleteItem={(dayDate, itemId) => removeItem(activeTrip.id, dayDate, itemId)}
        />
      </ScrollView>

      {/* Add Item Modal */}
      <Modal visible={showAddItem} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Item</Text>

            <View style={styles.typeRow}>
              {ITEM_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.type}
                  style={[styles.typeChip, newItemType === t.type && { backgroundColor: t.color + '20', borderColor: t.color }]}
                  onPress={() => setNewItemType(t.type)}
                >
                  <Ionicons name={t.icon as any} size={14} color={newItemType === t.type ? t.color : Colors.textTertiary} />
                  <Text style={[styles.typeChipText, newItemType === t.type && { color: t.color }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={styles.modalInput} placeholder="Title *" placeholderTextColor={Colors.textTertiary} value={newItemTitle} onChangeText={setNewItemTitle} />
            <TextInput style={styles.modalInput} placeholder="Details (optional)" placeholderTextColor={Colors.textTertiary} value={newItemSubtitle} onChangeText={setNewItemSubtitle} />
            <TextInput style={styles.modalInput} placeholder="Location (optional)" placeholderTextColor={Colors.textTertiary} value={newItemLocation} onChangeText={setNewItemLocation} />
            <TextInput style={styles.modalInput} placeholder="Cost (optional)" placeholderTextColor={Colors.textTertiary} value={newItemCost} onChangeText={setNewItemCost} keyboardType="numeric" />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAddItem(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleAddItem}>
                <Text style={styles.modalConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: Spacing.md, paddingHorizontal: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.md },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text },
  headerSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  content: { padding: Spacing.lg },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text, marginTop: Spacing.lg },
  emptyText: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, paddingHorizontal: Spacing.xl },
  createButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, gap: Spacing.sm, marginTop: Spacing.xl },
  createButtonText: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.textInverse },
  tripCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.md },
  tripHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  tripName: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text },
  tripDest: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  tripMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  tripMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tripMetaText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  tripCost: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.primary },
  budgetBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight, paddingVertical: Spacing.sm, gap: Spacing.sm },
  budgetText: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl, padding: Spacing.xl, paddingBottom: 40 },
  modalTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.lg },
  modalInput: { backgroundColor: Colors.background, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: FontSizes.md, color: Colors.text, marginBottom: Spacing.sm },
  modalButtons: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  modalCancel: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  modalCancelText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.textSecondary },
  modalConfirm: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary, alignItems: 'center' },
  modalConfirmText: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.textInverse },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  typeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  typeChipText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, color: Colors.textTertiary },
});
