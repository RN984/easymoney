import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { fetchBaseSalary, fetchCategories, fetchSalaryDay, updateBaseSalary, updateSalaryDay } from '../../../services/masterService';
import { getMonthlyTransactions, resetAllData } from '../../../services/transactionService';

// salaryDay: 0 = 月末, 1-28 = カスタム日付
export const useSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [salaryDay, setSalaryDay] = useState<number>(1);

  // 初回ロードで基本給を取得
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [s, day] = await Promise.all([
          fetchBaseSalary(),
          fetchSalaryDay(),
        ]);
        if (mounted) {
          setBaseSalary(s);
          setSalaryDay(day);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // CSVエクスポート処理
  const handleExportCSV = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. データ取得
      const end = new Date();
      const transactions = await getMonthlyTransactions(end);
      const categories = await fetchCategories();

      // 2. CSVデータ生成
      const header = '日付,カテゴリ,金額,メモ\n';
      const rows = transactions.map(t => {
        const catName = categories.find(c => c.id === t.categoryId)?.name || '未分類';
        const dateStr = new Date(t.createdAt).toLocaleDateString('ja-JP');
        return `${dateStr},${catName},${t.totalAmount},${t.transactionName || ''}`;
      }).join('\n');

      const csvContent = header + rows;

      // 3. ファイル書き出し
      // 【修正】TypeScriptの型エラーを回避するため、一時的にany型として扱います
      const fs = FileSystem as any;
      const dir = fs.documentDirectory;

      if (!dir) {
        throw new Error('デバイスの保存領域（documentDirectory）にアクセスできません');
      }

      const fileUri = dir + 'easymoney_export.csv';
      
      // EncodingTypeのエラーも回避するため、直接文字列を指定
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: 'utf8'
      });

      // 4. シェア
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('エラー', 'このデバイスでは共有機能が利用できません');
      }

    } catch (e) {
      console.error(e);
      Alert.alert('エラー', 'CSVのエクスポートに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // DBリセット処理
  const handleResetDatabase = useCallback(() => {
    Alert.alert(
      'データベースリセット',
      '全ての家計簿データと設定が削除されます。この操作は取り消せません。本当にリセットしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await resetAllData();
              setBaseSalary(0);
              setSalaryDay(1);
              Alert.alert('完了', 'データベースをリセットしました。');
            } catch (e) {
              console.error(e);
              Alert.alert('エラー', 'データベースのリセットに失敗しました。');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, []);

  const handleUpdateBaseSalary = useCallback(async (value: number) => {
    setIsLoading(true);
    try {
      await updateBaseSalary(value);
      setBaseSalary(value);
    } catch (e) {
      console.error(e);
      Alert.alert('エラー', '基本給の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateSalaryDay = useCallback(async (day: number) => {
    try {
      await updateSalaryDay(day);
      setSalaryDay(day);
    } catch (e) {
      console.error(e);
      Alert.alert('エラー', '給料日の保存に失敗しました');
    }
  }, []);

  return {
    isLoading,
    handleExportCSV,
    handleResetDatabase,
    baseSalary,
    salaryDay,
    handleUpdateBaseSalary,
    handleUpdateSalaryDay,
  };
};
