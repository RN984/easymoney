import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
// import { resetDatabase } from '../../../database/db'; 
import { fetchCategories } from '../../../services/masterService';
import { getMonthlyTransactions } from '../../../services/transactionService';

export const useSettings = () => {
  const [isLoading, setIsLoading] = useState(false);

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
      '機能未実装',
      'データベースのリセット機能は現在準備中です。',
      [{ text: 'OK' }]
    );
  }, []);

  return {
    isLoading,
    handleExportCSV,
    handleResetDatabase,
  };
};