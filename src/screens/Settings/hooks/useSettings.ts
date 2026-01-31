// src/screens/Settings/hooks/useSettings.ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { resetDatabase } from '../../../database/db'; // 既存のDBリセット関数
import { fetchCategories } from '../../../services/masterService';
// getAllTransactionsが存在しない場合は適宜作成するか、getMonthlyTransactionsで全期間取得するロジックに置き換えてください
import { getMonthlyTransactions } from '../../../services/transactionService';

export const useSettings = () => {
  const [isLoading, setIsLoading] = useState(false);

  // CSVエクスポート処理
  const handleExportCSV = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. データ取得（カテゴリとトランザクション）
      // ※全件取得するAPIがない場合は、適宜Serviceに追加することをお勧めします。
      // ここでは便宜上、非常に長い期間を指定して全件取得する仮実装とします。
      const start = new Date(2020, 0, 1);
      const end = new Date();
      // 実際には getAllTransactions() のような関数を作るのがベストです
      const transactions = await getMonthlyTransactions(end); // 引数の挙動に合わせて調整してください
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
      const fileUri = FileSystem.documentDirectory + 'easymoney_export.csv';
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
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
      'データの初期化',
      'すべての記録と設定が消去されます。本当によろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '初期化する',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await resetDatabase();
              Alert.alert('完了', 'データを初期化しました。アプリを再起動してください。');
            } catch (e) {
              Alert.alert('エラー', '初期化に失敗しました');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, []);

  return {
    isLoading,
    handleExportCSV,
    handleResetDatabase,
  };
};