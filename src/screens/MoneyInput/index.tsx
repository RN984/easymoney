// src/screens/MoneyInput/index.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Household型を追加
import { CoinValue, CreateHouseholdDTO, Household, LocationData } from '../../index';
// fetchBudget, getMonthlyTransactions を追加
import { fetchBudget, fetchCategories } from '../../services/masterService';
import { createHousehold, getMonthlyTransactions } from '../../services/transactionService';

// Components
import { Colors } from '../../../constants/theme';
import { CoinList } from './components/Coin/CoinList';
import { FeedbackToast } from './components/FeedbackToast';
import { RadialCategoryMenu } from './components/RadialCategoryMenu';
import { SegmentedProgressBar } from './components/SegmentedProgressBar';

export default function MoneyInputScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat_food');
  const [categories, setCategories] = useState<any[]>([]);
  const [location, setLocation] = useState<LocationData | undefined>(undefined);
  
  // 追加: 予算とトランザクション（履歴）のState
  const [budget, setBudget] = useState<number>(0);
  const [transactions, setTransactions] = useState<Household[]>([]);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastKey, setToastKey] = useState(0);

  useEffect(() => {
    const init = async () => {
      // 並行してデータを取得
      const [cats, bud, txs] = await Promise.all([
        fetchCategories(),
        fetchBudget(),
        getMonthlyTransactions(new Date())
      ]);

      setCategories(cats);
      setBudget(bud);
      setTransactions(txs);

      // 初回ロード時にカテゴリがあれば選択状態を更新
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

    const categoryName = categories.find(c => c.id === selectedCategoryId)?.name || '未分類';
    
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
      
      // 保存成功後に履歴を再取得してバーに即時反映させる
      const txs = await getMonthlyTransactions(new Date());
      setTransactions(txs);
      
      // 入力中の金額をリセットするかは仕様次第ですが、ここでは連続入力のためにリセットしない場合と、
      // 確定したならリセットする場合が考えられます。
      // 元のコードではリセットしていませんでしたが、保存されたのであれば
      // currentAmount は 0 に戻すのが一般的です。今回は元の挙動を維持しつつ、もし必要なら以下を有効化してください。
      // setCurrentAmount(0); 

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

      {/* Progress Bar: Propsを修正 */}
      <View style={styles.progressContainer}>
        <SegmentedProgressBar 
          categories={categories}      // 追加
          transactions={transactions}  // 追加
          budget={budget}              // 追加
          pendingAmount={currentAmount}
        /> 
      </View>

      {/* Main Interaction Area */}
      <View style={styles.mainContent}>
        <RadialCategoryMenu 
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      </View>

      {/* Footer Area: Coins */}
      <View style={styles.footer}>
        <CoinList onPressCoin={handleAddCoin} />
      </View>

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
    zIndex: 1,
  },
  footer: {
    paddingBottom: 20,
  },
});