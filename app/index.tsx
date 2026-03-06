import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HamburgerMenu } from '../src/components/HamburgerMenu';
import { Palette } from '../src/constants/theme';
import { EditModal } from '../src/screens/MoneyHistory/components/List/EditModal';
import { CoinList } from '../src/screens/MoneyInput/components/Coin/CoinList';
import { FloatingCoin } from '../src/screens/MoneyInput/components/Coin/FloatingCoin';
import { RadialCategoryMenu } from '../src/screens/MoneyInput/components/RadialCategoryMenu';
import { SegmentedProgressBar } from '../src/screens/MoneyInput/components/SegmentedProgressBar';
import { useMoneyInput } from '../src/screens/MoneyInput/hooks/useMoneyInput';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface FloatingCoinData {
  id: string;
  value: number;
  x: number;
  y: number;
}

export default function MoneyInput() {
  const router = useRouter();
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoinData[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const {
    categories,
    selectableCategories,
    inputType,
    selectedCategoryId,
    toggleInputType,
    handleSelectCategory,
    currentAmount,
    transactions,
    budget,
    coinSettings,
    handleAddCoin,
    timerActive,
    timerKey,
    sessionAmount,
    sessionCategoryName,
  } = useMoneyInput();

  // 修正3: 引数の定義を変更
  // ({ x, y }) ではなく、x, y を個別の引数として受け取り、valueの型をCoinValueにする
  const handlePressCoin = useCallback(async (value: number, x: number, y: number) => {
    // A. アニメーション用のコインを追加
    const newCoin: FloatingCoinData = {
      id: Date.now().toString(),
      value, // 型が一致するためOK
      x,
      y,
    };
    setFloatingCoins((prev) => [...prev, newCoin]);

    // B. データ保存処理
    try {
      // handleAddCoin も CoinValue型 を期待しているのでOK
      await handleAddCoin(value);
    } catch (error) {
      console.error('Coin add failed', error);
    }
  }, [handleAddCoin]);

  // 3秒タイマーバーのアニメーション
  const timerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (timerActive) {
      timerAnim.setValue(1);
      Animated.timing(timerAnim, {
        toValue: 0,
        duration: 3000,
        useNativeDriver: false,
      }).start();
    }
  }, [timerActive, timerKey]);

  // 吹き出しフェードアニメーション
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // timerActiveフラグに応じて、フェードイン/アウトを切り替える
    Animated.timing(bubbleOpacity, {
      toValue: timerActive ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [timerActive]);

  const removeFloatingCoin = useCallback((id: string) => {
    setFloatingCoins((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleOpenAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <HamburgerMenu />
          </View>
          <Text style={styles.title}>EasyMoney</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Ionicons name="bar-chart" size={28} color={Palette.primary} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Timer Bar Area */}
        <View style={styles.timerBarContainer}>
          {/* Background Track */}
          <View style={styles.timerBarTrack} />
          {/* Animated Bar */}
          {timerActive && (
            <Animated.View
              style={[
                styles.timerBar,
                {
                  width: timerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          )}
        </View>
      </View>

      <SegmentedProgressBar 
        categories={categories}
        transactions={transactions}
        budget={budget}
      />

      {/* 吹き出し */}
      <Animated.View style={[styles.bubbleContainer, { opacity: bubbleOpacity, pointerEvents: 'none' }]}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>
            {sessionCategoryName}　¥{sessionAmount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.bubbleArrow} />
      </Animated.View>

      <View style={styles.categoryContainer}>
        <RadialCategoryMenu
          categories={selectableCategories}
          selectedCategoryId={selectedCategoryId}
          inputType={inputType}
          onToggleInputType={toggleInputType}
          onSelectCategory={handleSelectCategory}
        />
      </View>

      <View style={styles.coinContainer}>
        {/* シグネチャが (value: CoinValue, x: number, y: number) => void に一致したためエラー解消 */}
        <CoinList onPressCoin={handlePressCoin} onAddPress={handleOpenAddModal} coinSettings={coinSettings} />
      </View>

      {floatingCoins.map((coin) => (
        <FloatingCoin
          key={coin.id}
          id={coin.id}
          x={coin.x}
          y={coin.y}
          onAnimationComplete={removeFloatingCoin}
        />
      ))}

      {/* Add Modal */}
      <EditModal
        visible={isAddModalVisible}
        targetItem={null}
        onClose={handleCloseAddModal}
        onUpdated={() => {}}
        categories={categories}
        inputType={inputType}
        selectedCategoryId={selectedCategoryId}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    backgroundColor: Palette.background,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timerBarContainer: {
    height: 3,
  },
  timerBarTrack: {
    backgroundColor: '#E0E0E0',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  timerBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
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
  bubbleContainer: {
    position: 'absolute',
    top: '25%',
    alignSelf: 'center',
    zIndex: 100,
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: Palette.text,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bubbleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bubbleArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Palette.text,
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
});
