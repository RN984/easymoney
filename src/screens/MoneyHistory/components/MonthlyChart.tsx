// src/screens/MoneyHistory/components/MonthlyChart.tsx
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { Colors } from '../../../../constants/theme';
import { Household } from '../../../index';

interface MonthlyChartProps {
  transactions: Household[];
  currentDate: Date;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_HEIGHT = 200;
const CHART_PADDING = 20;

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ transactions, currentDate }) => {
  // 日ごとの集計
  const dailyTotals = useMemo(() => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const totals = new Array(daysInMonth).fill(0);

    transactions.forEach(t => {
      const day = t.createdAt.getDate();
      if (day >= 1 && day <= daysInMonth) {
        totals[day - 1] += t.totalAmount;
      }
    });
    return totals;
  }, [transactions, currentDate]);

  const maxAmount = Math.max(...dailyTotals, 1000); // 最小でも1000円スケール
  const barWidth = (SCREEN_WIDTH - CHART_PADDING * 2) / dailyTotals.length * 0.6;
  const stepX = (SCREEN_WIDTH - CHART_PADDING * 2) / dailyTotals.length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月の支出
      </Text>
      <View style={styles.chartContainer}>
        <Svg width={SCREEN_WIDTH - CHART_PADDING * 2} height={CHART_HEIGHT}>
          {/* 基準線 (下線) */}
          <Line
            x1="0"
            y1={CHART_HEIGHT}
            x2={SCREEN_WIDTH}
            y2={CHART_HEIGHT}
            stroke={Colors.light.text}  
            strokeWidth="1"
          />
          
          {dailyTotals.map((amount, index) => {
            const barHeight = (amount / maxAmount) * (CHART_HEIGHT - 20); // 上部余白確保
            const x = index * stepX + (stepX - barWidth) / 2;
            const y = CHART_HEIGHT - barHeight;

            return (
              <React.Fragment key={index}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={Colors.light.primary}
                  rx={2}
                />
                {/* 5日ごとに日付を表示 */}
                {(index + 1) % 5 === 0 && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={CHART_HEIGHT - 5}
                    fontSize="10"
                    fill={Colors.light.text}
                    textAnchor="middle"
                  >
                    {index + 1}
                  </SvgText>
                )}
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
      <Text style={styles.totalText}>
        合計: ¥{dailyTotals.reduce((a, b) => a + b, 0).toLocaleString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContainer: {
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  totalText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
  }
});