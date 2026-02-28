// src/screens/MoneyHistory/components/IncomeListSection.tsx
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../constants/theme';
import { Category, Household } from '../../../index';

interface Props {
  baseSalary: number;
  incomeTransactions: Household[];
  categories: Category[];
  onAddPress: () => void;
  onItemPress?: (item: Household) => void;
}

export const IncomeListSection: React.FC<Props> = ({
  baseSalary,
  incomeTransactions,
  categories,
  onAddPress,
  onItemPress,
}) => {
  // 収入カテゴリを取得
  const incomeCategory = categories.find(c => c.type === 'income');
  
  // リストアイテムを生成（基本給がある場合は最初に表示）
  const items = baseSalary > 0
    ? [
        {
          id: 'base_salary',
          type: 'base' as const,
          amount: baseSalary,
          name: '基本給',
          date: new Date(),
          categoryId: incomeCategory?.id || 'cat_income',
        },
        ...incomeTransactions.map(t => ({ ...t, type: 'transaction' as const })),
      ]
    : incomeTransactions.map(t => ({ ...t, type: 'transaction' as const }));

  const getCategory = (id: string) => categories.find(c => c.id === id);

  const renderItem = ({ item }: { item: any }) => {
    const category = getCategory(item.categoryId);
    const dateStr = format(item.date, 'M/d', { locale: ja });

    if (item.type === 'base') {
      // 基本給の表示
      return (
        <View style={styles.itemContainer}>
          <View style={[styles.iconContainer, { backgroundColor: incomeCategory?.color || '#4CAF50' }]}>
            <Ionicons name={(incomeCategory?.icon as any) || 'cash'} size={20} color="#fff" />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
          <Text style={[styles.amount, { color: Colors.light.primary }]}>
            ¥{item.amount.toLocaleString()}
          </Text>
        </View>
      );
    }

    // その他の収入取引
    const dateStrTx = format(item.createdAt, 'M/d(E) HH:mm', { locale: ja });
    return (
      <TouchableOpacity 
        style={styles.itemContainer}
        onPress={() => onItemPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: category?.color || '#4CAF50' }]}>
          <Ionicons name={(category?.icon as any) || 'cash'} size={20} color="#fff" />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.itemName}>{category?.name || '収入'}</Text>
          <Text style={styles.dateText}>{dateStrTx}</Text>
          {item.memo && <Text style={styles.memoText}>{item.memo}</Text>}
        </View>
        <Text style={[styles.amount, { color: Colors.light.primary }]}>
          ¥{item.totalAmount.toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 収入リスト */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
            <View style={[styles.iconContainer, { backgroundColor: Colors.light.secondary }]}>
              <Ionicons name="add" size={20} color="#fff" />
            </View>
            <Text style={styles.addButtonText}>収入を追加</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  dateText: {
    fontSize: 12,
    color: Colors.light.gray,
    marginTop: 2,
  },
  memoText: {
    fontSize: 11,
    color: Colors.light.gray,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.light.secondary,
    fontWeight: '600',
    marginLeft: 12,
  },
});
