import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Category } from '../../../index'; // src/index.ts からインポート

interface RadialCategoryMenuProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  radius?: number; // メニューの半径
}

const { width } = Dimensions.get('window');
const MENU_SIZE = width * 0.9; // コンテナのサイズ
const BUTTON_SIZE = 60; // 各カテゴリボタンのサイズ

export const RadialCategoryMenu: React.FC<RadialCategoryMenuProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  radius = 120, // デフォルト半径
}) => {
  const centerX = MENU_SIZE / 2;
  const centerY = MENU_SIZE / 2;

  return (
    <View style={[styles.container, { width: MENU_SIZE, height: MENU_SIZE }]}>
      {/* 中心装飾（オプション） */}
      <View style={[styles.centerDeco, { left: centerX - 10, top: centerY - 10 }]} />

      {categories.map((category, index) => {
        // 角度計算: -90度(真上)からスタートし、等間隔に配置
        const angleStep = (2 * Math.PI) / categories.length;
        const angle = -Math.PI / 2 + index * angleStep;

        // 座標計算
        const x = centerX + radius * Math.cos(angle) - BUTTON_SIZE / 2;
        const y = centerY + radius * Math.sin(angle) - BUTTON_SIZE / 2;

        const isSelected = selectedCategoryId === category.id;

        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              {
                left: x,
                top: y,
                backgroundColor: category.color,
                borderColor: isSelected ? '#333' : 'transparent',
                borderWidth: isSelected ? 3 : 0,
                transform: [{ scale: isSelected ? 1.2 : 1.0 }],
              },
            ]}
            onPress={() => onSelectCategory(category.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: 20,
    // デバッグ用に背景色をつける場合はコメントアウト解除
    // backgroundColor: 'rgba(0,0,0,0.05)', 
    borderRadius: MENU_SIZE / 2,
  },
  centerDeco: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ccc',
    opacity: 0.3,
  },
  categoryButton: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});