import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Airport } from '../types';
import { searchAirports } from '../constants/airports';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/theme';

interface Props {
  label: string;
  value: Airport | null;
  onSelect: (airport: Airport) => void;
  placeholder?: string;
}

export const AirportSearch: React.FC<Props> = ({ label, value, onSelect, placeholder }) => {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Airport[]>([]);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    setResults(searchAirports(text));
  }, []);

  const handleSelect = (airport: Airport) => {
    onSelect(airport);
    setVisible(false);
    setQuery('');
    setResults([]);
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
        <View style={styles.triggerIcon}>
          <Ionicons name="airplane" size={18} color={Colors.primary} />
        </View>
        <View style={styles.triggerContent}>
          <Text style={styles.label}>{label}</Text>
          {value ? (
            <View>
              <Text style={styles.airportCode}>{value.code}</Text>
              <Text style={styles.airportCity} numberOfLines={1}>
                {value.city}, {value.country}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholder}>{placeholder || 'Select airport'}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search city, airport, or code..."
              placeholderTextColor={Colors.textTertiary}
              value={query}
              onChangeText={handleSearch}
              autoFocus
              autoCapitalize="none"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={results}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
                <View style={styles.resultCodeContainer}>
                  <Text style={styles.resultCode}>{item.code}</Text>
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.resultCity}>
                    {item.city}, {item.country}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name={query.length > 0 ? 'search' : 'globe-outline'}
                  size={48}
                  color={Colors.textTertiary}
                />
                <Text style={styles.emptyText}>
                  {query.length > 0
                    ? 'No airports found'
                    : 'Start typing to search airports worldwide'}
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  triggerIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.businessBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  triggerContent: {
    flex: 1,
  },
  label: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  airportCode: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  airportCity: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  placeholder: {
    fontSize: FontSizes.lg,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSizes.lg,
    color: Colors.text,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: 1,
  },
  resultCodeContainer: {
    width: 52,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryLight + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  resultCode: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.text,
  },
  resultCity: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textTertiary,
    marginTop: Spacing.lg,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
});
