import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { CoinValue, CreateHouseholdDTO, CreateHouseholdItemDTO } from '../../index';
import { addItem, createHeader } from '../../services/transactionService';
import { CoinList } from './components/CoinList';
import { RadialCategoryMenu } from './components/RadialCategoryMenu';

export default function MoneyInputScreen() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat_food');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * フェーズ2: 単純保存ロジック
   * コインをタップするたびに、新しいHousehold(親)とHouseholdItem(子)を作成する。
   * (3秒ルールや親の合算ロジックはフェーズ3で実装)
   */
  const handlePressCoin = async (value: CoinValue) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const now = new Date();

      // 1. 親(Household)の作成
      // 今回の入力額 = 合計額 として作成
      const newHeaderData: CreateHouseholdDTO = {
        categoryId: selectedCategoryId,
        totalAmount: value,
        createdAt: now,
      };
      
      const createdHeader = await createHeader(newHeaderData);

      // 2. 子(Item)の追加
      const newItemData: Omit<CreateHouseholdItemDTO, 'transactionId'> = {
        categoryId: selectedCategoryId,
        amount: value,
        createdAt: now,
      };

      await addItem(createdHeader.id, newItemData);

      console.log(`Saved: ${value} yen to Household ID: ${createdHeader.id}`);
      // 成功フィードバック（本番ではToastなどを使用推奨）
      // Alert.alert('保存完了', `${value}円を保存しました`);
      
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
        <RadialCategoryMenu
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryContainer: {
    paddingVertical: 8,
  },
  coinContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});