import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_CATEGORIES } from '../../../constants/categories';
import { CoinValue, CreateHouseholdDTO, CreateHouseholdItemDTO } from '../../index';
import { addItem, createHeader } from '../../services/transactionService';
import { CoinList } from './components/CoinList';
import { RadialCategoryMenu } from './components/RadialCategoryMenu';

export default function MoneyInput() {
  // 初期値をカテゴリ配列の最初のIDなどにすると安全です
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(DEFAULT_CATEGORIES[0].id);
  const [isSaving, setIsSaving] = useState(false);

  const handlePressCoin = async (value: CoinValue) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const now = new Date();

      const newHeaderData: CreateHouseholdDTO = {
        categoryId: selectedCategoryId,
        totalAmount: value,
        createdAt: now,
      };
      
      const createdHeader = await createHeader(newHeaderData);

      const newItemData: Omit<CreateHouseholdItemDTO, 'transactionId'> = {
        categoryId: selectedCategoryId,
        amount: value,
        createdAt: now,
      };

      await addItem(createdHeader.id, newItemData);

      console.log(`Saved: ${value} yen to Household ID: ${createdHeader.id}`);
      // フィードバックがあればここに記述
      
    } catch (error) {
      console.error(error);
      Alert.alert('エラー', 'データの保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EasyMoney Input</Text>
      </View>

      <View style={styles.categoryContainer}>
        {/* ★修正箇所: categories プロパティを渡す */}
        <RadialCategoryMenu
          categories={DEFAULT_CATEGORIES} 
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      </View>

      <View style={styles.coinContainer}>
        <CoinList onPressCoin={handlePressCoin} />
      </View>

      {isSaving && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAE5C6', // Design System: Background (Main)
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#272D2D', // Design System: Border color
    alignItems: 'center',
    backgroundColor: '#EAE5C6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#272D2D', // Design System: Text
  },
  categoryContainer: {
    paddingVertical: 20, // レイアウト調整
    alignItems: 'center',
  },
  coinContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(39, 45, 45, 0.5)', // Design Systemベースの半透明
    justifyContent: 'center',
    alignItems: 'center',
  },
});