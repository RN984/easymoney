import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Palette } from '../../../../constants/theme';
import { Category } from '../../../../index';
import { fetchCategories, updateCategories } from '../../../../services/masterService';
import CategoryEditModal from './EditModal';

// デフォルトの収入カテゴリID
const DEFAULT_INCOME_CATEGORY_IDS = ['cat_fixed_income', 'cat_extra_income'];

export default function Accordion() {
  const [expanded, setExpanded] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'expense' | 'income'>('expense');

  // モーダル用
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (expanded && categories.length === 0) {
      loadData();
    }
  }, [expanded]);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchCategories();
    setCategories(data);
    setLoading(false);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const isDefaultIncomeCategory = (id: string) => DEFAULT_INCOME_CATEGORY_IDS.includes(id);

  const openEditModal = (item: Category | null) => {
    if (item?.type === 'income') {
      Alert.alert('未実装', '収入カテゴリの編集は準備中です');
      return;
    }
    setEditingCategory(item);
    setModalVisible(true);
  };

  const handleAddNew = () => {
    if (selectedType === 'income') {
      Alert.alert('未実装', '収入カテゴリの追加は準備中です');
      return;
    }
    setEditingCategory(null);
    setModalVisible(true);
  };

  const handleSave = async (newCategory: Category) => {
    try {
      let updatedList;
      if (editingCategory) {
        updatedList = categories.map(c => c.id === newCategory.id ? newCategory : c);
      } else {
        updatedList = [...categories, newCategory];
      }
      setCategories(updatedList);
      await updateCategories(updatedList);
      setModalVisible(false);
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  const handleDelete = (id: string) => {
    if (selectedType === 'income' || isDefaultIncomeCategory(id)) {
      Alert.alert('エラー', 'このカテゴリは削除できません');
      return;
    }
    Alert.alert('削除確認', '本当に削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          const updatedList = categories.filter(c => c.id !== id);
          setCategories(updatedList);
          await updateCategories(updatedList);
        }
      }
    ]);
  };

  const filteredCategories = categories.filter(c => c.type === selectedType);

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= filteredCategories.length) return;

    const newFiltered = [...filteredCategories];
    [newFiltered[index], newFiltered[swapIndex]] = [newFiltered[swapIndex], newFiltered[index]];

    const reorderedData = newFiltered.map((item, i) => ({ ...item, order: i }));
    const otherCategories = categories.filter(c => c.type !== selectedType);
    const newCategories = [...otherCategories, ...reorderedData];
    setCategories(newCategories);
    await updateCategories(newCategories);
  };

  const isLocked = (item: Category) =>
    selectedType === 'income' || isDefaultIncomeCategory(item.id);

  const renderRightActions = (item: Category) => {
    const locked = isLocked(item);
    if (locked) return null;

    return (
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Palette.secondary }]}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>編集</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Palette.accent }]}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>削除</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = (item: Category, index: number) => {
    const locked = isLocked(item);

    return (
      <Swipeable key={item.id} renderRightActions={() => renderRightActions(item)}>
        <View
          style={[
            styles.row,
            locked && styles.lockedRow,
          ]}
        >
          {/* 並び替えボタン */}
          {!locked && (
            <View style={styles.reorderButtons}>
              <TouchableOpacity
                onPress={() => handleMove(index, 'up')}
                disabled={index === 0}
                style={styles.reorderBtn}
              >
                <Ionicons name="chevron-up" size={16} color={index === 0 ? '#DDD' : '#999'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleMove(index, 'down')}
                disabled={index === filteredCategories.length - 1}
                style={styles.reorderBtn}
              >
                <Ionicons name="chevron-down" size={16} color={index === filteredCategories.length - 1 ? '#DDD' : '#999'} />
              </TouchableOpacity>
            </View>
          )}

          {locked && selectedType === 'income' && (
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={16} color="#999" />
            </View>
          )}

          <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon as any} size={16} color="#FFF" />
          </View>
          <Text style={styles.rowText}>{item.name}</Text>

          {locked && selectedType === 'income' && (
            <Text style={styles.lockedText}>デフォルト</Text>
          )}
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Accordion Header */}
      <TouchableOpacity onPress={toggleExpand} style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="pricetag-outline" size={20} color={Palette.text} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>カテゴリ設定</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#999"
        />
      </TouchableOpacity>

      {/* Accordion Body */}
      {expanded && (
        <View style={styles.body}>
          {loading ? (
            <ActivityIndicator size="small" color={Palette.primary} style={{ padding: 20 }} />
          ) : (
            <>
              {/* タイプ選択プルダウン */}
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeBtn, selectedType === 'expense' && styles.typeBtnActive]}
                  onPress={() => setSelectedType('expense')}
                >
                  <Text style={[styles.typeBtnText, selectedType === 'expense' && styles.typeBtnTextActive]}>
                    支出
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, selectedType === 'income' && styles.typeBtnActive]}
                  onPress={() => setSelectedType('income')}
                >
                  <Text style={[styles.typeBtnText, selectedType === 'income' && styles.typeBtnTextActive]}>
                    収入
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 操作ボタン */}
              <View style={styles.listHeader}>
                <Text style={styles.hint}>矢印で並び替え / スワイプで編集・削除</Text>
                <TouchableOpacity onPress={handleAddNew} style={styles.addBtn}>
                  <Text style={styles.addBtnText}>＋ 追加</Text>
                </TouchableOpacity>
              </View>

              {/* カテゴリリスト */}
              <View style={styles.listContainer}>
                {filteredCategories.map((item, index) => renderItem(item, index))}
              </View>
            </>
          )}
        </View>
      )}

      <CategoryEditModal
        visible={modalVisible}
        targetCategory={editingCategory}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Palette.text,
  },
  body: {
    backgroundColor: '#FAFAFA',
    paddingBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 4,
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: Palette.primary,
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  typeBtnTextActive: {
    color: '#FFF',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  hint: { fontSize: 11, color: '#999' },
  addBtn: { backgroundColor: Palette.primary, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  listContainer: {
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  draggingRow: {
    backgroundColor: '#FFF9C4',
    borderColor: Palette.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  lockedRow: {
    backgroundColor: '#F5F5F5',
    opacity: 0.8,
  },
  reorderButtons: {
    flexDirection: 'column' as const,
    marginRight: 4,
    marginLeft: -6,
  },
  reorderBtn: {
    padding: 2,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rowText: { flex: 1, fontSize: 13, color: Palette.text },
  lockedText: { fontSize: 12, color: '#999', marginRight: 8 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 6, marginRight: 2 },
  lockIcon: { width: 24, marginRight: 4, alignItems: 'center' },
  actionContainer: {
    flexDirection: 'row',
    width: 140,
    marginBottom: 6,
    marginRight: 10,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 2,
  },
  actionText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
  },
});
