// src/screens/MoneyHistory/hooks/useHistoryScreen.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Household } from '../../../index'; // 適切なパスに修正してください
import { deleteHousehold, getMonthlyTransactions, updateHousehold } from '../../../services/transactionService';

export const useHistoryScreen = () => {
  // --- State ---
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<Household[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 編集モーダル用State
  const [selectedTransaction, setSelectedTransaction] = useState<Household | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // --- Computed ---
  // 収支の計算（メモ化してパフォーマンス最適化）
  const summary = useMemo(() => {
    const income = transactions.reduce((sum, t) => (t.totalAmount > 0 ? sum + t.totalAmount : sum), 0);
    const expense = transactions.reduce((sum, t) => (t.totalAmount < 0 ? sum + Math.abs(t.totalAmount) : sum), 0);
    return {
      income,
      expense,
      total: income - expense,
    };
  }, [transactions]);

  // --- Actions ---

  // データ取得
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMonthlyTransactions(currentDate);
      setTransactions(data);
    } catch (error) {
      console.error(error);
      Alert.alert('エラー', '履歴の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 月の変更
  const handleChangeMonth = useCallback((increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  }, [currentDate]);

  // 削除処理
  const handleDelete = useCallback(async (id: string) => {
    Alert.alert('確認', 'この記録を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHousehold(id);
            await loadData(); // リスト更新
            setIsEditModalVisible(false);
          } catch (e) {
            Alert.alert('エラー', '削除に失敗しました');
          }
        },
      },
    ]);
  }, [loadData]);

  // 更新処理
const handleUpdate = useCallback(async (data: Household) => {
    try {
      // 修正: 第1引数にid、第2引数に更新データを渡す
      const { id, ...updateData } = data;
      await updateHousehold(id, updateData); 
      await loadData();
      setIsEditModalVisible(false);
    } catch (e) {
      Alert.alert('エラー', '更新に失敗しました');
    }
  }, [loadData]);

  // モーダル操作
  const openEditModal = useCallback((item: Household) => {
    setSelectedTransaction(item);
    setIsEditModalVisible(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalVisible(false);
    setSelectedTransaction(null);
  }, []);

  return {
    // Data
    currentDate,
    transactions,
    summary,
    isLoading,
    selectedTransaction,
    isEditModalVisible,

    // Actions
    handleChangeMonth,
    refreshData: loadData,
    openEditModal,
    closeEditModal,
    handleDelete,
    handleUpdate,
  };
};