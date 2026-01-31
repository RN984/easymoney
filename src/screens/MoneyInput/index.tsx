import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import { Colors } from '../../../constants/theme';
import { HamburgerMenu } from '../../components/HamburgerMenu'; // 修正したコンポーネント
import { CoinList } from './components/Coin/CoinList';
import { FloatingCoin } from './components/Coin/FloatingCoin'; // 既存にあると仮定
import { FeedbackToast } from './components/FeedbackToast';
import { RadialCategoryMenu } from './components/RadialCategoryMenu';
import { SegmentedProgressBar } from './components/SegmentedProgressBar';
import { useMoneyInput } from './hooks/useMoneyInput';

export default function MoneyInputScreen() {
  const router = useRouter();
  const {
    amount,
    categories,
    selectedCategoryId,
    monthlyTotal,
    toast,
    floatingCoins,
    handleSelectCategory,
    handlePressCoin, // 修正
    removeFloatingCoin,
    handleReset,
    handleSubmit
  } = useMoneyInput('');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <HamburgerMenu />
        <Pressable 
          style={styles.historyButton} 
          onPress={() => router.push('/history')}
        >
          <Ionicons name="stats-chart" size={24} color={Colors.light.primary} />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <SegmentedProgressBar 
          currentTotal={monthlyTotal}
          pendingAmount={amount}
          budget={100000}
        />
      </View>

      <View style={styles.mainContent}>
        {/* Category Menu: Props修正 */}
        <View style={styles.categoryContainer}>
          <RadialCategoryMenu
            categories={categories}
            selectedCategoryId={selectedCategoryId} // 修正: selectedId -> selectedCategoryId
            onSelectCategory={handleSelectCategory} // 修正: onSelect -> onSelectCategory
          />
        </View>
      </View>

      {/* Coin List: Props修正 */}
      <View style={styles.footer}>
        <CoinList onPressCoin={handlePressCoin} /> 
        
        {/* Submit Actions */}
        {amount > 0 && (
          <View style={styles.actionButtons}>
            <Pressable style={styles.resetButton} onPress={handleReset}>
              <Ionicons name="refresh" size={24} color="#666" />
            </Pressable>
            <Pressable style={styles.submitButton} onPress={handleSubmit}>
              <Ionicons name="checkmark" size={32} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>

      {/* Floating Coins Layer */}
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

      {/* Feedback Toast */}
      <FeedbackToast 
        visible={toast.visible} 
        message={toast.message} 
        categoryColor={toast.color} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 20,
  },
  historyButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 2,
  },
  progressContainer: {
    marginTop: 8,
    zIndex: 5,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  categoryContainer: {
    // 中央配置
  },
  footer: {
    paddingBottom: 20,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  actionButtons: {
    position: 'absolute',
    right: 20,
    bottom: 140, 
    flexDirection: 'column',
    gap: 16,
  },
  resetButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  submitButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
});