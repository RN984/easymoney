// src/screens/MoneyInput/hooks/useMoneyInput.ts
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Category, CoinValue, CreateHouseholdDTO, Household, LocationData } from '../../../index';
import { fetchBudget, fetchCategories } from '../../../services/masterService';
import { createHousehold, getMonthlyTransactions } from '../../../services/transactionService';

export const useMoneyInput = () => {
  // --- State ---
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat_food');
  const [categories, setCategories] = useState<Category[]>([]);
  const [location, setLocation] = useState<LocationData | undefined>(undefined);
  
  // 予算・履歴
  const [budget, setBudget] = useState<number>(0);
  const [transactions, setTransactions] = useState<Household[]>([]);

  // UI Feedback
  const [toast, setToast] = useState<{ message: string | null; key: number }>({
    message: null,
    key: 0,
  });

  // --- Actions ---

  // 初期化処理
  const loadData = useCallback(async () => {
    try {
      const [cats, bud, txs] = await Promise.all([
        fetchCategories(),
        fetchBudget(),
        getMonthlyTransactions(new Date()),
      ]);

      setCategories(cats);
      setBudget(bud);
      setTransactions(txs);

      // カテゴリ初期選択
      if (cats.length > 0) {
        // 既存の選択がなければ先頭を選択（必要に応じてロジック調整）
        setSelectedCategoryId((prev) => prev || cats[0].id);
      }

      // 位置情報取得
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Failed to load data', error);
      Alert.alert('エラー', 'データの読み込みに失敗しました');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // カテゴリ選択
  const handleSelectCategory = useCallback((id: string) => {
    setSelectedCategoryId(id);
  }, []);

  // コイン追加 & 保存処理
  const handleAddCoin = useCallback(async (coinVal: CoinValue) => {
    // 画面上の合計金額を更新（セッション用）
    setCurrentAmount((prev) => prev + coinVal);

    const category = categories.find((c) => c.id === selectedCategoryId);
    const categoryName = category?.name || '未分類';

    // トースト表示更新
    setToast((prev) => ({
      message: `${categoryName}に +${coinVal.toLocaleString()}円`,
      key: prev.key + 1,
    }));

    try {
      const dto: CreateHouseholdDTO = {
        categoryId: selectedCategoryId,
        totalAmount: coinVal,
        createdAt: new Date(),
        location: location,
      };
      
      // 保存実行
      await createHousehold(dto);

      // 履歴を再取得してバーに反映
      const txs = await getMonthlyTransactions(new Date());
      setTransactions(txs);
      
    } catch (e) {
      console.error(e);
      Alert.alert('エラー', '保存に失敗しました');
    }
  }, [categories, selectedCategoryId, location]);

  return {
    // Data
    currentAmount,
    selectedCategoryId,
    categories,
    budget,
    transactions,
    toast,
    
    // Actions
    handleSelectCategory,
    handleAddCoin,
    refreshData: loadData,
  };
};