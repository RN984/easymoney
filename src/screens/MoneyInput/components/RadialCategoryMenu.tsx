import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Category } from '../../../index';

interface RadialCategoryMenuProps {
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

// 仮のマスタデータ (後でServiceから取得するように変更します)
const MOCK_CATEGORIES: Category[] = [
  { id: 'cat_food', name: '食費', color: '#FF7043' },
  { id: 'cat_transport', name: '交通費', color: '#42A5F5' },
  { id: 'cat_daily', name: '日用品', color: '#66BB6A' },
  { id: 'cat_hobby', name: '趣味', color: '#AB47BC' },
  { id: 'cat_other', name: 'その他', color: '#78909C' },
];

export const RadialCategoryMenu: React.FC<RadialCategoryMenuProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>カテゴリ選択</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOCK_CATEGORIES.map((cat) => {
          const isSelected = cat.id === selectedCategoryId;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                isSelected && { backgroundColor: cat.color, borderColor: cat.color },
                !isSelected && { borderColor: cat.color },
              ]}
              onPress={() => onSelectCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  isSelected ? styles.categoryTextSelected : { color: cat.color },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  label: {
    marginLeft: 16,
    marginBottom: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  categoryText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
});