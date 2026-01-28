import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Category, HouseholdItem } from '../../../index';

interface Props {
  categories: Category[]; // [Ref] Categories
  details: HouseholdItem[]; // [Ref] HouseholdItem (全データ)
}

export const SegmentedProgressBar: React.FC<Props> = ({ categories, details }) => {
  
  // =================================================================
  // [Virtual Column Formula]
  // AppSheet: SUM(SELECT(Detail[Amount], [Category] = [_THISROW].[Category]))
  // =================================================================
  const chartData = useMemo(() => {
    const total = details.reduce((sum, d) => sum + d.amount, 0); // 全合計

    return categories.map(cat => {
      // カテゴリごとの合計を計算 (SELECT & SUM)
      const catTotal = details
        .filter(d => d.categoryId === cat.id)
        .reduce((sum, d) => sum + d.amount, 0);
      
      // 割合を計算 (0除算回避)
      const percentage = total > 0 ? (catTotal / total) * 100 : 0;

      return {
        ...cat,
        percentage,
        amount: catTotal
      };
    });
  }, [categories, details]);

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
                { flex: item.percentage, backgroundColor: item.color } // Format Rules: 背景色
              ]}
            />
          )
        ))}
      </View>
      
      {/* 凡例 (Legend) */}
      <View style={styles.legendContainer}>
        {chartData.map((item) => (
           <Text key={item.id} style={styles.legendText}>
             {item.name}: {item.percentage.toFixed(0)}%
           </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
    height: 60, // 高さを固定
  },
  barContainer: {
    flexDirection: 'row', // 横並び (Stack)
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  segment: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
  }
});