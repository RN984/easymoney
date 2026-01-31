import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Category, CoinValue, CreateHouseholdDTO } from '../../../index'; // 必要に応じてパス確認
import { fetchCategories } from '../../../services/masterService';
import { createHousehold, getMonthlyTransactions } from '../../../services/transactionService';

// アニメーション用のコイン型定義
export interface FloatingCoinData {
  id: string;
  value: CoinValue;
  x: number;
  y: number;
}

// 引数を受け取れるように修正
export const useMoneyInput = (initialCategoryId: string) => {
  const [amount, setAmount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  // 初期値を引数から設定
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [toast, setToast] = useState({ visible: false, message: '', color: '' });
  // 保存中の状態を追加
  const [isSaving, setIsSaving] = useState(false);
  
  // Floating Coin Animation State
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoinData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cats = await fetchCategories();
    setCategories(cats);
    // カテゴリが取得でき、かつ現在の選択が空なら先頭を選択
    if (cats.length > 0 && !selectedCategoryId) {
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

  const handlePressCoin = (value: CoinValue, x: number, y: number) => {
    setAmount((prev) => prev + value);
    
    const id = Math.random().toString(36).substr(2, 9);
    setFloatingCoins(prev => [...prev, { id, value, x, y }]);

    const category = categories.find(c => c.id === selectedCategoryId);
    // categoriesが空の場合はデフォルト等から探す必要があるかもしれませんが、
    // ここでは取得済みと仮定、またはUI側で制御
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

    setIsSaving(true); // 保存開始
    try {
      const locationData = await getCurrentLocation();

      const newTransaction: CreateHouseholdDTO = {
        categoryId: selectedCategoryId,
        transactionName: '',
        totalAmount: amount,
        createdAt: new Date(),
        location: locationData,
      };

      await createHousehold(newTransaction);
      
      Alert.alert('完了', '記録しました');
      setAmount(0);
      await fetchMonthlyTotal();

    } catch (error) {
      Alert.alert('エラー', '保存に失敗しました');
      console.error(error);
    } finally {
      setIsSaving(false); // 保存終了
    }
  };

  return {
    amount,
    categories,
    selectedCategoryId,
    setSelectedCategoryId, // 追加
    monthlyTotal,
    toast,
    isSaving, // 追加
    floatingCoins,
    handleSelectCategory,
    handlePressCoin,
    removeFloatingCoin,
    handleReset,
    handleSubmit,
    refreshTotal: fetchMonthlyTotal,
  };
};