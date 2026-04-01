import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { PricePoint } from '../types';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/theme';
import { formatPrice } from '../utils/helpers';

interface Props {
  priceHistory: PricePoint[];
  currentPrice: number;
  width?: number;
  height?: number;
}

export const PriceTrendChart: React.FC<Props> = ({
  priceHistory,
  currentPrice,
  width = Dimensions.get('window').width - 64,
  height = 160,
}) => {
  if (priceHistory.length < 2) return null;

  const prices = priceHistory.map((p) => p.price);
  const minPrice = Math.min(...prices) * 0.95;
  const maxPrice = Math.max(...prices) * 1.05;
  const range = maxPrice - minPrice || 1;

  const padding = { top: 10, bottom: 30, left: 10, right: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => padding.left + (index / (prices.length - 1)) * chartWidth;
  const getY = (price: number) => padding.top + chartHeight - ((price - minPrice) / range) * chartHeight;

  // Build SVG path
  const linePath = prices
    .map((price, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(price)}`)
    .join(' ');

  // Area path
  const areaPath = `${linePath} L ${getX(prices.length - 1)} ${getY(minPrice)} L ${getX(0)} ${getY(minPrice)} Z`;

  // Last point
  const lastX = getX(prices.length - 1);
  const lastY = getY(prices[prices.length - 1]);

  // Min/max labels
  const minIdx = prices.indexOf(Math.min(...prices));
  const maxIdx = prices.indexOf(Math.max(...prices));

  const isDown = prices[prices.length - 1] < prices[0];
  const color = isDown ? Colors.success : prices[prices.length - 1] > prices[0] ? Colors.error : Colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>30-Day Price History</Text>
        <View style={styles.priceInfo}>
          <Text style={[styles.currentPrice, { color }]}>{formatPrice(currentPrice)}</Text>
          <Text style={[styles.trend, { color }]}>
            {isDown ? '\u25BC' : '\u25B2'}{' '}
            {Math.abs(Math.round(((prices[prices.length - 1] - prices[0]) / prices[0]) * 100))}%
          </Text>
        </View>
      </View>

      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.3} />
            <Stop offset="1" stopColor={color} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((pct) => (
          <Line
            key={pct}
            x1={padding.left}
            y1={padding.top + chartHeight * pct}
            x2={width - padding.right}
            y2={padding.top + chartHeight * pct}
            stroke={Colors.border}
            strokeWidth={0.5}
            strokeDasharray="4,4"
          />
        ))}

        {/* Area fill */}
        <Path d={areaPath} fill="url(#gradient)" />

        {/* Line */}
        <Path d={linePath} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Current price dot */}
        <Circle cx={lastX} cy={lastY} r={4} fill={color} />
        <Circle cx={lastX} cy={lastY} r={7} fill={color} opacity={0.2} />

        {/* Min label */}
        <SvgText
          x={getX(minIdx)}
          y={getY(prices[minIdx]) + 14}
          fontSize={9}
          fill={Colors.success}
          textAnchor="middle"
          fontWeight="bold"
        >
          Low
        </SvgText>

        {/* Date labels */}
        <SvgText x={padding.left} y={height - 5} fontSize={9} fill={Colors.textTertiary}>
          {priceHistory[0].date.substring(5)}
        </SvgText>
        <SvgText x={width - padding.right} y={height - 5} fontSize={9} fill={Colors.textTertiary} textAnchor="end">
          {priceHistory[priceHistory.length - 1].date.substring(5)}
        </SvgText>
      </Svg>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Low</Text>
          <Text style={[styles.statValue, { color: Colors.success }]}>{formatPrice(Math.min(...prices))}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.statValue}>{formatPrice(Math.round(prices.reduce((a, b) => a + b) / prices.length))}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>High</Text>
          <Text style={[styles.statValue, { color: Colors.error }]}>{formatPrice(Math.max(...prices))}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  currentPrice: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  trend: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
  statValue: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
});
