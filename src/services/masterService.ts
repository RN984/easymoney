import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { db } from '../database/db';
import { Category } from '../index';

const SETTINGS_DOC_ID = 'user_settings_v1';
/**
 * カテゴリ一覧を取得
 */
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists() && snapshot.data().categories) {
      return snapshot.data().categories as Category[];
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