// src/screens/MoneyInput/index.tsx
import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_CATEGORIES } from '../../../constants/categories';
import { CoinList } from './components/Coin/CoinList';
import { FloatingCoin } from './components/Coin/FloatingCoin';
import { RadialCategoryMenu } from './components/RadialCategoryMenu';
import { useMoneyInput } from './hooks/useMoneyInput';

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
      <View style={styles.header}>
        <Text style={styles.title}>EasyMoney Input</Text>
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
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAE5C6',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#272D2D',
    alignItems: 'center',
    backgroundColor: '#EAE5C6',
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#272D2D',
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
    top: 50,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});