import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NestableScrollContainer } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Palette } from '../../../constants/theme';
import { fetchBudget, updateBudget } from '../../services/masterService';
import Accordion from './Category/components/Accordion';

export default function SettingsScreen() {
  const [budgetInput, setBudgetInput] = useState('0');

  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    const b = await fetchBudget();
    setBudgetInput(b.toString());
  };

  const handleSaveBudget = async () => {
    const val = parseInt(budgetInput, 10);
    if (isNaN(val) || val < 0) {
      Alert.alert('エラー', '有効な数値を入力してください');
      return;
    }
    await updateBudget(val);
    Alert.alert('完了', '予算を保存しました');
  };

  return (
    <SafeAreaView style={styles.container}>
      <NestableScrollContainer contentContainerStyle={styles.content}>
        <Text style={styles.title}>設定</Text>
        
        {/* 予算設定セクション（新規追加） */}
        <View style={styles.section}>
          <Text style={styles.label}>月間予算 (円)</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="numeric"
              placeholder="例: 50000"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveBudget}>
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.description}>
            ホーム画面のプログレスバーの上限として使用されます。
          </Text>
        </View>

        {/* ユーザー設定セクション */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>カテゴリ設定</Text>
        </View>

        <Accordion />
        <View style={styles.section}>
          <Text style={styles.label}>その他</Text>
          <Text style={styles.description}>
            その他の設定項目は順次追加予定です。
          </Text>
        </View>
        
      </NestableScrollContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Palette.text,
  },
  sectionHeader: {
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: Palette.text,
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: Palette.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});