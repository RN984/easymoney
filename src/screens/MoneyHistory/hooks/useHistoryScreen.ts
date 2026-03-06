// src/screens/MoneyHistory/hooks/useHistoryScreen.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Category, Household } from '../../../index';
import { fetchBaseSalary, fetchCategories, fetchSalaryDay } from '../../../services/masterService';
import { deleteHousehold, getMonthlyTransactions, updateHousehold } from '../../../services/transactionService';

export const useHistoryScreen = () => {
  // --- State ---
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<Household[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [salaryDay, setSalaryDay] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);

  // 編集モーダル用State
  const [selectedTransaction, setSelectedTransaction] = useState<Household | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // 収入追加モーダル用State
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);

  // --- Computed ---
  // 収入取引を抽出
  const incomeTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const category = categories.find((c) => c.id === t.categoryId);
      return category?.type === 'income';
    });
  }, [transactions, categories]);

  // 支出取引を抽出
  const expenseTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const category = categories.find((c) => c.id === t.categoryId);
      return category?.type !== 'income';
    });
  }, [transactions, categories]);

  // 収支の計算
  const summary = useMemo(() => {
    let income = baseSalary;
    let expense = 0;
    
    transactions.forEach((t) => {
      const category = categories.find((c) => c.id === t.categoryId);
      const categoryType = category?.type || 'expense';
      
      if (categoryType === 'income') {
        income += t.totalAmount;
      } else {
        expense += t.totalAmount;
      }
    });
    
    return {
      income,
      expense,
      total: income - expense,
    };
  }, [transactions, baseSalary, categories]);

  // 固定収入のリストアイテムを作成
  const fixedIncomeTransactions = useMemo((): Household[] => {
    if (baseSalary > 0) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // salaryDayが0の場合は月末（その月の最終日）
      let salaryDate: Date;
      if (salaryDay === 0) {
        // その月の末日を取得
        salaryDate = new Date(year, month + 1, 0);
      } else {
        salaryDate = new Date(year, month, salaryDay);
      }

      return [{
        id: 'base_salary',
        categoryId: 'cat_fixed_income',
        totalAmount: baseSalary,
        createdAt: salaryDate,
      }];
    }
    return [];
  }, [baseSalary, salaryDay, currentDate]);

  // --- Actions ---

  // データ取得
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [data, salary, day, cats] = await Promise.all([
        getMonthlyTransactions(currentDate),
        fetchBaseSalary(),
        fetchSalaryDay(),
        fetchCategories(),
      ]);
      setTransactions(data);
      setBaseSalary(salary);
      setSalaryDay(day);
      setCategories(cats);
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
    // 基本給の場合は削除できない
    if (id === 'base_salary') {
      Alert.alert('確認', '基本給は削除できません');
      return;
    }

    Alert.alert('確認', 'この記録を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHousehold(id);
            await loadData();
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
    // 基本給の場合は編集できない
    if (item.id === 'base_salary') {
      Alert.alert('確認', '基本給は編集できません');
      return;
    }
    setSelectedTransaction(item);
    setIsEditModalVisible(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalVisible(false);
    setSelectedTransaction(null);
  }, []);

  // 収入追加モーダル操作
  const openIncomeModal = useCallback(() => {
    setIsIncomeModalVisible(true);
  }, []);

  const closeIncomeModal = useCallback(() => {
    setIsIncomeModalVisible(false);
  }, []);

  return {
    // Data
    currentDate,
    transactions,
    summary,
    isLoading,
    selectedTransaction,
    isEditModalVisible,
    isIncomeModalVisible,
    incomeTransactions,
    expenseTransactions,
    fixedIncomeTransactions,
    categories,
    baseSalary,

    // Actions
    handleChangeMonth,
    refreshData: loadData,
    openEditModal,
    closeEditModal,
    handleDelete,
    handleUpdate,
    openIncomeModal,
    closeIncomeModal,
  };
};
