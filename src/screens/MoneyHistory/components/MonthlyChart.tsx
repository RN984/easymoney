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
const CHART_PADDING = 32; // 余白を調整

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ transactions, currentDate }) => {
  // 日ごとの集計ロジックを堅牢に修正
  const dailyTotals = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totals = new Array(daysInMonth).fill(0);

    transactions.forEach(t => {
      // 重要：t.createdAt が string（ISO文字列）で届いている場合があるため Date に変換
      const date = new Date(t.createdAt);
      
      // 無効な日付のチェック
      if (isNaN(date.getTime())) return;

      // 現在表示中の月と同じデータのみを集計
      if (date.getFullYear() === year && date.getMonth() === month) {
        const day = date.getDate();
        if (day >= 1 && day <= daysInMonth) {
          totals[day - 1] += t.totalAmount;
        }
      }
    });
    return totals;
  }, [transactions, currentDate]);

  const maxAmount = Math.max(...dailyTotals, 1000); 
  const chartInnerWidth = SCREEN_WIDTH - CHART_PADDING * 2;
  const stepX = chartInnerWidth / dailyTotals.length;
  const barWidth = stepX * 0.6;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月の支出
      </Text>
      
      <View style={styles.chartContainer}>
        <Svg width={chartInnerWidth} height={CHART_HEIGHT}>
          {/* ベースライン */}
          <Line
            x1="0"
            y1={CHART_HEIGHT - 20}
            x2={chartInnerWidth}
            y2={CHART_HEIGHT - 20}
            stroke={Colors.light.text}
            strokeWidth="1"
            opacity={0.3}
          />
          
          {dailyTotals.map((amount, index) => {
            // グラフの高さを計算（下部のテキストスペースを確保）
            const barHeight = (amount / maxAmount) * (CHART_HEIGHT - 40);
            const x = index * stepX + (stepX - barWidth) / 2;
            const y = (CHART_HEIGHT - 20) - barHeight;

            return (
              <React.Fragment key={index}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 0)} // マイナス値防止
                  fill={Colors.light.secondary} // 背景と同化しないようイエローに変更
                  rx={2}
                />
                {/* 5日おきに日付を表示 */}
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
      
      <View style={styles.footer}>
        <Text style={styles.totalLabel}>合計支出</Text>
        <Text style={styles.totalValue}>
          ¥{dailyTotals.reduce((a, b) => a + b, 0).toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background, // 背景色をベージュに変更してグラフを見やすく
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.text,
    alignItems: 'center',
  },
  chartContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(39, 45, 45, 0.1)',
    paddingTop: 8,
    width: '100%',
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.light.text,
    marginRight: 8,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.primary,
  }
});