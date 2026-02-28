import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet } from 'react-native';

import { Colors } from '../../../../constants/theme';
import { Category, Household } from '../../../../index';
import { deleteHousehold } from '../../../../services/transactionService';
import { TransactionItem } from './TransactionItem';

interface Props {
  transactions: Household[];
  categories: Category[];
  onRefresh: () => void;
  onEdit: (item: Household) => void; // 編集リクエスト用コールバック
}

export const TransactionList: React.FC<Props> = ({ transactions, categories, onRefresh, onEdit }) => {
  const [expandedMemos, setExpandedMemos] = useState<Set<string>>(new Set());

  const toggleMemo = (id: string) => {
    setExpandedMemos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleDelete = async (id: string) => {
    Alert.alert('削除', 'この記録を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { 
        text: '削除', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHousehold(id);
            onRefresh(); // リスト更新
          } catch (e) {
            Alert.alert('エラー', '削除に失敗しました');
          }
        }
      }
    ]);
  };

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TransactionItem
          item={item}
          categories={categories}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      )}
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  date: {
    fontSize: 12,
    color: Colors.light.gray,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 10,
    color: Colors.light.gray,
    marginLeft: 2,
  },
  memo: {
    fontSize: 12,
    color: Colors.light.gray,
    marginTop: 2,
  },
  memoContainer: {
    marginTop: 8,
  },
  memoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memoLabel: {
    fontSize: 12,
    color: Colors.light.gray,
    marginLeft: 4,
    fontWeight: '500',
  },
  memoContent: {
    fontSize: 12,
    color: Colors.light.text,
    marginTop: 6,
    marginLeft: 20,
    lineHeight: 18,
  },
  actionContainer: {
    flexDirection: 'row',
    width: 140,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
  },
});