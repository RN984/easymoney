// src/screens/MoneyHistory/index.tsx
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../constants/theme';
import { HamburgerMenu } from '../../components/HumburgerMenu';
import { MonthlyChart } from './components/MonthlyChart';
import { TransactionList } from './components/TransactionList';
import { useHistoryData } from './hooks/useHistoryData';

export default function MoneyHistoryScreen() {
  const { 
    transactions, 
    loading, 
    currentDate, 
    goToPreviousMonth, 
    goToNextMonth 
  } = useHistoryData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <HamburgerMenu /> 
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.arrowBtn}>
            <Text style={styles.arrowText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.arrowBtn}>
            <Text style={styles.arrowText}>→</Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.container}>
        <MonthlyChart transactions={transactions} currentDate={currentDate} />
        
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>履歴一覧</Text>
        </View>
        
        <TransactionList transactions={transactions} loading={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.light.background,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginHorizontal: 16,
  },
  arrowBtn: {
    padding: 8,
  },
  arrowText: {
    fontSize: 20,
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
});