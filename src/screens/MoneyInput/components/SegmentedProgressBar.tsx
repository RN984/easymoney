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
  pendingAmount?: number;
}

export const SegmentedProgressBar: React.FC<Props> = ({
  categories,
  transactions,
  budget,
  pendingAmount = 0,
}) => {
  // 集計ロジック
  const { chartData, totalSpent, isOverBudget, limitPositionPercent } = useMemo(() => {
    // 確定済みの合計
    const currentTotal = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    // 入力中を含めた合計
    const grandTotal = currentTotal + pendingAmount;
    
    // 予算オーバー判定
    const overBudget = grandTotal > budget;

    // バー全体のスケール基準（分母）
    // 予算内なら「予算」が100%幅。予算オーバーなら「合計額」が100%幅になる。
    const scaleBase = Math.max(budget, grandTotal);

    // 予算ラインの位置（％）
    // 予算内なら 100%、オーバーなら (予算/合計)% の位置に線が来る
    const limitRatio = scaleBase > 0 ? (budget / scaleBase) * 100 : 0;

    // カテゴリごとのデータ作成
    const data = categories.map((cat) => {
      const catTotal = transactions
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

    // 入力中金額の割合
    const pendingPercent = scaleBase > 0 ? pendingAmount / scaleBase : 0;

    return {
      chartData: data,
      totalSpent: grandTotal, // 表示用合計はpending含む
      isOverBudget: overBudget,
      limitPositionPercent: limitRatio,
    };
  }, [categories, transactions, budget, pendingAmount]);

  // 予算ラインとテキストの色決定
  // 予算内(<=100%) -> 赤 (Accent)
  // 予算外(>100%) -> グレー (Text/Gray) ※要望通り
  const limitColor = isOverBudget ? COLORS.text : COLORS.accent;
  const limitLabel = isOverBudget ? 'Limit' : 'Limit'; // 必要なら '100%' などに変更可

  return (
    <View style={styles.container}>
      {/* 上部の情報表示 */}
      <View style={styles.headerRow}>
        <Text style={styles.budgetText}>予算: ¥{budget.toLocaleString()}</Text>
        <Text
          style={[
            styles.budgetText,
            isOverBudget && { color: COLORS.accent, fontWeight: 'bold' },
          ]}
        >
          {Math.round((totalSpent / budget) * 100)}%
        </Text>
      </View>

      {/* バー本体エリア */}
      <View style={styles.barContainer}>
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

          {/* Pending Segment */}
          {pendingAmount > 0 && (
            <View
              style={[
                styles.segment,
                {
                  flex: pendingAmount / Math.max(budget, totalSpent),
                  backgroundColor: COLORS.gray,
                  opacity: 0.5,
                },
              ]}
            />
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

        {/* 予算ライン（Absolute配置） */}
        {/* left: limitPositionPercent% の位置に配置。
          そこから「左側」にテキストとラインを描画するため、
          内部のViewで右揃えを行います。
        */}
        <View
          style={[
            styles.limitMarkerWrapper,
            { left: `${limitPositionPercent}%` },
          ]}
        >
          <View style={styles.limitContent}>
            <Text style={[styles.limitText, { color: limitColor }]}>
              {/* 要望通り: 線にテキストを添える */}
              {isOverBudget ? '100%' : '100%'}
            </Text>
            <View style={[styles.limitLine, { backgroundColor: limitColor }]} />
          </View>
        </View>
      </View>

      {/* 下部の合計表示 */}
      <View style={styles.legendContainer}>
        <Text style={styles.totalText}>
          Total: ¥{totalSpent.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  // 予算ライン全体のラッパー（位置決定用）
  limitMarkerWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    // leftはstyleプロパティで指定
    // width: 0 にして、ここを起点に描画させる
    width: 0,
    zIndex: 10, // バーの上に表示
  },
  // ラインとテキストを包むコンテナ
  limitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 0, // 起点（left: X%）の「左側」に中身を配置する設定
    height: '100%',
    paddingRight: 0, // ラインの太さによるズレ調整が必要ならここ
  },
  limitText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 4, // 線との距離
    marginBottom: 12, // 線の上端に合わせるか、バーの上に浮かすかはお好みで調整
  },
  limitLine: {
    width: 2,
    height: 20, // バー(12px)より少し長くして突き出させる
    borderRadius: 1,
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