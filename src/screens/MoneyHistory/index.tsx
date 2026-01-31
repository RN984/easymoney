// src/screens/MoneyHistory/index.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/theme';

// Components
import { DateNavigator } from './components/DateNavigator';
import { EditModal } from './components/List/EditModal'; // 既存のパスに合わせてください
import { TransactionList } from './components/List/TransactionList'; // 既存のパス
import { MonthlyChart } from './components/MonthlyChart'; // 既存のパス
import { SummaryHeader } from './components/SummaryHeader';

// Hooks
import { useHistoryScreen } from './hooks/useHistoryScreen';

export default function MoneyHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Logic Extraction
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
      
      {/* 1. Header (共通ヘッダーまたは戻るボタン) */}
      <View style={styles.header}>
        {/* 必要であれば HeaderArea を配置、あるいはシンプルなタイトル */}
      </View>

      {/* 2. Date Navigation */}
      <DateNavigator 
        currentDate={currentDate} 
        onChangeMonth={handleChangeMonth} 
      />

      {/* 3. Summary Cards */}
      <SummaryHeader summary={summary} />

      {/* 4. Content (List with Chart Header) */}
      <TransactionList
        data={transactions}
        onItemPress={openEditModal}
        onRefresh={refreshData}
        refreshing={isLoading}
        // ListHeaderComponent としてチャートを渡すとスクロールがスムーズになります
        ListHeaderComponent={
          <View style={styles.chartContainer}>
             <MonthlyChart data={transactions} />
          </View>
        }
      />

      {/* 5. Edit Modal */}
      {selectedTransaction && (
        <EditModal
          visible={isEditModalVisible}
          transaction={selectedTransaction}
          onClose={closeEditModal}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
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