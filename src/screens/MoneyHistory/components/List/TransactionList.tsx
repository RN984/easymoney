import React from 'react';
import { Alert, FlatList } from 'react-native';

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