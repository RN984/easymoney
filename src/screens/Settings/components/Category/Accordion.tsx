import { Ionicons } from '@expo/vector-icons'; // Expoの標準アイコン
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { NestableDraggableFlatList, RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { Palette } from '../../../../constants/theme';
import { Category } from '../../../../index';
import { fetchCategories, updateCategories } from '../../../../services/masterService';
import CategoryEditModal from './EditModal';

// AndroidでLayoutAnimationを有効化
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Accordion() {
  const [expanded, setExpanded] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // モーダル用
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    // 展開されたときに初めてデータをロードする（パフォーマンス最適化）
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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleDragEnd = async ({ data }: { data: Category[] }) => {
    setCategories(data);
    await updateCategories(data);
  };

  const openEditModal = (item: Category | null) => {
    setEditingCategory(item);
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

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Category>) => (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={[styles.row, isActive && styles.activeRow]}
      >
        <View style={[styles.badge, { backgroundColor: item.color }]} />
        <Text style={styles.rowText}>{item.name}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
            <Ionicons name="pencil" size={18} color={Palette.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={18} color={Palette.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
            <Ionicons name="menu" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  ), [categories]);

  return (
    <View style={styles.container}>
      {/* Accordion Header */}
      <TouchableOpacity onPress={toggleExpand} style={styles.header}>
        <Text style={styles.headerTitle}>カテゴリ設定</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={Palette.text}
        />
      </TouchableOpacity>

      {/* Accordion Body */}
      {expanded && (
        <View style={styles.body}>
          {loading ? (
            <ActivityIndicator size="small" color={Palette.primary} style={{ padding: 20 }} />
          ) : (
            <>
              <View style={styles.listHeader}>
                <Text style={styles.hint}>長押しで並び替え</Text>
                <TouchableOpacity onPress={() => openEditModal(null)} style={styles.addBtn}>
                  <Text style={styles.addBtnText}>＋ 追加</Text>
                </TouchableOpacity>
              </View>

              <NestableDraggableFlatList
                data={categories}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                onDragEnd={handleDragEnd}
                style={{ minHeight: 100 }} // ドラッグ領域確保のため
              />
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
    borderRadius: 10,
    overflow: 'hidden', // 角丸を維持
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Palette.text,
  },
  body: {
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingBottom: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 15,
  },
  hint: { fontSize: 12, color: '#999' },
  addBtn: { backgroundColor: Palette.primary, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  activeRow: {
    backgroundColor: '#FFF9C4', // ドラッグ中の色
    borderColor: Palette.secondary,
    shadowColor: '#000', shadowOpacity: 0.1, elevation: 5,
  },
  badge: { width: 16, height: 16, borderRadius: 8, marginRight: 10 },
  rowText: { flex: 1, fontSize: 14, color: Palette.text },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 6, marginRight: 4 },
  dragHandle: { paddingLeft: 8 },
});