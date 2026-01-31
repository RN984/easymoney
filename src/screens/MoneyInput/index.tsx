// src/screens/MoneyInput/index.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoinValue, CreateHouseholdDTO, LocationData } from '../../index';
import { fetchCategories } from '../../services/masterService';
import { createHousehold } from '../../services/transactionService';

// Components
import { Colors } from '../../../constants/theme'; // Colorsをインポート
import { CoinList } from './components/Coin/CoinList';
import { FeedbackToast } from './components/FeedbackToast';
import { RadialCategoryMenu } from './components/RadialCategoryMenu';
import { SegmentedProgressBar } from './components/SegmentedProgressBar';

export default function MoneyInputScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat_food'); // デフォルト
  const [categories, setCategories] = useState<any[]>([]);
  const [location, setLocation] = useState<LocationData | undefined>(undefined);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastKey, setToastKey] = useState(0); // リレンダリング用

  // 初期化：カテゴリと位置情報の許可
  useEffect(() => {
    const init = async () => {
      const cats = await fetchCategories();
      setCategories(cats);

      // 位置情報の許可リクエスト
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          // 逆ジオコーディングは必要に応じて実施
        });
      }
    };
    init();
  }, []);

  // コイン追加処理
  const handleAddCoin = async (coinVal: CoinValue) => {
    // 楽観的UI更新（ここではローカルステートのみ）
    const newAmount = currentAmount + coinVal;
    setCurrentAmount(newAmount);

    // Toast表示
    const categoryName = categories.find(c => c.id === selectedCategoryId)?.name || '未分類';
    setToastMessage(`${categoryName}に +${coinVal.toLocaleString()}円`);
    setToastKey(prev => prev + 1);

    try {
      const dto: CreateHouseholdDTO = {
        categoryId: selectedCategoryId,
        totalAmount: coinVal,
        createdAt: new Date(),
        location: location, // 位置情報を付与
      };
      await createHousehold(dto); 
    } catch (e) {
      console.error(e);
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header Area */}
      <View style={styles.header}>
         {/* 左上: 設定への導線 */}
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color={Colors.light.text} />
        </TouchableOpacity>

        {/* 右上: 履歴画面への遷移ボタン */}
        <TouchableOpacity onPress={() => router.push('/history')} style={styles.iconButton}>
          <Ionicons name="stats-chart" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar (予算消化率など) */}
      <View style={styles.progressContainer}>
        {/* 修正: Props名を定義に合わせ、必須項目を追加 */}
        <SegmentedProgressBar 
          currentTotal={0} // 一旦0またはDBから取得した値をセット
          pendingAmount={currentAmount}
          budget={50000} 
        /> 
      </View>

      {/* Main Interaction Area */}
      <View style={styles.mainContent}>
        {/* カテゴリ選択 (Radial Menu) */}
        {/* 修正: Props名を定義に合わせる */}
        <RadialCategoryMenu 
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        {/* Feedback Toast (Overlaid) */}
        <FeedbackToast message={toastMessage} uniqueKey={toastKey} />
      </View>

      {/* Footer Area: Coins */}
      <View style={styles.footer}>
        <CoinList onPressCoin={handleAddCoin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // 修正: COLORS.background -> Colors.light.background
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  iconButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // For Toast positioning
  },
  footer: {
    paddingBottom: 20,
  },
});