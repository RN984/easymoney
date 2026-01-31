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
import { Colors } from '../../../constants/theme';
import { CoinList } from './components/Coin/CoinList';
import { FeedbackToast } from './components/FeedbackToast';
import { SegmentedProgressBar } from './components/ProgressBar/SegmentedProgressBar';
import { RadialCategoryMenu } from './components/RadialCategoryMenu';

export default function MoneyInputScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat_food');
  const [categories, setCategories] = useState<any[]>([]);
  const [location, setLocation] = useState<LocationData | undefined>(undefined);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastKey, setToastKey] = useState(0);

  useEffect(() => {
    const init = async () => {
      const cats = await fetchCategories();
      setCategories(cats);
      // 初回ロード時にカテゴリがあれば選択状態を更新するなどのロジックもここに推奨
      if (cats.length > 0 && !selectedCategoryId) {
         setSelectedCategoryId(cats[0].id);
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    };
    init();
  }, []);

  const handleAddCoin = async (coinVal: CoinValue) => {
    const newAmount = currentAmount + coinVal;
    setCurrentAmount(newAmount);

    // カテゴリ名の取得（安全策を追加）
    const categoryName = categories.find(c => c.id === selectedCategoryId)?.name || '未分類';
    
    // Toast表示更新
    setToastMessage(`${categoryName}に +${coinVal.toLocaleString()}円`);
    setToastKey(prev => prev + 1);

    try {
      const dto: CreateHouseholdDTO = {
        categoryId: selectedCategoryId,
        totalAmount: coinVal,
        createdAt: new Date(),
        location: location,
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
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color={Colors.light.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/history')} style={styles.iconButton}>
          <Ionicons name="stats-chart" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <SegmentedProgressBar 
          currentTotal={0}
          pendingAmount={currentAmount}
          budget={50000} 
        /> 
      </View>

      {/* Main Interaction Area */}
      <View style={styles.mainContent}>
        <RadialCategoryMenu 
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
        {/* ここにあった FeedbackToast を削除 */}
      </View>

      {/* Footer Area: Coins */}
      <View style={styles.footer}>
        <CoinList onPressCoin={handleAddCoin} />
      </View>

      {/* Feedback Toast (ここに移動: 最前面に表示させるため) */}
      <FeedbackToast message={toastMessage} uniqueKey={toastKey} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    position: 'relative',
    zIndex: 1, // 追加: 背面のコンテンツとしての順序を明示
  },
  footer: {
    paddingBottom: 20,
  },
});