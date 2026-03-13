import { Platform } from 'react-native';
import { Category, CoinSettings, CoinValue, Household } from '../index';
import { setWidgetData, getWidgetData, removeWidgetData, reloadAllWidgets } from '../../modules/widget-data';

// Keys matching SharedData.swift
const SPENDING_DATA_KEY = 'widget_spending_data';
const COINS_KEY = 'widget_coins';
const CATEGORIES_KEY = 'widget_categories';
const PENDING_TRANSACTIONS_KEY = 'widget_pending_transactions';

// ==========================================
// Types matching Swift SharedData
// ==========================================

interface WidgetCoin {
  id: string;
  name: string;
  amount: number;
  color: string;
  isCustom: boolean;
}

interface WidgetCategory {
  id: string;
  name: string;
  color: string;
  type: string;
}

interface CategorySpending {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
}

interface SpendingData {
  totalSpending: number;
  budget: number;
  categoryBreakdown: CategorySpending[];
  lastUpdated: number; // milliseconds since epoch
}

interface PendingTransaction {
  coinAmount: number;
  categoryId: string;
  categoryName: string;
  timestamp: number; // milliseconds since epoch
}

// ==========================================
// Default coins for widget
// ==========================================

const DEFAULT_COIN_VALUES: CoinValue[] = [10000, 5000, 1000, 500, 100, 50, 10];

function coinValueToName(value: number): string {
  if (value >= 10000) return `${value / 10000}万`;
  if (value >= 1000) return `${value / 1000}千`;
  return `${value}`;
}

// ==========================================
// Sync Functions
// ==========================================

/**
 * コイン設定をウィジェットに同期
 */
export const syncCoinsToWidget = (coinSettings: CoinSettings): void => {
  if (Platform.OS !== 'ios') return;

  const visibleDefaults = DEFAULT_COIN_VALUES.filter(
    (v) => !coinSettings.hiddenCoins.includes(v)
  );

  const widgetCoins: WidgetCoin[] = [
    ...visibleDefaults.map((v) => ({
      id: `coin_${v}`,
      name: coinValueToName(v),
      amount: v,
      color: '#F4DA61',
      isCustom: false,
    })),
    ...coinSettings.customCoins.map((c) => ({
      id: c.id,
      name: c.name,
      amount: c.amount,
      color: c.color,
      isCustom: true,
    })),
  ];

  setWidgetData(COINS_KEY, JSON.stringify(widgetCoins));
  reloadAllWidgets();
};

/**
 * カテゴリをウィジェットに同期
 */
export const syncCategoriesToWidget = (categories: Category[]): void => {
  if (Platform.OS !== 'ios') return;

  const widgetCategories: WidgetCategory[] = categories
    .filter((c) => c.showInInput !== false)
    .map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      type: c.type,
    }));

  setWidgetData(CATEGORIES_KEY, JSON.stringify(widgetCategories));
  reloadAllWidgets();
};

/**
 * 支出データをウィジェットに同期
 */
export const syncSpendingToWidget = (
  transactions: Household[],
  budget: number,
  categories: Category[]
): void => {
  if (Platform.OS !== 'ios') return;

  // カテゴリ別の支出集計（支出カテゴリのみ）
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const categoryMap = new Map<string, { name: string; color: string; amount: number }>();

  for (const cat of expenseCategories) {
    categoryMap.set(cat.id, { name: cat.name, color: cat.color, amount: 0 });
  }

  let totalSpending = 0;
  for (const tx of transactions) {
    const cat = categoryMap.get(tx.categoryId);
    if (cat) {
      cat.amount += tx.totalAmount;
      totalSpending += tx.totalAmount;
    }
  }

  const categoryBreakdown: CategorySpending[] = [];
  for (const [categoryId, data] of categoryMap) {
    if (data.amount > 0) {
      categoryBreakdown.push({
        categoryId,
        categoryName: data.name,
        color: data.color,
        amount: data.amount,
      });
    }
  }

  const spendingData: SpendingData = {
    totalSpending,
    budget,
    categoryBreakdown,
    lastUpdated: Date.now(),
  };

  setWidgetData(SPENDING_DATA_KEY, JSON.stringify(spendingData));
  reloadAllWidgets();
};

/**
 * 全データをまとめてウィジェットに同期
 */
export const syncAllToWidget = (
  transactions: Household[],
  budget: number,
  categories: Category[],
  coinSettings: CoinSettings
): void => {
  if (Platform.OS !== 'ios') return;

  syncCoinsToWidget(coinSettings);
  syncCategoriesToWidget(categories);
  syncSpendingToWidget(transactions, budget, categories);
};

/**
 * ウィジェットからの保留中トランザクションを取得して削除
 */
export const consumePendingTransactions = (): PendingTransaction[] => {
  if (Platform.OS !== 'ios') return [];

  const raw = getWidgetData(PENDING_TRANSACTIONS_KEY);
  if (!raw) return [];

  try {
    const transactions: PendingTransaction[] = JSON.parse(raw);
    removeWidgetData(PENDING_TRANSACTIONS_KEY);
    reloadAllWidgets();
    return transactions;
  } catch {
    return [];
  }
};
