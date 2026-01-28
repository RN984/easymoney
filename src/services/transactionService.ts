import { getDBConnection } from '../database/db';
import { TransactionJoinResult } from '../index';

// 簡易的ながら衝突しにくいID生成 (タイムスタンプ + ランダムサフィックス)
const generateId = (prefix: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
};

const getNowISO = (): string => new Date().toISOString();

export const transactionService = {
  /**
   * 1. 親(Household)ヘッダーの新規作成
   * @param categoryId カテゴリID
   * @returns 生成されたtransactionId
   */
  createHeader: async (categoryId: string): Promise<string> => {
    const db = await getDBConnection();
    const newId = generateId('H');
    const now = getNowISO();
    const defaultName = '新規入力'; // デフォルト名称

    try {
      // transaction_name カラムに注意
      await db.runAsync(
        'INSERT INTO T_Household (id, categoryId, transaction_name, createdAt) VALUES (?, ?, ?, ?)',
        newId, categoryId, defaultName, now
      );
      console.log(`[DB] Created Header: ${newId}`);
      return newId;
    } catch (error) {
      console.error('[DB] createHeader Error', error);
      throw error;
    }
  },

  /**
   * 2. 子(HouseholdItem)アイテムの追加
   * @param transactionId 親のID (Household.id)
   * @param categoryId カテゴリID
   * @param amount 金額
   */
  addItem: async (transactionId: string, categoryId: string, amount: number): Promise<void> => {
    const db = await getDBConnection();
    const newItemId = generateId('I');

    try {
      await db.runAsync(
        'INSERT INTO T_HouseholdItem (id, transactionId, categoryId, amount) VALUES (?, ?, ?, ?)',
        newItemId, transactionId, categoryId, amount
      );
      console.log(`[DB] Added Item: ${amount} to Header: ${transactionId}`);
    } catch (error) {
      console.error('[DB] addItem Error', error);
      throw error;
    }
  },

  /**
   * 3. 全データ取得 (デバッグ用)
   * JOINを使用して親子関係を含めて取得
   */
  getAllTransactions: async (): Promise<TransactionJoinResult[]> => {
    const db = await getDBConnection();
    try {
      // 戻り値の型を明示 (any禁止)
      const results = await db.getAllAsync<TransactionJoinResult>(
        `SELECT 
          h.id as headerId, 
          h.categoryId as headerCategory, 
          h.transaction_name as transactionName,
          h.createdAt,
          i.id as itemId,
          i.amount,
          i.categoryId as itemCategory
         FROM T_Household h
         LEFT JOIN T_HouseholdItem i ON h.id = i.transactionId
         ORDER BY h.createdAt DESC`
      );
      
      console.log(`[DB] Fetched ${results.length} rows`);
      return results;
    } catch (error) {
      console.error('[DB] getAllTransactions Error', error);
      throw error;
    }
  },
};