import React, { useCallback, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { HamburgerMenu } from '../src/components/HamburgerMenu';
import { Palette } from '../src/constants/theme';
import { CoinList } from '../src/screens/MoneyInput/components/Coin/CoinList';
import { FloatingCoin } from '../src/screens/MoneyInput/components/Coin/FloatingCoin';
import { RadialCategoryMenu } from '../src/screens/MoneyInput/components/RadialCategoryMenu';
import { SegmentedProgressBar } from '../src/screens/MoneyInput/components/SegmentedProgressBar';
import { useMoneyInput } from '../src/screens/MoneyInput/hooks/useMoneyInput';
// 修正1: CoinValue型をインポート (パスはプロジェクトに合わせて修正してください)
import { CoinValue } from '../src/index';

// 修正2: valueの型を number から CoinValue に変更
interface FloatingCoinData {
  id: string;
  value: CoinValue; 
  x: number;
  y: number;
}

export default function MoneyInput() {
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoinData[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const {
    categories,
    selectedCategoryId,
    handleSelectCategory,
    currentAmount,
    transactions,
    budget,
    handleAddCoin,
  } = useMoneyInput();

  // 修正3: 引数の定義を変更
  // ({ x, y }) ではなく、x, y を個別の引数として受け取り、valueの型をCoinValueにする
  const handlePressCoin = useCallback(async (value: CoinValue, x: number, y: number) => {
    // A. アニメーション用のコインを追加
    const newCoin: FloatingCoinData = {
      id: Date.now().toString(),
      value, // 型が一致するためOK
      x,
      y,
    };
    setFloatingCoins((prev) => [...prev, newCoin]);

    // B. データ保存処理
    setIsSaving(true);
    try {
      // handleAddCoin も CoinValue型 を期待しているのでOK
      await handleAddCoin(value);
    } catch (error) {
      console.error('Coin add failed', error);
    } finally {
      setIsSaving(false);
    }
  }, [handleAddCoin]);

  const removeFloatingCoin = useCallback((id: string) => {
    setFloatingCoins((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <HamburgerMenu />
        </View>
        <Text style={styles.title}>EasyMoney</Text>
        <View style={styles.headerRight} />
      </View>

      <SegmentedProgressBar 
        categories={categories}
        transactions={transactions}
        budget={budget}
        pendingAmount={currentAmount}
      />

      <View style={styles.categoryContainer}>
        <RadialCategoryMenu
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
        />
      </View>

      <View style={styles.coinContainer}>
        {/* シグネチャが (value: CoinValue, x: number, y: number) => void に一致したためエラー解消 */}
        <CoinList onPressCoin={handlePressCoin} />
      </View>

      {floatingCoins.map((coin) => (
        <FloatingCoin
          key={coin.id}
          id={coin.id}
          value={coin.value} // CoinValue型なのでOK
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