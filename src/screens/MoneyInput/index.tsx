// src/screens/MoneyInput/index.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../src/constants/theme';

// Components
import { BudgetStatus } from './components/BudgetStatus';
import { CategorySelection } from './components/CategorySelection';
import { CoinInputArea } from './components/CoinInputArea';
import { FeedbackToast } from './components/FeedbackToast';
import { HeaderArea } from './components/HeaderArea';

// Hooks
import { useMoneyInput } from './hooks/useMoneyInput';

export default function MoneyInputScreen() {
  const insets = useSafeAreaInsets();
  
  // Logic & State Extraction
  const {
    categories,
    transactions,
    budget,
    currentAmount,
    selectedCategoryId,
    toast,
    handleSelectCategory,
    handleAddCoin,
  } = useMoneyInput();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* 1. Navigation Header */}
      <HeaderArea />

      {/* 2. Budget & Progress Display */}
      <BudgetStatus 
        categories={categories}
        transactions={transactions}
        budget={budget}
        currentAmount={currentAmount}
      />

      {/* 3. Main Interaction (Category Menu) */}
      <CategorySelection 
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
      />

      {/* 4. Input Controls (Coins) */}
      <CoinInputArea 
        onAddCoin={handleAddCoin} 
      />

      {/* 5. Feedback Overlay */}
      <FeedbackToast 
        message={toast.message} 
        uniqueKey={toast.key} 
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});