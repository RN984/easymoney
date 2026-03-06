import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// パス修正: 階層を確認 (src/constants/theme.ts)
import { Colors } from '../../constants/theme';

import { DateNavigator } from './components/Chart/DateNavigator';
import { MonthlyChart } from './components/Chart/MonthlyChart';
import { EditModal } from './components/List/EditModal';
import { TransactionItem } from './components/List/TransactionItem';
import { SummaryHeader } from './components/SummaryHeader';

// Hooks
import { useHistoryScreen } from './hooks/useHistoryScreen';

type ListMode = 'income' | 'expense' | 'all';

export default function MoneyHistoryScreen() {
  const [listMode, setListMode] = useState<ListMode>('all');
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const modeButtonRef = useRef<any>(null);
  const [modeMenuPosition, setModeMenuPosition] = useState({ x: 20, y: 0, width: 150 });
  
  const {
    currentDate,
    transactions,
    summary,
    isLoading,
    selectedTransaction,
    isEditModalVisible,
    isIncomeModalVisible,
    handleChangeMonth,
    handleDelete,
    handleUpdate,
    openEditModal,
    closeEditModal,
    refreshData,
    incomeTransactions,
    expenseTransactions,
    fixedIncomeTransactions,
    categories,
    baseSalary,
  } = useHistoryScreen();

  const renderHeader = () => (
    <View>
      <DateNavigator
        currentDate={currentDate}
        onChangeMonth={handleChangeMonth}
      />
      <SummaryHeader 
        summary={summary} 
        onIncomePress={() => setListMode('income')}
        onExpensePress={() => setListMode('expense')}
        onTotalPress={() => setListMode('all')}
      />

      <MonthlyChart
        transactions={[...fixedIncomeTransactions, ...transactions]}
        currentDate={currentDate}
        categories={categories}
        viewMode={listMode}
      />
    </View>
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.modeSelectorWrap}>
        <TouchableOpacity
          ref={modeButtonRef}
          style={styles.modeSelectorButton}
          onPress={() => {
            if (isModeMenuOpen) {
              setIsModeMenuOpen(false);
              return;
            }

            modeButtonRef.current?.measureInWindow?.((x: number, y: number, width: number, height: number) => {
              setModeMenuPosition({ x, y: y + height + 4, width: Math.max(width, 150) });
              setIsModeMenuOpen(true);
            });
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.listHeaderTitle}>
            {listMode === 'income' ? '収入一覧' : listMode === 'expense' ? '支出一覧' : 'すべての取引'}
          </Text>
          <Ionicons name={isModeMenuOpen ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.light.text} />
        </TouchableOpacity>
      </View>
      <View />
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <TransactionItem
      item={item}
      categories={categories}
      onEdit={openEditModal}
      onDelete={(id) => handleDelete(id)}
    />
  );

  // 日付順にソート（新しい順）
  const sortByDate = (a: any, b: any) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  };

  const currentData = listMode === 'income' 
    ? [...fixedIncomeTransactions, ...incomeTransactions].sort(sortByDate)
    : listMode === 'expense' 
      ? [...expenseTransactions].sort(sortByDate)
      : [...fixedIncomeTransactions, ...transactions].sort(sortByDate);

  return (
    <View style={styles.container}>
      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={false}
        onScrollBeginDrag={() => {
          if (isModeMenuOpen) setIsModeMenuOpen(false);
        }}
        ListHeaderComponent={() => (
          <>
            {renderHeader()}
            {renderListHeader()}
          </>
        )}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {listMode === 'income' ? '収入がありません' : listMode === 'expense' ? '支出がありません' : '取引がありません'}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Modal
        visible={isModeMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModeMenuOpen(false)}
      >
        <View style={styles.dropdownBackdropContainer}>
          <Pressable style={styles.dropdownBackdrop} onPress={() => setIsModeMenuOpen(false)} />
          <View style={[styles.modeMenu, { top: modeMenuPosition.y, left: modeMenuPosition.x, minWidth: modeMenuPosition.width }]}> 
            {([
              { key: 'income', label: '収入一覧' },
              { key: 'expense', label: '支出一覧' },
              { key: 'all', label: 'すべての取引' },
            ] as const).map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.modeMenuItem}
                onPress={() => {
                  setListMode(option.key);
                  setIsModeMenuOpen(false);
                }}
              >
                <Text style={[styles.modeMenuText, listMode === option.key && styles.modeMenuTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {selectedTransaction && (
        <EditModal
          visible={isEditModalVisible}
          targetItem={selectedTransaction}
          onClose={closeEditModal}
          onUpdated={refreshData}
          categories={categories}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    overflow: 'visible',
  },
  header: {
    paddingHorizontal: 20,
  },
  chartContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 2000,
    elevation: 2000,
    overflow: 'visible',
  },
  modeSelectorWrap: {
    position: 'relative',
    zIndex: 3000,
    elevation: 3000,
    overflow: 'visible',
  },
  modeSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modeMenu: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    minWidth: 150,
    paddingVertical: 4,
    elevation: 9999,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 9999,
  },
  dropdownBackdropContainer: {
    flex: 1,
  },
  dropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modeMenuItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modeMenuText: {
    fontSize: 14,
    color: '#333',
  },
  modeMenuTextActive: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.light.gray,
    fontSize: 14,
  },
});
