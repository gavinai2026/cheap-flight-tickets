import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Airport } from '../types';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/theme';

export interface FlightLeg {
  origin: Airport | null;
  destination: Airport | null;
  departureDate: string;
}

interface Props {
  legs: FlightLeg[];
  onLegPress: (index: number, field: 'origin' | 'destination' | 'date') => void;
  onAddLeg: () => void;
  onRemoveLeg: (index: number) => void;
}

export const MultiCityInput: React.FC<Props> = ({ legs, onLegPress, onAddLeg, onRemoveLeg }) => {
  return (
    <View style={styles.container}>
      {legs.map((leg, index) => (
        <View key={index} style={styles.legCard}>
          <View style={styles.legHeader}>
            <Text style={styles.legLabel}>Flight {index + 1}</Text>
            {legs.length > 2 && (
              <TouchableOpacity onPress={() => onRemoveLeg(index)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={20} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.legFields}>
            <TouchableOpacity style={styles.fieldButton} onPress={() => onLegPress(index, 'origin')}>
              <Ionicons name="airplane-outline" size={16} color={Colors.primary} />
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>From</Text>
                <Text style={[styles.fieldValue, !leg.origin && styles.fieldPlaceholder]}>
                  {leg.origin ? `${leg.origin.city} (${leg.origin.code})` : 'Select airport'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.fieldButton} onPress={() => onLegPress(index, 'destination')}>
              <Ionicons name="location-outline" size={16} color={Colors.secondary} />
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>To</Text>
                <Text style={[styles.fieldValue, !leg.destination && styles.fieldPlaceholder]}>
                  {leg.destination ? `${leg.destination.city} (${leg.destination.code})` : 'Select airport'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.fieldButton} onPress={() => onLegPress(index, 'date')}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Date</Text>
                <Text style={[styles.fieldValue, !leg.departureDate && styles.fieldPlaceholder]}>
                  {leg.departureDate || 'Select date'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {index < legs.length - 1 && (
            <View style={styles.connector}>
              <View style={styles.connectorLine} />
              <Ionicons name="arrow-down" size={14} color={Colors.textTertiary} />
              <View style={styles.connectorLine} />
            </View>
          )}
        </View>
      ))}

      {legs.length < 6 && (
        <TouchableOpacity style={styles.addButton} onPress={onAddLeg}>
          <Ionicons name="add" size={18} color={Colors.primary} />
          <Text style={styles.addButtonText}>Add Flight</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  legCard: { marginBottom: Spacing.xs },
  legHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  legLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  legFields: { gap: Spacing.xs },
  fieldButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: Spacing.md, gap: Spacing.sm },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  fieldValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text },
  fieldPlaceholder: { color: Colors.textTertiary, fontWeight: FontWeights.regular },
  connector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xs },
  connectorLine: { width: 20, height: 1, backgroundColor: Colors.border },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.primary, borderStyle: 'dashed', gap: Spacing.xs, marginTop: Spacing.sm },
  addButtonText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.primary },
});
