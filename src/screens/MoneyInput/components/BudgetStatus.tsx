// src/screens/MoneyInput/components/BudgetStatus.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Category, Household } from '../../../index';
import { SegmentedProgressBar } from './SegmentedProgressBar';

interface BudgetStatusProps {
  categories: Category[];
  transactions: Household[];
  budget: number;
  currentAmount: number;
}

export const BudgetStatus: React.FC<BudgetStatusProps> = ({
  categories,
  transactions,
  budget,
  currentAmount,
}) => {
  return (
    <View style={styles.container}>
      <SegmentedProgressBar 
        categories={categories}
        transactions={transactions}
        budget={budget}
        pendingAmount={currentAmount}
      /> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
});