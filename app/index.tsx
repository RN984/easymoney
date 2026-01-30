// src/screens/MoneyInput/index.tsx
import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { Palette } from '../constants/theme'; // テーマ定数をインポート
// ファイル名が HumburgerMenu.tsx となっているため、そのままインポートします
import { HamburgerMenu } from '../src/components/HumburgerMenu';
import { CoinList } from '../src/screens/MoneyInput/components/Coin/CoinList';
import { FloatingCoin } from '../src/screens/MoneyInput/components/Coin/FloatingCoin';
import { RadialCategoryMenu } from '../src/screens/MoneyInput/components/RadialCategoryMenu';
import { useMoneyInput } from '../src/screens/MoneyInput/hooks/useMoneyInput';

export default function MoneyInput() {
  const {
    selectedCategoryId,
    setSelectedCategoryId,
    isSaving,
    floatingCoins,
    handlePressCoin,
    removeFloatingCoin,
  } = useMoneyInput(DEFAULT_CATEGORIES[0].id);

  return (
    <SafeAreaView style={styles.container}>
      {/* カスタムヘッダー */}
      <View style={styles.header}>
        {/* 左: メニューボタン */}
        <View style={styles.headerLeft}>
          <HamburgerMenu />
        </View>

        {/* 中央: タイトル */}
        <Text style={styles.title}>EasyMoney Input</Text>

        {/* 右: バランス調整用のダミーView（タイトルを中央寄せするため） */}
        <View style={styles.headerRight} />
      </View>

      <View style={styles.categoryContainer}>
        <RadialCategoryMenu
          categories={DEFAULT_CATEGORIES} 
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      </View>

      <View style={styles.coinContainer}>
        <CoinList onPressCoin={handlePressCoin} />
      </View>

      {/* アニメーションレイヤー: コイン画像をタップ位置に表示 */}
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
    flexDirection: 'row', // 横並びにする
    alignItems: 'center',
    justifyContent: 'space-between', // 両端と中央に配置
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.text,
    backgroundColor: Palette.background,
    zIndex: 10,
  },
  headerLeft: {
    width: 40, // 左右の幅を固定してタイトルを中央に保つ
    alignItems: 'flex-start',
  },
  headerRight: {
    width: 40, // 左側と同じ幅のダミー
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Palette.text,
    textAlign: 'center',
    flex: 1, // 残りのスペースを埋める
  },
  categoryContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    zIndex: 5,
  },
  coinContainer: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', // 背景を少し暗くする
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});