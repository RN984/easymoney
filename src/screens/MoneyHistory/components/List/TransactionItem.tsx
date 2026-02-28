import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '../../../../constants/theme';
import { Category, Household } from '../../../../index';

interface Props {
  item: Household;
  categories: Category[];
  onEdit: (item: Household) => void;
  onDelete: (id: string) => void;
}

export const TransactionItem: React.FC<Props> = ({ item, categories, onEdit, onDelete }) => {
  const getCategory = (id: string) => categories.find(c => c.id === id);
  const category = getCategory(item.categoryId);
  const dateStr = format(item.createdAt, 'M/d(E) HH:mm', { locale: ja });

  const renderRightActions = () => (
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
        onPress={() => onDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text style={styles.actionText}>削除</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.itemContainer}>
        <View style={[styles.iconContainer, { backgroundColor: category?.color || '#ccc' }]}> 
          <Ionicons name={(category?.icon as any) || 'help'} size={24} color="#fff" />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <Text style={styles.categoryName}>{category?.name || '不明'}</Text>
            <Text style={styles.amount}>¥{item.totalAmount.toLocaleString()}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.date}>{dateStr}</Text>
          </View>

          {item.location?.address && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={12} color={Colors.light.gray} />
              <Text style={styles.locationText}>{item.location.address}</Text>
            </View>
          )}

          {item.memo && (
            <View style={styles.memoContainer}>
              <Text style={styles.memoContent}>{item.memo}</Text>
            </View>
          )}
        </View>
      </View>
    </Swipeable>
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
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.light.gray,
    marginLeft: 4,
  },
  memoContainer: {
    marginTop: 8,
  },
  memoContent: {
    fontSize: 12,
    color: Colors.light.text,
    marginTop: 6,
    marginLeft: 0,
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
