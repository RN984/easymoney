// src/screens/MoneyInput/components/CategorySelection.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Category } from '../../../../src/index';
import { RadialCategoryMenu } from '../components/RadialCategoryMenu';

interface CategorySelectionProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategorySelection: React.FC<CategorySelectionProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <RadialCategoryMenu 
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={onSelectCategory}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
});