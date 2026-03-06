// src/screens/MoneyInput/components/CategorySelection.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Category, CategoryType } from '../../../index';
import { RadialCategoryMenu } from '../components/RadialCategoryMenu';

interface CategorySelectionProps {
  categories: Category[];
  selectedCategoryId: string;
  inputType: CategoryType;
  onToggleInputType: () => void;
  onSelectCategory: (id: string) => void;
}

export const CategorySelection: React.FC<CategorySelectionProps> = ({
  categories,
  selectedCategoryId,
  inputType,
  onToggleInputType,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <RadialCategoryMenu 
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        inputType={inputType}
        onToggleInputType={onToggleInputType}
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