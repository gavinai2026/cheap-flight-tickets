import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { checkVisa, getVisaLabel, PASSPORT_COUNTRIES, DESTINATION_COUNTRIES, VisaInfo } from '../constants/visaData';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';

export const VisaCheckScreen = ({ navigation, route }: any) => {
  const initialDest = route.params?.destinationCountry || '';
  const [passport, setPassport] = useState('United States');
  const [destination, setDestination] = useState(initialDest);
  const [result, setResult] = useState<VisaInfo | null>(initialDest ? checkVisa('United States', initialDest) : null);
  const [showPassportPicker, setShowPassportPicker] = useState(false);
  const [showDestPicker, setShowDestPicker] = useState(false);

  const handleCheck = () => {
    if (passport && destination) {
      setResult(checkVisa(passport, destination));
    }
  };

  const VisaLabel = result ? getVisaLabel(result.requirement) : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visa Requirements</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.picker} onPress={() => setShowPassportPicker(!showPassportPicker)}>
            <Ionicons name="document-outline" size={20} color={Colors.primary} />
            <View style={styles.pickerContent}>
              <Text style={styles.pickerLabel}>Passport</Text>
              <Text style={styles.pickerValue}>{passport || 'Select country'}</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          {showPassportPicker && (
            <View style={styles.optionsList}>
              {PASSPORT_COUNTRIES.map((c) => (
                <TouchableOpacity key={c} style={styles.option} onPress={() => { setPassport(c); setShowPassportPicker(false); }}>
                  <Text style={[styles.optionText, passport === c && styles.optionSelected]}>{c}</Text>
                  {passport === c && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.picker} onPress={() => setShowDestPicker(!showDestPicker)}>
            <Ionicons name="globe-outline" size={20} color={Colors.secondary} />
            <View style={styles.pickerContent}>
              <Text style={styles.pickerLabel}>Destination</Text>
              <Text style={styles.pickerValue}>{destination || 'Select country'}</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          {showDestPicker && (
            <View style={styles.optionsList}>
              {DESTINATION_COUNTRIES.map((c) => (
                <TouchableOpacity key={c} style={styles.option} onPress={() => { setDestination(c); setShowDestPicker(false); }}>
                  <Text style={[styles.optionText, destination === c && styles.optionSelected]}>{c}</Text>
                  {destination === c && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.checkButton} onPress={handleCheck} disabled={!passport || !destination}>
            <Ionicons name="search" size={18} color={Colors.textInverse} />
            <Text style={styles.checkButtonText}>Check Requirements</Text>
          </TouchableOpacity>
        </View>

        {result && VisaLabel && (
          <View style={styles.resultCard}>
            <View style={[styles.resultBadge, { backgroundColor: VisaLabel.color + '20' }]}>
              <Ionicons
                name={result.requirement === 'visa_free' ? 'checkmark-circle' : result.requirement === 'visa_required' ? 'alert-circle' : 'information-circle'}
                size={28}
                color={VisaLabel.color}
              />
              <Text style={[styles.resultTitle, { color: VisaLabel.color }]}>{VisaLabel.label}</Text>
            </View>

            <View style={styles.resultDetails}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Maximum Stay</Text>
                <Text style={styles.resultValue}>{result.maxStay}</Text>
              </View>
              {result.notes ? (
                <View style={styles.notesBox}>
                  <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
                  <Text style={styles.notesText}>{result.notes}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                Visa requirements may change. Always verify with the embassy or consulate before traveling.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: Spacing.md, paddingHorizontal: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.md },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text },
  content: { padding: Spacing.lg },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.md, gap: Spacing.md },
  picker: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  pickerContent: { flex: 1 },
  pickerLabel: { fontSize: FontSizes.xs, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  pickerValue: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text },
  optionsList: { maxHeight: 200, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, overflow: 'hidden' },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  optionText: { fontSize: FontSizes.md, color: Colors.text },
  optionSelected: { color: Colors.primary, fontWeight: FontWeights.bold },
  checkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, gap: Spacing.sm },
  checkButtonText: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.textInverse },
  resultCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadows.md },
  resultBadge: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, gap: Spacing.md, marginBottom: Spacing.lg },
  resultTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold },
  resultDetails: { gap: Spacing.md },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  resultLabel: { fontSize: FontSizes.md, color: Colors.textSecondary },
  resultValue: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text },
  notesBox: { flexDirection: 'row', backgroundColor: Colors.infoLight, padding: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.sm },
  notesText: { flex: 1, fontSize: FontSizes.sm, color: Colors.info },
  disclaimer: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  disclaimerText: { fontSize: FontSizes.xs, color: Colors.textTertiary, textAlign: 'center', fontStyle: 'italic' },
});
