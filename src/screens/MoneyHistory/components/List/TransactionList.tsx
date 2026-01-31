import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { Colors } from '../../../../constants/theme';
import { Category, Household } from '../../../../index';
import { deleteHousehold } from '../../../../services/transactionService';

interface Props {
  transactions: Household[];
  categories: Category[];
  onRefresh: () => void;
  onEdit: (item: Household) => void; // 編集リクエスト用コールバック
}

export const TransactionList: React.FC<Props> = ({ transactions, categories, onRefresh, onEdit }) => {
  
  const getCategory = (id: string) => categories.find(c => c.id === id);

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

  const renderRightActions = (item: Household) => {
    return (
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: Colors.light.secondary }]}
          onPress={() => onEdit(item)}
        >
          <Ionicons name="create-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>編集</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: Colors.light.error }]}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>削除</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Household }) => {
    const category = getCategory(item.categoryId);
    const dateStr = format(item.createdAt, 'M/d(E) HH:mm', { locale: ja });

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <View style={styles.itemContainer}>
          {/* Category Icon & Color */}
          <View style={[styles.iconContainer, { backgroundColor: category?.color || '#ccc' }]}>
            <Ionicons name={(category?.icon as any) || 'help'} size={24} color="#fff" />
          </View>

          {/* Main Info */}
          <View style={styles.infoContainer}>
            <View style={styles.row}>
              <Text style={styles.categoryName}>{category?.name || '不明'}</Text>
              <Text style={styles.amount}>¥{item.totalAmount.toLocaleString()}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.date}>{dateStr}</Text>
              {/* 位置情報があれば表示 */}
              {item.location && (
                <View style={styles.locationContainer}>
                  <Ionicons name="location-sharp" size={12} color={Colors.light.gray} />
                  <Text style={styles.locationText}>保存済み</Text>
                </View>
              )}
            </View>
            {item.memo && <Text style={styles.memo} numberOfLines={1}>{item.memo}</Text>}
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
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