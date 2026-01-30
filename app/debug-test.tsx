// app/debug-test.tsx
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CreateHouseholdDTO } from '../src/index';
import { addItemToHousehold, createHeader } from '../src/services/transactionService';

// ==========================================
// Design System Colors
// ==========================================
const COLORS = {
  background: '#EAE5C6',
  text: '#272D2D',
  primary: '#6179B5',
  accent: '#DB8479',
};

export default function FirebaseTestScreen() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string>('待機中...');

  const handleTestSave = async () => {
    setLoading(true);
    setLog('保存処理を開始します...');

    try {
      // 1. 親データ (Household) の作成
      const headerData: CreateHouseholdDTO = {
        categoryId: 'cat_test_001',
        totalAmount: 0, // ★初期値は0にして、明細追加時に加算されるか確認するのが良い
        transactionName: 'テスト買い物',
        memo: 'Firebase疎通テスト',
        createdAt: new Date(),
      };
      
      const newHeader = await createHeader(headerData);
      setLog(prev => prev + `\n✅ 親データ作成成功: ID=${newHeader.id}`);

      // 2. 子データ (HouseholdItem) の追加
      await addItemToHousehold(newHeader.id, {
        categoryId: 'cat_test_001',
        item: 'おにぎり',
        amount: 500,
        memo: '明細1',
        createdAt: new Date(),
      });
      setLog(prev => prev + `\n✅ 明細1 追加成功 & 合計更新`);

      await addItemToHousehold(newHeader.id, {
        categoryId: 'cat_test_001',
        item: 'お茶',
        amount: 1000,
        memo: '明細2',
        createdAt: new Date(),
      });
      setLog(prev => prev + `\n✅ 明細2 追加成功 & 合計更新`);

      Alert.alert('成功', 'Firebaseへの保存が完了しました！');
      
    } catch (error: any) {
      console.error(error);
      setLog(prev => prev + `\n❌ エラー発生: ${error.message}`);
      Alert.alert('エラー', '保存に失敗しました。ログを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Firebase Connection Test</Text>
        
        <View style={styles.logBox}>
          <Text style={styles.logText}>{log}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleTestSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>テストデータを保存する</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  logBox: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    height: 200,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  logText: {
    color: COLORS.text,
    fontSize: 12,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});