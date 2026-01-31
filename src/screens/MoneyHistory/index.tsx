import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../../../constants/theme';
import { Category, Household } from '../../index';
import { fetchCategories } from '../../services/masterService';
import { getMonthlyTransactions } from '../../services/transactionService';
import { EditModal } from './components/List/EditModal';
import { TransactionList } from './components/List/TransactionList';

export default function MoneyHistoryScreen() {
  const [transactions, setTransactions] = useState<Household[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItem, setSelectedItem] = useState<Household | null>(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const loadData = async () => {
    // 今月のデータを取得 (実際は月選択ロジックが必要)
    const data = await getMonthlyTransactions(new Date());
    setTransactions(data);
    const cats = await fetchCategories();
    setCategories(cats);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleEdit = (item: Household) => {
    setSelectedItem(item);
    setEditModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>履歴</Text>
      </View>

      <TransactionList 
        transactions={transactions} 
        categories={categories}
        onRefresh={loadData}
        onEdit={handleEdit}
      />

      <EditModal 
        visible={isEditModalVisible}
        targetItem={selectedItem}
        onClose={() => setEditModalVisible(false)}
        onUpdated={loadData}
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
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
});