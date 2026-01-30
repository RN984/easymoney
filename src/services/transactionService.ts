// src/services/transactionService.ts
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  FirestoreDataConverter,
  getDocs,
  increment,
  orderBy,
  query,
  QueryDocumentSnapshot,
  runTransaction,
  SnapshotOptions,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '../database/db';
import { CreateHouseholdDTO, CreateHouseholdItemDTO, Household, HouseholdItem } from '../index';

// ==========================================
// Converters
// ==========================================
const householdConverter: FirestoreDataConverter<Household> = {
  toFirestore(data: Household): DocumentData {
    return {
      categoryId: data.categoryId,
      transactionName: data.transactionName || null,
      totalAmount: data.totalAmount, 
      memo: data.memo || null,
      createdAt: Timestamp.fromDate(data.createdAt)
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Household {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      categoryId: data.categoryId,
      transactionName: data.transactionName,
      totalAmount: data.totalAmount || 0,
      memo: data.memo,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Household;
  }
};

const itemConverter: FirestoreDataConverter<HouseholdItem> = {
  toFirestore(data: HouseholdItem): DocumentData {
    return {
      transactionId: data.transactionId,
      categoryId: data.categoryId,
      item: data.item || null,
      amount: data.amount,
      memo: data.memo || null,
      createdAt: Timestamp.fromDate(data.createdAt)
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): HouseholdItem {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      transactionId: data.transactionId,
      categoryId: data.categoryId,
      item: data.item,
      amount: data.amount,
      memo: data.memo,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as HouseholdItem;
  }
};

// ==========================================
// Service Methods
// ==========================================

/**
 * 新規の親家計簿データ(Household)を作成します。
 */
export const createHousehold = async (data: CreateHouseholdDTO): Promise<Household> => {
  try {
    const docRef = await addDoc(
      collection(db, 'households').withConverter(householdConverter), 
      data as Household
    );
    // ID付きで返す
    return { ...data, id: docRef.id };
  } catch (error) {
    console.error('Error creating household header:', error);
    throw new Error('家計簿データの作成に失敗しました。');
  }
};

/**
 * 既存の親家計簿に明細を追加し、親の合計金額をアトミックに更新します。
 */
export const addItemToHousehold = async (parentId: string, data: Omit<CreateHouseholdItemDTO, 'transactionId'>): Promise<HouseholdItem> => {
  try {
    // Transactionを実行
    return await runTransaction(db, async (transaction) => {
      // 1. 親ドキュメントとサブコレクションの参照準備
      const parentRef = doc(db, 'households', parentId).withConverter(householdConverter);
      const itemsCollectionRef = collection(db, 'households', parentId, 'items').withConverter(itemConverter);
      const newItemRef = doc(itemsCollectionRef); // IDを自動生成

      const newItem: HouseholdItem = {
        ...data,
        id: newItemRef.id,
        transactionId: parentId,
      };

      // 2. 書き込み操作
      // 明細の追加
      transaction.set(newItemRef, newItem);

      // 親の合計金額をインクリメント更新 (Read-Modify-WriteではなくAtomic Incrementを使用)
      transaction.update(parentRef, {
        totalAmount: increment(data.amount)
      });

      return newItem;
    });
  } catch (error) {
    console.error(`Error adding item to household ${parentId}:`, error);
    throw new Error('明細の追加と集計更新に失敗しました。');
  }
};

/**
 * 指定月の家計簿データ一覧を取得します。
 */
export const getMonthlyTransactions = async (date: Date): Promise<Household[]> => {
  try {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    const q = query(
      collection(db, 'households').withConverter(householdConverter),
      where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
      where('createdAt', '<=', Timestamp.fromDate(endOfMonth)),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error fetching monthly transactions:', error);
    throw new Error('月次データの取得に失敗しました。');
  }
};

export const getAllTransactions = async (): Promise<Household[]> => {
  try {
    const querySnapshot = await getDocs(
      collection(db, 'households').withConverter(householdConverter)
    );
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('データ取得に失敗しました。');
  }
};