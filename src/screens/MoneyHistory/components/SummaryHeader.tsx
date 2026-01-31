// src/screens/MoneyHistory/components/SummaryHeader.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../../src/constants/theme';

interface SummaryHeaderProps {
  summary: {
    income: number;
    expense: number;
    total: number;
  };
}

export const SummaryHeader: React.FC<SummaryHeaderProps> = ({ summary }) => {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.label}>支出</Text>
        <Text style={[styles.amount, { color: Colors.light.accent }]}>
          ¥{summary.expense.toLocaleString()}
        </Text>
      </View>
      <View style={[styles.divider]} />
      <View style={styles.item}>
        <Text style={styles.label}>合計</Text>
        <Text style={[styles.amount, { color: Colors.light.text }]}>
          ¥{summary.total.toLocaleString()}
        </Text>
      </View>
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