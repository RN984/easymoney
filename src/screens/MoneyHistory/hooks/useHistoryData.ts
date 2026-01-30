// src/screens/MoneyHistory/hooks/useHistoryData.ts
import { useCallback, useEffect, useState } from 'react';
import { Household } from '../../../index';
import { getMonthlyTransactions } from '../../../services/transactionService';

export const useHistoryData = () => {
  const [transactions, setTransactions] = useState<Household[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const fetchTransactions = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMonthlyTransactions(date);
      setTransactions(data);
    } catch (err) {
      setError('データの取得に失敗しました。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初期表示時および月変更時にデータ取得
  useEffect(() => {
    fetchTransactions(currentDate);
  }, [fetchTransactions, currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return {
    transactions,
    loading,
    error,
    currentDate,
    goToPreviousMonth,
    goToNextMonth,
    refresh: () => fetchTransactions(currentDate),
  };
};