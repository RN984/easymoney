import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Category } from '../../../../index';

// プリセットカラー（重複なし）
const PRESET_COLORS = [
  '#4CAF50', '#81C784', '#DB8479', '#6179B5', '#F4DA61', '#272D2D', '#A0A0A0',
  '#9C27B0', '#3F51B5', '#009688', '#FF9800', '#795548', '#E91E63', '#00BCD4',
];

// アイコン候補 (30個) - ionicon名のみ
const ICON_OPTIONS = [
  'cash',
  'card',
  'wallet',
  'trending-up',
  'trending-down',
  'fast-food',
  'restaurant',
  'cafe',
  'beer',
  'cart',
  'shirt',
  'airplane',
  'car',
  'bus',
  'home',
  'water',
  'flame',
  'flash',
  'shield-checkmark',
  'wifi',
  'phone-portrait',
  'sync',
  'fitness',
  'business',
  'book',
  'game-controller',
  'film',
  'musical-notes',
  'cog',
  'heart',
  'flower',
  'sparkles',
  'paw',
  'ellipsis-horizontal-circle'
];

interface Props {
  visible: boolean;
  targetCategory: Category | null;
  onSave: (category: Category) => void;
  onClose: () => void;
}

export default function EditModal({ visible, targetCategory, onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#CCCCCC');
  const [colorInput, setColorInput] = useState('#CCCCCC');
  const [icon, setIcon] = useState('cash');
  const [iconInput, setIconInput] = useState('cash');
  const [isIconFocused, setIsIconFocused] = useState(false);
  const [isColorFocused, setIsColorFocused] = useState(false);

  useEffect(() => {
    if (visible) {
      if (targetCategory) {
        setName(targetCategory.name);
        setColor(targetCategory.color);
        setColorInput(targetCategory.color);
        setIcon(targetCategory.icon || 'cash');
        setIconInput(targetCategory.icon || 'cash');
      } else {
        setName('');
        setColor(PRESET_COLORS[0]);
        setColorInput(PRESET_COLORS[0]);
        setIcon('cash');
        setIconInput('cash');
      }
    }
  }, [visible, targetCategory]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('エラー', 'カテゴリ名を入力してください');
      return;
    }
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
      Alert.alert('エラー', '有効なカラーコードを入力してください');
      return;
    }

    onSave({
      id: targetCategory ? targetCategory.id : `cat_${Date.now()}`,
      name: name.trim(),
      color,
      icon,
      type: 'expense',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{targetCategory ? 'カテゴリ編集' : '新規作成'}</Text>
            
            {/* タイプ表示 */}
            <View style={styles.typeLabel}>
              <Text style={styles.typeLabelText}>支出</Text>
            </View>

            {/* カテゴリ名 */}
            <View style={styles.field}>
              <Text style={styles.label}>カテゴリ名</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="例: 食費" />
            </View>

            {/* カラー選択 */}
            <View style={styles.field}>
              <Text style={styles.label}>カラー</Text>
              <View style={styles.colorRow}>
                <View style={[styles.iconPreviewCircle, { backgroundColor: color }]} />
                <TextInput 
                  style={[styles.input, { flex: 1, marginLeft: 10 }]} 
                  value={isColorFocused ? colorInput : ''}
                  onChangeText={(text) => {
                    setColorInput(text);
                    setColor(text);
                  }}
                  onFocus={() => {
                    setIsColorFocused(true);
                    setColorInput(color);
                  }}
                  onBlur={() => {
                    setIsColorFocused(false);
                    setColorInput(color);
                  }}
                  maxLength={7} 
                  placeholder={color}
                  placeholderTextColor="#999"
                />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.palette}>
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.swatch, { backgroundColor: c }, color === c && styles.selectedSwatch]}
                    onPress={() => setColor(c)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* アイコン選択 */}
            <View style={styles.field}>
              <Text style={styles.label}>アイコン</Text>
              <View style={styles.iconRow}>
                <View style={[styles.iconPreviewCircle, { backgroundColor: color }]}>
                  <Ionicons name={icon as any} size={24} color="#FFF" />
                </View>
                <TextInput 
                  style={[styles.input, { flex: 1, marginLeft: 10 }]}
                  value={isIconFocused ? iconInput : ''}
                  onChangeText={(text) => {
                    setIconInput(text);
                    setIcon(text);
                  }}
                  onFocus={() => {
                    setIsIconFocused(true);
                    setIconInput(icon);
                  }}
                  onBlur={() => {
                    setIsIconFocused(false);
                    setIconInput(icon);
                  }}
                  placeholder={icon || "カスタムアイコン名を入力"}
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.iconGrid}>
                {ICON_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.iconOption,
                      icon === option && styles.iconOptionSelected,
                      { borderColor: icon === option ? color : '#DDD' }
                    ]}
                    onPress={() => setIcon(option)}
                  >
                    <Ionicons 
                      name={option as any} 
                      size={22} 
                      color={icon === option ? color : '#666'} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ボタン */}
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onClose}>
                <Text style={styles.btnTextCancel}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.save, { backgroundColor: color }]} onPress={handleSave}>
                <Text style={styles.btnTextSave}>保存</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    padding: 20 
  },
  container: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20,
    maxHeight: '85%'
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center', 
    color: '#272D2D' 
  },
  typeLabel: {
    backgroundColor: '#6179B5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  typeLabelText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  field: { 
    marginBottom: 20 
  },
  label: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#666', 
    marginBottom: 8 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 8, 
    padding: 12, 
    backgroundColor: '#FAFAFA',
    fontSize: 16
  },
  colorRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  iconRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  preview: { 
    width: 38, 
    height: 38, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#DDD' 
  },
  palette: { 
    flexDirection: 'row' 
  },
  swatch: { 
    width: 33, 
    height: 33, 
    borderRadius: 20, 
    marginRight: 8, 
    borderWidth: 1, 
    borderColor: 'transparent' 
  },
  selectedSwatch: { 
    borderColor: '#272D2D', 
    transform: [{ scale: 1.1 }] 
  },
  iconPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  iconPreviewCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  iconPreviewText: {
    fontSize: 14,
    color: '#666'
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 2
  },
  iconOptionSelected: {
    backgroundColor: '#FFF'
  },
  actions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginTop: 10
  },
  btn: { 
    flex: 1, 
    padding: 14, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  cancel: { 
    backgroundColor: '#F0F0F0', 
    marginRight: 10 
  },
  save: { 
    backgroundColor: '#6179B5' 
  },
  btnTextCancel: { 
    color: '#666', 
    fontWeight: 'bold' 
  },
  btnTextSave: { 
    color: '#FFF', 
    fontWeight: 'bold' 
  },
});
