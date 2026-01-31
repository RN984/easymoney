import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// パス修正: 階層を確認 (src/constants/theme.ts)
import { Colors } from '../../constants/theme';

// Components
import { DateNavigator } from './components/Chart/DateNavigator'; // パス修正
import { EditModal } from './components/List/EditModal';
import { TransactionList } from './components/List/TransactionList';
import { SummaryHeader } from './components/SummaryHeader';

// Hooks
import { useHistoryScreen } from './hooks/useHistoryScreen';

export default function MoneyHistoryScreen() {
  const insets = useSafeAreaInsets();
  const {
    currentDate,
    transactions,
    summary,
    isLoading,
    selectedTransaction,
    isEditModalVisible,
    handleChangeMonth,
    handleDelete,
    handleUpdate,
    openEditModal,
    closeEditModal,
    refreshData,
  } = useHistoryScreen();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DateNavigator 
        currentDate={currentDate} 
        onChangeMonth={handleChangeMonth} 
      />
      <SummaryHeader summary={summary} />

      <TransactionList
        transactions={transactions} // 修正: data -> transactions
        categories={[]} // 必要に応じて取得したカテゴリを渡す
        onRefresh={refreshData}
        onEdit={openEditModal} // 修正: onItemPress -> onEdit
      />

      {selectedTransaction && (
        <EditModal
          visible={isEditModalVisible}
          targetItem={selectedTransaction} // 修正: transaction -> targetItem
          onClose={closeEditModal}
          onUpdated={refreshData} // 修正: onUpdate -> onUpdated
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    // 必要に応じて高さ調整
  },
  chartContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});