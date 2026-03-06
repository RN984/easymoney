// src/screens/MoneyHistory/components/SummaryHeader.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../constants/theme';

interface SummaryHeaderProps {
  summary: {
    income: number;
    expense: number;
    total: number;
  };
  onIncomePress?: () => void;
  onExpensePress?: () => void;
  onTotalPress?: () => void;
}

export const SummaryHeader: React.FC<SummaryHeaderProps> = ({ summary, onIncomePress, onExpensePress, onTotalPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={onIncomePress} activeOpacity={0.7}>
        <Text style={styles.label}>収入</Text>
        <Text style={[styles.amount, { color: Colors.light.primary }]}>
          ¥{summary.income.toLocaleString()}
        </Text>
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.item} onPress={onExpensePress} activeOpacity={0.7}>
        <Text style={styles.label}>支出</Text>
        <Text style={[styles.amount, { color: Colors.light.accent }]}>
          ¥{summary.expense.toLocaleString()}
        </Text>
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.item} onPress={onTotalPress} activeOpacity={0.7}>
        <Text style={styles.label}>収支</Text>
        <Text
          style={[
            styles.amount,
            { color: summary.total >= 0 ? Colors.light.primary : Colors.light.accent },
          ]}
        >
          ¥{summary.total.toLocaleString()}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#EEE',
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
