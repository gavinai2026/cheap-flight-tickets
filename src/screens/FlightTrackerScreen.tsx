import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFlightStatus, FlightStatus } from '../services/api/aviationstack';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';

const STATUS_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  scheduled: { icon: 'time-outline', color: Colors.info, label: 'Scheduled' },
  active: { icon: 'airplane', color: Colors.success, label: 'In Flight' },
  landed: { icon: 'checkmark-circle', color: Colors.success, label: 'Landed' },
  cancelled: { icon: 'close-circle', color: Colors.error, label: 'Cancelled' },
  incident: { icon: 'warning', color: Colors.error, label: 'Incident' },
  diverted: { icon: 'git-branch', color: Colors.warning, label: 'Diverted' },
  unknown: { icon: 'help-circle', color: Colors.textTertiary, label: 'Unknown' },
};

export const FlightTrackerScreen = ({ navigation }: any) => {
  const [flightNumber, setFlightNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FlightStatus | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!flightNumber.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    const status = await getFlightStatus(flightNumber.trim().toUpperCase());
    if (status) {
      setResult(status);
    } else {
      setError(`No flight data found for ${flightNumber.toUpperCase()}. Try a valid flight number like EK215 or SQ321.`);
    }
    setLoading(false);
  };

  const statusConfig = result ? STATUS_CONFIG[result.status] || STATUS_CONFIG.unknown : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flight Tracker</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>Enter Flight Number</Text>
          <View style={styles.searchRow}>
            <View style={styles.inputContainer}>
              <Ionicons name="airplane" size={18} color={Colors.primary} />
              <TextInput
                style={styles.input}
                placeholder="e.g. EK215, SQ321"
                placeholderTextColor={Colors.textTertiary}
                value={flightNumber}
                onChangeText={setFlightNumber}
                autoCapitalize="characters"
                returnKeyType="search"
                onSubmitEditing={handleTrack}
              />
            </View>
            <TouchableOpacity style={styles.trackButton} onPress={handleTrack} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.textInverse} /> : <Ionicons name="search" size={20} color={Colors.textInverse} />}
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={20} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {result && statusConfig && (
          <>
            <View style={styles.statusCard}>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
                <Ionicons name={statusConfig.icon as any} size={24} color={statusConfig.color} />
                <View>
                  <Text style={[styles.statusLabel, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                  <Text style={styles.flightNumber}>{result.flightNumber} - {result.airline}</Text>
                </View>
              </View>
            </View>

            <View style={styles.routeCard}>
              <View style={styles.routePoint}>
                <View style={styles.dot} />
                <View style={styles.routeInfo}>
                  <Text style={styles.routeAirport}>{result.departure.iata}</Text>
                  <Text style={styles.routeName}>{result.departure.airport}</Text>
                  <View style={styles.timeRow}>
                    <Text style={styles.timeLabel}>Scheduled:</Text>
                    <Text style={styles.timeValue}>{result.departure.scheduled ? new Date(result.departure.scheduled).toLocaleTimeString() : 'N/A'}</Text>
                  </View>
                  {result.departure.actual && (
                    <View style={styles.timeRow}>
                      <Text style={styles.timeLabel}>Actual:</Text>
                      <Text style={[styles.timeValue, { color: Colors.success }]}>{new Date(result.departure.actual).toLocaleTimeString()}</Text>
                    </View>
                  )}
                  {result.departure.delay && result.departure.delay > 0 && (
                    <View style={styles.delayBadge}>
                      <Text style={styles.delayText}>Delayed {result.departure.delay} min</Text>
                    </View>
                  )}
                  {result.departure.terminal && <Text style={styles.terminal}>Terminal {result.departure.terminal} {result.departure.gate ? `- Gate ${result.departure.gate}` : ''}</Text>}
                </View>
              </View>

              <View style={styles.routeLine} />

              <View style={styles.routePoint}>
                <View style={[styles.dot, styles.dotFilled]} />
                <View style={styles.routeInfo}>
                  <Text style={styles.routeAirport}>{result.arrival.iata}</Text>
                  <Text style={styles.routeName}>{result.arrival.airport}</Text>
                  <View style={styles.timeRow}>
                    <Text style={styles.timeLabel}>Scheduled:</Text>
                    <Text style={styles.timeValue}>{result.arrival.scheduled ? new Date(result.arrival.scheduled).toLocaleTimeString() : 'N/A'}</Text>
                  </View>
                  {result.arrival.actual && (
                    <View style={styles.timeRow}>
                      <Text style={styles.timeLabel}>Actual:</Text>
                      <Text style={[styles.timeValue, { color: Colors.success }]}>{new Date(result.arrival.actual).toLocaleTimeString()}</Text>
                    </View>
                  )}
                  {result.arrival.terminal && <Text style={styles.terminal}>Terminal {result.arrival.terminal} {result.arrival.gate ? `- Gate ${result.arrival.gate}` : ''}</Text>}
                </View>
              </View>
            </View>

            {result.live && (
              <View style={styles.liveCard}>
                <View style={styles.liveHeader}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveTitle}>Live Tracking</Text>
                </View>
                <View style={styles.liveGrid}>
                  <View style={styles.liveItem}>
                    <Text style={styles.liveLabel}>Altitude</Text>
                    <Text style={styles.liveValue}>{result.live.altitude ? `${Math.round(result.live.altitude)} ft` : 'N/A'}</Text>
                  </View>
                  <View style={styles.liveItem}>
                    <Text style={styles.liveLabel}>Speed</Text>
                    <Text style={styles.liveValue}>{result.live.speed ? `${Math.round(result.live.speed)} km/h` : 'N/A'}</Text>
                  </View>
                  <View style={styles.liveItem}>
                    <Text style={styles.liveLabel}>Status</Text>
                    <Text style={styles.liveValue}>{result.live.isGround ? 'On Ground' : 'Airborne'}</Text>
                  </View>
                </View>
              </View>
            )}
          </>
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
  searchCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.md },
  searchLabel: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text, marginBottom: Spacing.md },
  searchRow: { flexDirection: 'row', gap: Spacing.sm },
  inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  input: { flex: 1, fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, paddingVertical: Spacing.md },
  trackButton: { width: 48, height: 48, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  errorCard: { flexDirection: 'row', backgroundColor: Colors.errorLight, padding: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.sm, marginBottom: Spacing.md },
  errorText: { flex: 1, fontSize: FontSizes.sm, color: Colors.error },
  statusCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.md },
  statusBadge: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, gap: Spacing.md },
  statusLabel: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  flightNumber: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  routeCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.md },
  routePoint: { flexDirection: 'row', gap: Spacing.md },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: Colors.primary, backgroundColor: Colors.surface, marginTop: 4 },
  dotFilled: { backgroundColor: Colors.primary },
  routeInfo: { flex: 1 },
  routeAirport: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.text },
  routeName: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  timeRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 2 },
  timeLabel: { fontSize: FontSizes.sm, color: Colors.textTertiary, width: 75 },
  timeValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.text },
  delayBadge: { backgroundColor: Colors.errorLight, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm, alignSelf: 'flex-start', marginTop: Spacing.xs },
  delayText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: Colors.error },
  terminal: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  routeLine: { width: 2, height: 30, backgroundColor: Colors.primary + '30', marginLeft: 6, marginVertical: Spacing.sm },
  liveCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadows.md },
  liveHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success },
  liveTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text },
  liveGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  liveItem: { alignItems: 'center' },
  liveLabel: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  liveValue: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.text, marginTop: 2 },
});
