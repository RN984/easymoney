// src/screens/MoneyInput/hooks/useMoneyInput.ts
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Category, CategoryType, CoinSettings, Household, LocationData } from '../../../index';
import { fetchBudget, fetchCategories, fetchCoinSettings } from '../../../services/masterService';
import { addItemToHousehold, createHousehold, getMonthlyTransactions } from '../../../services/transactionService';
import { useSound } from './useSound';

export const useMoneyInput = () => {
  // --- State ---
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [inputType, setInputType] = useState<CategoryType>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  const [location, setLocation] = useState<LocationData | undefined>(undefined);

  // 予算・履歴
  const [budget, setBudget] = useState<number>(0);
  const [transactions, setTransactions] = useState<Household[]>([]);
  const [coinSettings, setCoinSettings] = useState<CoinSettings>({ hiddenCoins: [], customCoins: [] });

  // UI Feedback
  const [toast, setToast] = useState<{ message: string | null; key: number }>({
    message: null,
    key: 0,
  });

  // カテゴリ選択のレースコンディション対策用Ref
  const selectedCategoryIdRef = useRef(selectedCategoryId);

  // 音声
  const { playCoinSound } = useSound();

  // 3秒ルール用Ref
  const currentHouseholdIdRef = useRef<string | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const transactionQueueRef = useRef<Promise<void>>(Promise.resolve());

  // 3秒タイマーバー用
  const [timerKey, setTimerKey] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 吹き出し用（3秒セッション内の累計）
  const [sessionAmount, setSessionAmount] = useState<number>(0);
  const [sessionCategoryName, setSessionCategoryName] = useState<string>('');

  // --- Actions ---

  // 初期化処理
  const loadData = useCallback(async () => {
    try {
      const [cats, bud, txs, cs] = await Promise.all([
        fetchCategories(),
        fetchBudget(),
        getMonthlyTransactions(new Date()),
        fetchCoinSettings(),
      ]);

      setCategories(cats);
      setBudget(bud);
      setTransactions(txs);
      setCoinSettings(cs);

      // カテゴリ初期選択（支出を優先、MoneyInputで表示可能なものだけ）
      const firstExpense = cats.find((c) => c.type !== 'income' && c.showInInput !== false);
      const firstIncome = cats.find((c) => c.type === 'income' && c.showInInput !== false);
      const initial = firstExpense || firstIncome;
      if (initial) {
        setInputType(initial.type || 'expense');
        setSelectedCategoryId(initial.id);
        selectedCategoryIdRef.current = initial.id; // Refも即時更新
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

  // 画面フォーカス時にデータを再取得
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // 3秒ルールをリセットする共通関数
  const resetThreeSecondRule = useCallback(() => {
    currentHouseholdIdRef.current = null;
    lastTapTimeRef.current = 0;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setTimerActive(false);
    setSessionAmount(0);
  }, []);

  // カテゴリ選択
  const handleSelectCategory = useCallback((id: string) => {
    // 同じカテゴリが選択された場合は何もしない
    if (id === selectedCategoryId) {
      return;
    }

    const category = categories.find((c) => c.id === id);
    if (category) {
      if (category.type) {
        setInputType(category.type);
      }
      setSelectedCategoryId(id);
      selectedCategoryIdRef.current = id; // Refも即時更新
      resetThreeSecondRule(); // 3秒ルールをリセット
    }
  }, [categories, selectedCategoryId, resetThreeSecondRule]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === inputType && c.showInInput !== false);
  }, [categories, inputType]);

  const toggleInputType = useCallback(() => {
    const nextType: CategoryType = inputType === 'expense' ? 'income' : 'expense';
    setInputType(nextType);

    const nextCategory = categories.find((c) => c.type === nextType && c.showInInput !== false);
    if (nextCategory) {
      setSelectedCategoryId(nextCategory.id);
      selectedCategoryIdRef.current = nextCategory.id; // Refも即時更新
    }
    
    resetThreeSecondRule(); // 収支変更時も3秒ルールをリセット
  }, [inputType, categories, resetThreeSecondRule]);

  // コイン追加 & 保存処理（3秒ルール付き）
  const handleAddCoin = useCallback(async (coinVal: number) => {
    const currentCategoryId = selectedCategoryIdRef.current;
    
    // カテゴリが未選択（初期状態など）なら何もしない
    if (!currentCategoryId) {
      console.warn('Category not selected, skipping coin add.');
      return;
    }

    // 1. UIフィードバック（即時実行）
    playCoinSound();
    setCurrentAmount((prev) => prev + coinVal);

    const category = categories.find((c) => c.id === currentCategoryId);
    const categoryName = category?.name || '未分類';

    setToast((prev) => ({
      message: `${categoryName}に +${coinVal.toLocaleString()}円`,
      key: prev.key + 1,
    }));

    // 2. 3秒ルール判定
    const now = Date.now();
    const timeDiff = now - lastTapTimeRef.current;
    const isContinuation = timeDiff < 3000 && currentHouseholdIdRef.current !== null;
    lastTapTimeRef.current = now;

    // 吹き出し用: セッション金額を更新
    if (isContinuation) {
      setSessionAmount((prev) => prev + coinVal);
    } else {
      setSessionAmount(coinVal);
    }
    setSessionCategoryName(categoryName);

    // 3秒タイマーバーを(再)起動
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimerActive(true);
    setTimerKey((prev) => prev + 1);
    timerRef.current = setTimeout(() => {
      setTimerActive(false);
      setSessionAmount(0);
    }, 3000);

    // 3. データ保存処理（Promise Chainで直列化）
    const transactionPromise = transactionQueueRef.current.then(async () => {
        try {
          const entryTime = new Date();

          if (isContinuation && currentHouseholdIdRef.current) {
            // 3秒以内 → 既存Headerに追記
            await addItemToHousehold(currentHouseholdIdRef.current, {
              categoryId: currentCategoryId,
              amount: coinVal,
              createdAt: entryTime,
            });
          } else {
            // 3秒超 or 新規 → 新しいHeader作成 + 明細追加
            const newHeader = await createHousehold({
              categoryId: currentCategoryId,
              totalAmount: 0,
              createdAt: entryTime,
              location: location,
            });
            currentHouseholdIdRef.current = newHeader.id;

            await addItemToHousehold(newHeader.id, {
              categoryId: currentCategoryId,
              amount: coinVal,
              createdAt: entryTime,
            });
          }

          // 履歴を再取得してバーに反映
          const txs = await getMonthlyTransactions(new Date());
          setTransactions(txs);
        } catch (error) {
          console.error('Transaction Error:', error);
          Alert.alert('エラー', '保存に失敗しました');
          currentHouseholdIdRef.current = null;
          // UI側でエラーハンドリングできるようにエラーを再スロー
          throw error;
        }
      });
      
    // 次の処理のためにPromiseチェーンを更新
    transactionQueueRef.current = transactionPromise;

    // この関数を呼び出した側が完了を待てるように、Promiseをawaitする
    await transactionPromise;

  }, [categories, location, playCoinSound]);

  return {
    // Data
    currentAmount,
    selectedCategoryId,
    categories,
    selectableCategories: filteredCategories,
    inputType,
    budget,
    transactions,
    toast,
    coinSettings,
    timerActive,
    timerKey,
    sessionAmount,
    sessionCategoryName,

    // Actions
    handleSelectCategory,
    toggleInputType,
    handleAddCoin,
    refreshData: loadData,
  };
};
