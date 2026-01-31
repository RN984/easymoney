import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Category, CoinValue, CreateHouseholdDTO, Household } from '../../../index';
import { fetchBudget, fetchCategories } from '../../../services/masterService'; // fetchBudget追加
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [transactions, setTransactions] = useState<Household[]>([]); // 追加
  const [budget, setBudget] = useState<number>(0); // 追加
  const [toast, setToast] = useState({ visible: false, message: '', color: '' });
  const [isSaving, setIsSaving] = useState(false);
  
  const [floatingCoins, setFloatingCoins] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 並行してデータ取得
      const [cats, bud] = await Promise.all([
        fetchCategories(),
        fetchBudget()
      ]);
      
      setCategories(cats);
      setBudget(bud);

      if (cats.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(cats[0].id);
      }
      await fetchMonthlyTotal();
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMonthlyTotal = async () => {
    try {
      const txs = await getMonthlyTransactions(new Date());
      const total = txs.reduce((sum, t) => sum + t.totalAmount, 0);
      setTransactions(txs); // トランザクション自体もStateに保存
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
    setIsSaving(true);
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
      await fetchMonthlyTotal(); // 再取得で反映

    } catch (error) {
      Alert.alert('エラー', '保存に失敗しました');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    amount,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    monthlyTotal,
    transactions, // 追加
    budget, // 追加
    toast,
    isSaving,
    floatingCoins,
    handleSelectCategory,
    handlePressCoin,
    removeFloatingCoin,
    handleReset,
    handleSubmit,
    refreshTotal: fetchMonthlyTotal,
  };
};