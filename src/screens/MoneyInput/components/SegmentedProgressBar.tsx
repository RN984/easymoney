import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
// 実際のプロジェクトパスに合わせて修正してください
import { Category, Household } from '../../../index';

// Design System Constants
const COLORS = {
  background: '#EAE5C6',
  text: '#272D2D',
  primary: '#6179B5',
  secondary: '#F4DA61',
  accent: '#DB8479',
  gray: '#999999',
  barBackground: '#E0E0E0',
};

interface Props {
  categories: Category[];
  transactions: Household[];
  budget: number;
}

export const SegmentedProgressBar: React.FC<Props> = ({
  categories,
  transactions,
  budget,
}) => {
  // 集計ロジック
  // pendingAmount（入力中の金額）はバーには表示しない
  // 取引確定後（transactions更新時）のみ反映させる
  const { chartData, totalSpent, isOverBudget } = useMemo(() => {
    // 支出ONLY: カテゴリのtypeが'expense'の transactions のみ対象
    const expenseCategoryIds = new Set(
      categories.filter((c) => c.type === 'expense').map((c) => c.id)
    );
    const expenseTransactions = transactions.filter((t) => 
      expenseCategoryIds.has(t.categoryId)
    );

    // 確定済みの合計（支出のみ）- pendingAmountを含まない
    const currentTotal = expenseTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    
    // 予算オーバー判定（pendingAmount含まない）
    const overBudget = currentTotal > budget;

    // バー全体のスケール基準（分母）
    const scaleBase = Math.max(budget, currentTotal);

    // カテゴリごとのデータ作成（支出カテゴリのみ）
    const expenseCategories = categories.filter((c) => c.type === 'expense');
    const data = expenseCategories.map((cat) => {
      const catTotal = expenseTransactions
        .filter((t) => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.totalAmount, 0);

      // 全体の幅(scaleBase)に対する割合
      const percentage = scaleBase > 0 ? catTotal / scaleBase : 0;

      return {
        ...cat,
        percentage,
        amount: catTotal,
      };
    });

    return {
      chartData: data,
      totalSpent: currentTotal, // 表示用合計は確定済みのみ
      isOverBudget: overBudget,
    };
  }, [categories, transactions, budget]);

  // パーセンテージ表示の位置を計算（色がついている部分の右端）
  const percentagePosition = Math.min((totalSpent / Math.max(budget, totalSpent)) * 100, 100);

  return (
    <View style={styles.container}>
      {/* 上部: Total表示 */}
      <View style={styles.headerRow}>
        <Text style={styles.totalText}>
          Total: ¥{totalSpent.toLocaleString()}
        </Text>
      </View>

      {/* バー本体エリア */}
      <View style={styles.barContainer}>
        {/* パーセンテージ表示（色がついている部分の右端） */}
        <View
          style={[
            styles.percentageMarker,
            { left: `${percentagePosition}%` },
          ]}
        >
          <Text
            style={[
              styles.percentageText,
              isOverBudget && { color: COLORS.accent },
            ]}
          >
            {Math.round((totalSpent / budget) * 100)}%
          </Text>
        </View>

        {/* 背景とセグメント（Flexレイアウト） */}
        <View style={styles.segmentsRow}>
          {chartData.map((item) =>
            item.percentage > 0 ? (
              <View
                key={item.id}
                style={[
                  styles.segment,
                  { flex: item.percentage, backgroundColor: item.color },
                ]}
              />
            ) : null
          )}

          {/* 余白埋め（予算内のみ発生） */}
          {!isOverBudget && (
            <View
              style={{
                flex: (budget - totalSpent) / budget,
                backgroundColor: 'transparent',
              }}
            />
          )}
        </View>
      </View>

      {/* 下部: 予算表示 */}
      <View style={styles.legendContainer}>
        <Text style={styles.budgetText}>予算: ¥{budget.toLocaleString()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%', // 横幅を90%に縮小
    alignSelf: 'center', // 中央揃え
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  budgetText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  // バーのコンテナ（高さ固定、相対配置の基準点）
  barContainer: {
    height: 24, // テキストが見やすいよう少し高さを確保
    width: '100%',
    position: 'relative', // 子要素のabsolute配置の基準
    marginBottom: 8,
    justifyContent: 'center',
  },
  // 背景とセグメントの行
  segmentsRow: {
    flexDirection: 'row',
    height: 12, // 実際のバーの太さはここで調整
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: COLORS.barBackground,
    alignSelf: 'center', // 上下中央揃え
  },
  segment: {
    height: '100%',
  },
  // パーセンテージ表示のラッパー
  percentageMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center', // バーと重なるように中央配置
    zIndex: 5,
    transform: [{ translateX: 4 }], // 色の右端付近に配置（微調整）
  },
  percentageText: {
    fontSize: 11,
    color: '#FFFFFF', // 白文字
    fontWeight: 'bold',
    // 濃い縁取り効果（複数のシャドウで実現）
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 0},
    textShadowRadius: 3,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});