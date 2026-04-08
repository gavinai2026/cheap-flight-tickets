import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const SkeletonPulse: React.FC<SkeletonProps> = ({ width = '100%', height = 20, borderRadius = BorderRadius.md, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[{ width: width as any, height, borderRadius, backgroundColor: Colors.border, opacity }, style]}
    />
  );
};

export const FlightCardSkeleton: React.FC = () => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <SkeletonPulse width={40} height={40} borderRadius={20} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonPulse width="60%" height={14} />
        <SkeletonPulse width="40%" height={12} />
      </View>
      <SkeletonPulse width={80} height={28} />
    </View>
    <View style={styles.cardRoute}>
      <SkeletonPulse width={50} height={24} />
      <SkeletonPulse width={60} height={12} />
      <SkeletonPulse width={50} height={24} />
    </View>
    <View style={styles.cardFooter}>
      <SkeletonPulse width={100} height={14} />
      <SkeletonPulse width={60} height={14} />
    </View>
  </View>
);

export const DealCardSkeleton: React.FC = () => (
  <View style={styles.dealCard}>
    <SkeletonPulse width="100%" height={80} borderRadius={BorderRadius.lg} />
    <SkeletonPulse width="70%" height={16} style={{ marginTop: Spacing.sm }} />
    <SkeletonPulse width="50%" height={12} style={{ marginTop: 4 }} />
    <SkeletonPulse width={80} height={20} style={{ marginTop: Spacing.sm }} />
  </View>
);

export const SearchResultsSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <View style={{ gap: Spacing.md }}>
    {Array.from({ length: count }).map((_, i) => (
      <FlightCardSkeleton key={i} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardRoute: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  dealCard: { width: 200, backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.md },
});
