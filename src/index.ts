// src/index.ts

// SQLiteの日付は ISO8601 文字列 (YYYY-MM-DDTHH:mm:ss.sssZ) として扱います
export type datetime = string;

// ==========================================
// M_カテゴリ (Master Table)
// ==========================================
export interface Category {
  id: string; 
  name: string; 
  color: string;
}

// ==========================================
// M_コイン (Master Header)
// ==========================================
export interface Coin {
  id: string;
  coin: 1 | 5 | 10 | 50 | 100 | 500 | 1000 | 5000 | 10000;
}

// ==========================================
// T_家計簿 (Transaction Header: 親)
// ==========================================
export interface Household {
  id: string;             // UUID
  categoryId: string;     // Category ID
  transactionName?: string; 
  memo?: string;
  createdAt: datetime;
}

// ==========================================
// T_家計簿明細 (Transaction Detail: 子)
// ==========================================
export interface HouseholdItem {
  id: string;             // UUID
  transactionId: string;  // [FK] Household.id
  categoryId: string;     // [Ref] Category ID (冗長だが柔軟性のために保持)
  item?: string;          // 品名
  amount: number;         // 金額
  memo?: string;
  createdAt: datetime;
}

// ==========================================
// 結合クエリ結果用 (JOIN Result)
// ==========================================
export interface TransactionJoinResult {
  headerId: string;
  headerCategory: string; // カテゴリ名が入る想定
  transactionName: string | null;
  itemId: string;
  itemCategory: string | null;
  itemAmount: number;
  itemMemo: string | null;
  createdAt: datetime;
}