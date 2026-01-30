import * as Location from 'expo-location'; // 追加
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Category, CoinValue, CreateHouseholdDTO } from '../../../index';
import { fetchCategories } from '../../../services/masterService';
import { createHousehold, getMonthlyTransactions } from '../../../services/transactionService';

// アニメーション用のコイン型定義
export interface FloatingCoinData {
  id: string;
  value: CoinValue;
  x: number;
  y: number;
}

export const useMoneyInput = () => {
  const [amount, setAmount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [toast, setToast] = useState({ visible: false, message: '', color: '' });
  
  // Floating Coin Animation State
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoinData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cats = await fetchCategories();
    setCategories(cats);
    if (cats.length > 0) {
      setSelectedCategoryId(cats[0].id);
    }
    await fetchMonthlyTotal();
  };

  const fetchMonthlyTotal = async () => {
    try {
      const transactions = await getMonthlyTransactions(new Date());
      const total = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
      setMonthlyTotal(total);
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (message: string, color: string) => {
    setToast({ visible: true, message, color });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2000);
  };

  const handleSelectCategory = (id: string) => {
    setSelectedCategoryId(id);
  };

  // 修正: 座標を受け取るように変更
  const handlePressCoin = (value: CoinValue, x: number, y: number) => {
    setAmount((prev) => prev + value);
    
    // アニメーション用コインを追加
    const id = Math.random().toString(36).substr(2, 9);
    setFloatingCoins(prev => [...prev, { id, value, x, y }]);

    const category = categories.find(c => c.id === selectedCategoryId);
    if (category) {
      showToast(`${category.name}に +${value.toLocaleString()}円`, category.color);
    }
  };

  const removeFloatingCoin = (id: string) => {
    setFloatingCoins(prev => prev.filter(c => c.id !== id));
  };

  const handleReset = () => {
    setAmount(0);
  };

  // 現在地を取得するヘルパー関数
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return undefined;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.log('Location fetch failed:', error);
      return undefined;
    }
  };

  const handleSubmit = async () => {
    if (amount === 0) return;

    try {
      // 位置情報の取得 (失敗しても保存は続行)
      const locationData = await getCurrentLocation();

      const newTransaction: CreateHouseholdDTO = {
        categoryId: selectedCategoryId,
        transactionName: '', // 必要に応じて入力させるが、Input画面では省略
        totalAmount: amount,
        createdAt: new Date(),
        location: locationData, // 取得した位置情報をセット
      };

      await createHousehold(newTransaction);
      
      Alert.alert('完了', '記録しました');
      setAmount(0);
      await fetchMonthlyTotal();

    } catch (error) {
      Alert.alert('エラー', '保存に失敗しました');
      console.error(error);
    }
  };

  return {
    amount,
    categories,
    selectedCategoryId,
    monthlyTotal,
    toast,
    floatingCoins, // 追加
    handleSelectCategory,
    handlePressCoin, // 名称変更 (handleDropCoin -> handlePressCoin)
    removeFloatingCoin, // 追加
    handleReset,
    handleSubmit,
    refreshTotal: fetchMonthlyTotal,
  };
};