import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { HamburgerMenu } from '../src/components/HamburgerMenu';
import { DEFAULT_CATEGORIES } from '../src/constants/categories'; // ※注意: CategoriesはHookから取得した方が良いですが、ここでは既存維持
import { Palette } from '../src/constants/theme';
import { CoinList } from '../src/screens/MoneyInput/components/Coin/CoinList';
import { FloatingCoin } from '../src/screens/MoneyInput/components/Coin/FloatingCoin';
import { RadialCategoryMenu } from '../src/screens/MoneyInput/components/RadialCategoryMenu';
import { SegmentedProgressBar } from '../src/screens/MoneyInput/components/SegmentedProgressBar';
import { useMoneyInput } from '../src/screens/MoneyInput/hooks/useMoneyInput';

export default function MoneyInput() {
  const {
    categories, // Hookから取得したカテゴリを使用（マスター設定反映のため）
    selectedCategoryId,
    setSelectedCategoryId,
    isSaving,
    amount, 
    floatingCoins,
    transactions, // 修正: transactionsを受け取る
    budget,       // 修正: budgetを受け取る
    handlePressCoin,
    removeFloatingCoin,
  } = useMoneyInput(DEFAULT_CATEGORIES[0].id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <HamburgerMenu />
        </View>
        <Text style={styles.title}>EasyMoney</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 修正: ProgressBar に正しいPropsを渡す */}
      <SegmentedProgressBar 
        categories={categories}
        transactions={transactions}
        budget={budget}
        pendingAmount={amount}
      />

      <View style={styles.categoryContainer}>
        <RadialCategoryMenu
          categories={categories} // ここもHookからのcategoriesにすると設定変更が反映されます
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      </View>

      <View style={styles.coinContainer}>
        <CoinList onPressCoin={handlePressCoin} />
      </View>

      {/* ... (残りは変更なし) */}
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

// ... styles は変更なし
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