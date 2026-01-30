// src/screens/MoneyHistory/components/TransactionList.tsx
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Household } from '../../../index';
// インポート元を修正 (src/constantsを想定)
import { DEFAULT_CATEGORIES as CATEGORIES } from '../../../../constants/categories';
import { Colors } from '../../../../constants/theme';

interface TransactionListProps {
  transactions: Household[];
  loading: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, loading }) => {
  if (loading && transactions.length === 0) {
    return (
      <View style={styles.center}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>データがありません</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Household }) => {
    // カテゴリIDで検索
    const category = CATEGORIES.find(c => c.id === item.categoryId);
    
    const dateStr = item.createdAt.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.itemContainer}>
        <View style={[styles.iconPlaceholder, { backgroundColor: category?.color || '#ccc' }]}>
          <Text style={styles.iconText}>{category?.name.charAt(0) || '?'}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.categoryName}>{category?.name || '不明なカテゴリ'}</Text>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
        <Text style={styles.amountText}>¥{item.totalAmount.toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
});