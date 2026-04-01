import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../constants/theme';

interface SettingItemProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
  rightComponent,
}) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress && !rightComponent}>
    <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
      <Ionicons name={icon as any} size={20} color={iconColor} />
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {rightComponent || (onPress && <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />)}
  </TouchableOpacity>
);

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'SGD', 'AED'];

export const ProfileScreen = ({ navigation }: any) => {
  const { state, updatePreferences } = useApp();
  const { preferences } = state;

  const handleCurrencyChange = () => {
    const currentIndex = CURRENCIES.indexOf(preferences.currency);
    const nextIndex = (currentIndex + 1) % CURRENCIES.length;
    updatePreferences({ currency: CURRENCIES[nextIndex] });
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all saved searches, favorites, and price alerts. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // In a real app, clear AsyncStorage
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{state.savedSearches.length}</Text>
            <Text style={styles.statLabel}>Saved Searches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{state.priceAlerts.length}</Text>
            <Text style={styles.statLabel}>Price Alerts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{state.favorites.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="cash-outline"
            iconColor={Colors.success}
            iconBg={Colors.successLight}
            title="Currency"
            subtitle={preferences.currency}
            onPress={handleCurrencyChange}
          />
          <SettingItem
            icon="notifications-outline"
            iconColor={Colors.warning}
            iconBg={Colors.warningLight}
            title="Push Notifications"
            subtitle="Get notified about price drops"
            rightComponent={
              <Switch
                value={preferences.notifications}
                onValueChange={(v) => updatePreferences({ notifications: v })}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={preferences.notifications ? Colors.primary : Colors.textTertiary}
              />
            }
          />
          <SettingItem
            icon="moon-outline"
            iconColor={Colors.premium}
            iconBg={Colors.premiumBg}
            title="Dark Mode"
            subtitle="Coming soon"
            rightComponent={
              <Switch
                value={preferences.darkMode}
                onValueChange={(v) => updatePreferences({ darkMode: v })}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={preferences.darkMode ? Colors.primary : Colors.textTertiary}
              />
            }
          />
        </View>

        {/* Search Defaults */}
        <Text style={styles.sectionTitle}>Search Defaults</Text>
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="airplane-outline"
            iconColor={Colors.primary}
            iconBg={Colors.businessBg}
            title="Home Airport"
            subtitle={preferences.homeAirport?.code || 'Not set'}
            onPress={() => {}}
          />
          <SettingItem
            icon="star-outline"
            iconColor={Colors.first}
            iconBg={Colors.firstBg}
            title="Preferred Airlines"
            subtitle={
              preferences.preferredAirlines.length > 0
                ? `${preferences.preferredAirlines.length} selected`
                : 'None selected'
            }
            onPress={() => {}}
          />
          <SettingItem
            icon="globe-outline"
            iconColor={Colors.accent}
            iconBg={Colors.accentLight + '30'}
            title="Preferred Alliance"
            subtitle={preferences.preferredAlliance || 'Any alliance'}
            onPress={() => {}}
          />
        </View>

        {/* Data & Privacy */}
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="download-outline"
            iconColor={Colors.info}
            iconBg={Colors.infoLight}
            title="Export Data"
            subtitle="Download your saved data"
            onPress={() => Alert.alert('Export', 'Export feature coming soon.')}
          />
          <SettingItem
            icon="trash-outline"
            iconColor={Colors.error}
            iconBg={Colors.errorLight}
            title="Clear All Data"
            subtitle="Remove all saved searches and alerts"
            onPress={handleClearData}
          />
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="information-circle-outline"
            iconColor={Colors.textSecondary}
            iconBg={Colors.background}
            title="Version"
            subtitle="1.0.0"
          />
          <SettingItem
            icon="document-text-outline"
            iconColor={Colors.textSecondary}
            iconBg={Colors.background}
            title="Terms of Service"
            onPress={() => {}}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            iconColor={Colors.textSecondary}
            iconBg={Colors.background}
            title="Privacy Policy"
            onPress={() => {}}
          />
          <SettingItem
            icon="mail-outline"
            iconColor={Colors.textSecondary}
            iconBg={Colors.background}
            title="Contact Support"
            subtitle="help@premiumflights.app"
            onPress={() => {}}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            PremiumFlights - Find the best business & first class deals worldwide
          </Text>
          <Text style={styles.footerVersion}>Made with care for premium travelers</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 55,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
    ...Shadows.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  settingsGroup: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.text,
  },
  settingSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  footerVersion: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
});
