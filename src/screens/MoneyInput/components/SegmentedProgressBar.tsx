import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Colors } from '../../../../constants/theme';

interface SegmentedProgressBarProps {
  currentTotal: number;   // 今月の確定済み合計金額
  pendingAmount: number;  // 現在入力中の金額
  budget?: number;        // 月次予算 (デフォルト10万)
}

const DEFAULT_BUDGET = 100000;

export const SegmentedProgressBar: React.FC<SegmentedProgressBarProps> = ({ 
  currentTotal, 
  pendingAmount, 
  budget = DEFAULT_BUDGET 
}) => {
  // 割合計算 (最大100%)
  const usedRatio = Math.min(currentTotal / budget, 1);
  const pendingRatio = Math.min((currentTotal + pendingAmount) / budget, 1) - usedRatio;

  const usedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${usedRatio * 100}%`, { duration: 500 }),
  }));

  const pendingStyle = useAnimatedStyle(() => ({
    width: withTiming(`${pendingRatio * 100}%`, { duration: 300 }),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>今月の予算消化率</Text>
        <Text style={styles.value}>
          ¥{(currentTotal + pendingAmount).toLocaleString()} / ¥{budget.toLocaleString()}
        </Text>
      </View>
      <View style={styles.barBackground}>
        {/* 確定済み部分 */}
        <Animated.View style={[styles.barFill, styles.barUsed, usedStyle]} />
        {/* 入力中部分 */}
        <Animated.View style={[styles.barFill, styles.barPending, pendingStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: Colors.light.text,
  },
  value: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  barBackground: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barFill: {
    height: '100%',
  },
  barUsed: {
    backgroundColor: Colors.light.primary,
  },
  barPending: {
    backgroundColor: Colors.light.secondary, // 入力中は少し違う色あるいはアクセントカラー
  },
});