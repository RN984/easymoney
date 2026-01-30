// src/index.ts

// ==========================================
// 共通型定義
// ==========================================

/**
 * 位置情報データ
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string; // 逆ジオコーディング等で取得できた場合の住所（任意）
}

// ==========================================
// M_カテゴリ (Master Table)
// ==========================================
export interface Category {
  id: string; 
  name: string; 
  color: string;
  icon: string;
}

// ==========================================
// M_コイン (Master Header)
// ==========================================
export type CoinValue = 1 | 5 | 10 | 50 | 100 | 500 | 1000 | 5000 | 10000;

export interface Coin {
  id: string;
  coin: CoinValue;
}

// ==========================================
// T_家計簿 (Transaction Header: 親)
// ==========================================
export interface Household {
  id: string;             // UUID
  categoryId: string;     // Category ID
  transactionName?: string; 
  totalAmount: number;    // 合計金額
  memo?: string;
  location?: LocationData; // 位置情報 (Option)
  createdAt: Date;
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
  createdAt: Date;
}

/**
 * 新規作成時に必要なデータ型（IDはFirestore生成のため除外）
 */
export type CreateHouseholdDTO = Omit<Household, 'id'>;
export type CreateHouseholdItemDTO = Omit<HouseholdItem, 'id'>;

/**
 * 更新時に必要なデータ型 (Partial)
 */
export type UpdateHouseholdDTO = Partial<Omit<Household, 'id' | 'createdAt'>>;