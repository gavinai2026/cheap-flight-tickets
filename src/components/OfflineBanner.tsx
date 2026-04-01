import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToNetwork, NetworkStatus } from '../services/networkMonitor';
import { Colors, Spacing, FontSizes, FontWeights } from '../constants/theme';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    let wasOffline = false;

    const unsubscribe = subscribeToNetwork((status: NetworkStatus) => {
      if (!status.isConnected && !isOffline) {
        setIsOffline(true);
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        wasOffline = true;
      } else if (status.isConnected && wasOffline) {
        setIsOffline(false);
        setShowRestored(true);
        setTimeout(() => {
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
            setShowRestored(false);
          });
        }, 2000);
        wasOffline = false;
      }
    });

    return unsubscribe;
  }, []);

  if (!isOffline && !showRestored) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        isOffline ? styles.offlineBanner : styles.restoredBanner,
        { opacity },
      ]}
    >
      <Ionicons
        name={isOffline ? 'cloud-offline-outline' : 'checkmark-circle'}
        size={16}
        color={Colors.textInverse}
      />
      <Text style={styles.text}>
        {isOffline ? 'No internet connection - showing cached data' : 'Connection restored'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  offlineBanner: {
    backgroundColor: Colors.textSecondary,
  },
  restoredBanner: {
    backgroundColor: Colors.success,
  },
  text: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textInverse,
  },
});
