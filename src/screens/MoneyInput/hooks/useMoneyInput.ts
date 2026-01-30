import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { CoinValue, Household } from '../../../index';
import { addItemToHousehold, createHousehold, getMonthlyTransactions } from '../../../services/transactionService';
import { useSound } from './useSound';

// 3秒ルール
const TIME_WINDOW_MS = 3000;

interface FloatingCoinData {
  id: string;
  value: CoinValue;
  x: number;
  y: number;
}

export const useMoneyInput = (initialCategoryId: string) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [isSaving, setIsSaving] = useState(false);
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoinData[]>([]);
  
  // 今月の履歴データ（プログレスバー用）
  const [monthlyTransactions, setMonthlyTransactions] = useState<Household[]>([]);

  // 状態管理
  const lastTapTimeRef = useRef<number>(0);
  const currentHouseholdIdRef = useRef<string | null>(null);

  // 効果音
  const { playCoinSound } = useSound();

  // 月次データの読み込み
  const fetchMonthlyData = useCallback(async () => {
    try {
      const now = new Date();
      const data = await getMonthlyTransactions(now);
      setMonthlyTransactions(data);
    } catch (error) {
      console.error('Failed to fetch monthly data', error);
    }
  }, []);

  // 初回マウント時にデータ取得
  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData]);

  /**
   * コインが押されたときの処理
   */
  const handlePressCoin = async (value: CoinValue, x: number, y: number) => {
    // 1. 効果音再生
    await playCoinSound();

    // 2. アニメーション用コイン追加
    const coinId = Math.random().toString(36).substring(7);
    setFloatingCoins((prev) => [...prev, { id: coinId, value, x, y }]);

    // 3. Firestore保存ロジック (Optimistic UI的に裏で走らせるが、ローディングは出す)
    // ※ 実際はawaitしないと連続タップ時にIDがずれる可能性があるため、簡易的な排他制御が必要だが
    //    JSのシングルスレッド特性を利用して ref で管理する。
    await processTransaction(value);
  };

  /**
   * トランザクション処理本体
   */
  const processTransaction = async (amount: number) => {
    const now = Date.now();
    const timeDiff = now - lastTapTimeRef.current;

    setIsSaving(true);
    try {
      if (currentHouseholdIdRef.current && timeDiff < TIME_WINDOW_MS) {
        // --- A. 追記 (3秒以内) ---
        await addItemToHousehold(currentHouseholdIdRef.current, {
          categoryId: selectedCategoryId,
          amount: amount,
          createdAt: new Date(),
        });
        console.log(`Updated household: ${currentHouseholdIdRef.current} (+${amount})`);

      } else {
        // --- B. 新規作成 (3秒経過 or 初回) ---
        const newHousehold = await createHousehold({
          categoryId: selectedCategoryId,
          totalAmount: amount,
          createdAt: new Date(),
        });
        currentHouseholdIdRef.current = newHousehold.id;
        console.log(`Created new household: ${newHousehold.id}`);
      }

      // 最終タップ時間を更新
      lastTapTimeRef.current = now;

      // データを再取得して表示を更新
      await fetchMonthlyData();

    } catch (error) {
      Alert.alert('Error', '保存に失敗しました。');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * アニメーション完了後のクリーンアップ
   */
  const removeFloatingCoin = (id: string) => {
    setFloatingCoins((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    selectedCategoryId,
    setSelectedCategoryId,
    isSaving,
    floatingCoins,
    monthlyTransactions, // 外部公開
    handlePressCoin,
    removeFloatingCoin,
  };
};