import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Category, Household } from '../../../index';

interface Props {
  categories: Category[]; 
  transactions: Household[]; // [Ref] Household (親データ)
}

export const SegmentedProgressBar: React.FC<Props> = ({ categories, transactions }) => {
  
  // =================================================================
  // 集計ロジック: カテゴリごとの totalAmount を合計する
  // =================================================================
  const chartData = useMemo(() => {
    // 全体の合計金額
    const total = transactions.reduce((sum, t) => sum + t.totalAmount, 0);

    return categories.map(cat => {
      // カテゴリごとの合計を計算
      const catTotal = transactions
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.totalAmount, 0);
      
      // 割合を計算 (0除算回避)
      const percentage = total > 0 ? (catTotal / total) : 0;

      return {
        ...cat,
        percentage,
        amount: catTotal
      };
    });
  }, [categories, transactions]);

  return (
    <View style={styles.container}>
      {/* バー部分 */}
      <View style={styles.barContainer}>
        {chartData.map((item) => (
          item.percentage > 0 && (
            <View
              key={item.id}
              style={[
                styles.segment, 
                { flex: item.percentage, backgroundColor: item.color }
              ]}
            />
          )
        ))}
        {/* データがない場合のグレー表示 */}
        {transactions.length === 0 && <View style={[styles.segment, { flex: 1, backgroundColor: '#eee' }]} />}
      </View>
      
      {/* 凡例 (Legend) */}
      <View style={styles.legendContainer}>
        <View style={styles.legendLeft}>
           <Text style={styles.totalText}>Total: ¥{transactions.reduce((acc, cur) => acc + cur.totalAmount, 0).toLocaleString()}</Text>
        </View>
        <View style={styles.legendRight}>
            {/* 上位3カテゴリのみ表示するなどの工夫が可能だが今回は簡易表示 */}
            {chartData.filter(d => d.percentage > 0.1).map((item) => (
            <Text key={item.id} style={styles.legendText}>
                {item.name}: {Math.round(item.percentage * 100)}%
            </Text>
            ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 70,
  },
  barContainer: {
    flexDirection: 'row', 
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#eee',
    marginBottom: 8,
  },
  segment: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLeft: {
    flex: 1,
  },
  legendRight: {
    flexDirection: 'row',
    gap: 8,
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  }
});