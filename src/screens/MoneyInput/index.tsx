import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_CATEGORIES } from '../../../constants/categories';
import { Palette } from '../../../constants/theme';
import { HamburgerMenu } from '../../components/HumburgerMenu';
import { CoinList } from './components/Coin/CoinList';
import { FloatingCoin } from './components/Coin/FloatingCoin';
import { RadialCategoryMenu } from './components/RadialCategoryMenu';
import { SegmentedProgressBar } from './components/SegmentedProgressBar';
import { useMoneyInput } from './hooks/useMoneyInput';

export default function MoneyInput() {
  const {
    selectedCategoryId,
    setSelectedCategoryId,
    isSaving,
    floatingCoins,
    monthlyTransactions, // 追加
    handlePressCoin,
    removeFloatingCoin,
  } = useMoneyInput(DEFAULT_CATEGORIES[0].id);

  return (
    <SafeAreaView style={styles.container}>
      {/* カスタムヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <HamburgerMenu />
        </View>
        <Text style={styles.title}>EasyMoney</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 予算進捗バー (ヘッダー直下に配置) */}
      <SegmentedProgressBar 
        categories={DEFAULT_CATEGORIES}
        transactions={monthlyTransactions}
      />

      {/* カテゴリ選択 */}
      <View style={styles.categoryContainer}>
        <RadialCategoryMenu
          categories={DEFAULT_CATEGORIES} 
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      </View>

      {/* コイン入力エリア */}
      <View style={styles.coinContainer}>
        <CoinList onPressCoin={handlePressCoin} />
      </View>

      {/* アニメーションレイヤー */}
      {floatingCoins.map((coin) => (
        <FloatingCoin
          key={coin.id}
          id={coin.id}
          value={coin.value}
          x={coin.x}
          y={coin.y}
          onAnimationComplete={removeFloatingCoin}
        />
      ))}

      {isSaving && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Palette.white} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: Palette.background,
    zIndex: 10,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Palette.text,
    textAlign: 'center',
    flex: 1,
  },
  categoryContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 5,
  },
  coinContainer: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});