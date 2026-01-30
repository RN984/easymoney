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
import { DEFAULT_CATEGORIES } from '../../../../../constants/categories';
import { Category } from '../../../../index';

// プリセットカラー
const PRESET_COLORS = [
  ...new Set(DEFAULT_CATEGORIES.map((c) => c.color)),
  '#4CAF50', '#9C27B0', '#3F51B5', '#009688', '#FF9800', '#795548',
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
  const [icon, setIcon] = useState('📁');

  useEffect(() => {
    if (visible) {
      if (targetCategory) {
        setName(targetCategory.name);
        setColor(targetCategory.color);
        setIcon(targetCategory.icon);
      } else {
        setName('');
        setColor(PRESET_COLORS[0]);
        setIcon('📁');
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
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{targetCategory ? 'カテゴリ編集' : '新規作成'}</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>カテゴリ名</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="例: 食費" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>カラー</Text>
            <View style={styles.colorRow}>
              <View style={[styles.preview, { backgroundColor: color }]} />
              <TextInput style={[styles.input, { flex: 1 }]} value={color} onChangeText={setColor} maxLength={7} />
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

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onClose}>
              <Text style={styles.btnTextCancel}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.save]} onPress={handleSave}>
              <Text style={styles.btnTextSave}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  container: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#272D2D' },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, backgroundColor: '#FAFAFA' },
  colorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  preview: { width: 38, height: 38, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#DDD' },
  palette: { flexDirection: 'row' },
  swatch: { width: 33, height: 33, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
  selectedSwatch: { borderColor: '#272D2D', transform: [{ scale: 1 }] },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancel: { backgroundColor: '#F0F0F0', marginRight: 10 },
  save: { backgroundColor: '#6179B5' },
  btnTextCancel: { color: '#666', fontWeight: 'bold' },
  btnTextSave: { color: '#FFF', fontWeight: 'bold' },
});