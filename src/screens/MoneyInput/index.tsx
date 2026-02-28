// src/screens/MoneyInput/index.tsx
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../src/constants/theme';

// Components
import { EditModal } from '../MoneyHistory/components/List/EditModal';
import { BudgetStatus } from './components/BudgetStatus';
import { CategorySelection } from './components/CategorySelection';
import { CoinInputArea } from './components/CoinInputArea';
import { FeedbackToast } from './components/FeedbackToast';

// Hooks
import { useMoneyInput } from './hooks/useMoneyInput';

export default function MoneyInputScreen() {
  const insets = useSafeAreaInsets();
  
  // Logic & State Extraction
  const {
    categories,
    selectableCategories,
    transactions,
    budget,
    currentAmount,
    selectedCategoryId,
    inputType,
    toast,
    handleSelectCategory,
    toggleInputType,
    coinSettings,
    handleAddCoin,
    refreshData,
  } = useMoneyInput();

  // Modal state for add button
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const handleOpenAddModal = () => {
    console.log('Opening modal, isAddModalVisible:', true);
    Alert.alert('Debug', 'Button pressed, opening modal');
    setIsAddModalVisible(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalVisible(false);
  };

  const handleAfterSave = () => {
    refreshData();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      {/* 1. Budget & Progress Display */}
      <BudgetStatus 
        categories={categories}
        transactions={transactions}
        budget={budget}
      />

      {/* 3. Main Interaction (Category Menu) */}
      <CategorySelection 
        categories={selectableCategories}
        selectedCategoryId={selectedCategoryId}
        inputType={inputType}
        onToggleInputType={toggleInputType}
        onSelectCategory={handleSelectCategory}
      />

      {/* 4. Input Controls (Coins) */}
      <CoinInputArea
        onAddCoin={handleAddCoin}
        onAddPress={handleOpenAddModal}
        coinSettings={coinSettings}
      />

      {/* 5. Feedback Overlay */}
      <FeedbackToast 
        message={toast.message} 
        uniqueKey={toast.key} 
      />

      {/* Add Modal */}
      <EditModal
        visible={isAddModalVisible}
        targetItem={null}
        onClose={handleCloseAddModal}
        onUpdated={handleAfterSave}
        categories={categories}
        inputType={inputType}
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
