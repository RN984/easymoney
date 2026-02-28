import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { db } from '../database/db';
import { Category, CategoryType, CoinSettings } from '../index';

const SETTINGS_DOC_ID = 'user_settings_v1';

/**
 * カテゴリにtypeやshowInInputプロパティがない場合、DEFAULT_CATEGORIESからマージ
 * Firestoreはundefinedをサポートしないため、showInInputがundefinedの場合は削除
 */
const ensureCategoryDefaults = (category: Category): Category => {
  const defaultCat = DEFAULT_CATEGORIES.find((c) => c.id === category.id);
  const result: Category = {
    ...category,
    type: category.type || 'expense' as CategoryType,
  };

  // showInInputがある場合のみ設定（undefinedを避ける）
  const showInInput = category.showInInput ?? defaultCat?.showInInput;
  if (showInInput !== undefined) {
    result.showInInput = showInInput;
  }

  // iconが未設定の場合はデフォルトカテゴリから取得
  if (!category.icon && defaultCat?.icon) {
    result.icon = defaultCat.icon;
  }

  // orderが未設定の場合はデフォルトカテゴリから取得
  if (category.order === undefined && defaultCat?.order !== undefined) {
    result.order = defaultCat.order;
  }

  return result;
};

/**
 * カテゴリ一覧を取得
 */
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists() && snapshot.data().categories) {
      const categories = snapshot.data().categories as Category[];

      // 既存のカテゴリにtypeやshowInInputプロパティがない場合はデフォルト値を設定
      const mergedCategories = categories.map(ensureCategoryDefaults);

      // DEFAULT_CATEGORIESにあってFirestoreにないカテゴリーを追加（特に収入カテゴリー）
      const existingIds = new Set(mergedCategories.map((c) => c.id));
      const missingCategories = DEFAULT_CATEGORIES.filter((c) => !existingIds.has(c.id));

      const finalCategories = [...mergedCategories, ...missingCategories];

      // 不足しているカテゴリーがあれば保存
      if (missingCategories.length > 0) {
        await setDoc(docRef, { categories: finalCategories }, { merge: true });
      }

      return finalCategories;
    }
    // データがない場合はデフォルト値を保存して返す
    await setDoc(docRef, { categories: DEFAULT_CATEGORIES }, { merge: true });
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return DEFAULT_CATEGORIES;
  }
};

/**
 * カテゴリ一覧を保存
 */
export const updateCategories = async (categories: Category[]): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, { categories }, { merge: true });
  } catch (error) {
    console.error('Failed to update categories:', error);
    throw new Error('カテゴリの保存に失敗しました。');
  }
};

/**
 * 予算を取得
 */
export const fetchBudget = async (): Promise<number> => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists() && snapshot.data().budget !== undefined) {
      return snapshot.data().budget as number;
    }
    // デフォルト予算（例: 50,000）
    return 50000;
  } catch (error) {
    console.error('Failed to fetch budget:', error);
    return 50000;
  }
};

/**
 * 予算を保存
 */
export const updateBudget = async (budget: number): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, { budget }, { merge: true });
  } catch (error) {
    console.error('Failed to update budget:', error);
    throw new Error('予算の保存に失敗しました。');
  }
};

/**
 * 基本給を取得
 */
export const fetchBaseSalary = async (): Promise<number> => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists() && snapshot.data().baseSalary !== undefined) {
      return snapshot.data().baseSalary as number;
    }
    // デフォルトは 0
    return 0;
  } catch (error) {
    console.error('Failed to fetch baseSalary:', error);
    return 0;
  }
};

/**
 * 基本給を保存
 */
export const updateBaseSalary = async (baseSalary: number): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, { baseSalary }, { merge: true });
  } catch (error) {
    console.error('Failed to update baseSalary:', error);
    throw new Error('基本給の保存に失敗しました。');
  }
};

/**
 * 給料日を取得 (1-28)
 */
export const fetchSalaryDay = async (): Promise<number> => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists() && snapshot.data().salaryDay !== undefined) {
      return snapshot.data().salaryDay as number;
    }
    // デフォルトは毎月1日
    return 1;
  } catch (error) {
    console.error('Failed to fetch salaryDay:', error);
    return 1;
  }
};

/**
 * 給料日を保存
 */
export const updateSalaryDay = async (salaryDay: number): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, { salaryDay }, { merge: true });
  } catch (error) {
    console.error('Failed to update salaryDay:', error);
    throw new Error('給料日の保存に失敗しました。');
  }
};

const DEFAULT_COIN_SETTINGS: CoinSettings = {
  hiddenCoins: [],
  customCoins: [],
};

/**
 * コイン設定を取得
 */
export const fetchCoinSettings = async (): Promise<CoinSettings> => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists() && snapshot.data().coinSettings) {
      return snapshot.data().coinSettings as CoinSettings;
    }
    return DEFAULT_COIN_SETTINGS;
  } catch (error) {
    console.error('Failed to fetch coinSettings:', error);
    return DEFAULT_COIN_SETTINGS;
  }
};

/**
 * コイン設定を保存
 */
export const updateCoinSettings = async (coinSettings: CoinSettings): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, { coinSettings }, { merge: true });
  } catch (error) {
    console.error('Failed to update coinSettings:', error);
    throw new Error('コイン設定の保存に失敗しました。');
  }
};
