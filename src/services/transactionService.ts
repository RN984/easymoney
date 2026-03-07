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
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../database/db';
import {
  CreateHouseholdDTO,
  CreateHouseholdItemDTO,
  Household,
  HouseholdItem,
  UpdateHouseholdDTO
} from '../index';

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
      location: data.location || null, // 位置情報を保存
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
      location: data.location || undefined, // 位置情報を復元
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
 * (Location情報が含まれている場合はFirestoreに保存されます)
 */
export const createHousehold = async (data: CreateHouseholdDTO): Promise<Household> => {
  try {
    const docRef = await addDoc(
      collection(db, 'households').withConverter(householdConverter), 
      data as Household
    );
    return { ...data, id: docRef.id };
  } catch (error) {
    throw new Error('家計簿データの作成に失敗しました。');
  }
};

/**
 * 既存の親家計簿データを更新します。
 * (金額の変更は addItemToHousehold 経由で行うことが多いため、主にメタデータの修正用)
 */
export const updateHousehold = async (id: string, data: UpdateHouseholdDTO): Promise<void> => {
  try {
    const docRef = doc(db, 'households', id);
    
    // 更新用のデータを作成（Firestoreに送れない undefined を除去）
    const updateData: any = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });
    
    // createdAt が Date の場合は Timestamp に変換
    if (updateData.createdAt instanceof Date) {
      updateData.createdAt = Timestamp.fromDate(updateData.createdAt);
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    throw new Error('データの更新に失敗しました。');
  }
};

/**
 * 家計簿データとそのサブコレクション(items)を削除します。
 */
export const deleteHousehold = async (id: string): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // サブコレクション(items)を先に削除
    const itemsSnapshot = await getDocs(
      collection(db, 'households', id, 'items')
    );
    itemsSnapshot.docs.forEach((itemDoc) => {
      batch.delete(itemDoc.ref);
    });

    // 親ドキュメントを削除
    batch.delete(doc(db, 'households', id));

    await batch.commit();
  } catch (error) {
    throw new Error('データの削除に失敗しました。');
  }
};

/**
 * 既存の親家計簿に明細を追加し、親の合計金額をアトミックに更新します。
 */
export const addItemToHousehold = async (parentId: string, data: Omit<CreateHouseholdItemDTO, 'transactionId'>): Promise<HouseholdItem> => {
  try {
    return await runTransaction(db, async (transaction) => {
      const parentRef = doc(db, 'households', parentId).withConverter(householdConverter);
      const itemsCollectionRef = collection(db, 'households', parentId, 'items').withConverter(itemConverter);
      const newItemRef = doc(itemsCollectionRef);

      const newItem: HouseholdItem = {
        ...data,
        id: newItemRef.id,
        transactionId: parentId,
      };

      transaction.set(newItemRef, newItem);

      transaction.update(parentRef, {
        totalAmount: increment(data.amount)
      });

      return newItem;
    });
  } catch (error) {
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
    throw new Error('データ取得に失敗しました。');
  }
};

/**
 * 全ての家計簿データ（親+子）と設定をリセットします。
 * Firestoreのバッチ書き込みは500件制限があるため、分割して削除します。
 */
export const resetAllData = async (): Promise<void> => {
  try {
    const householdsSnapshot = await getDocs(collection(db, 'households'));

    // バッチ制限（500件）を考慮して分割処理
    const BATCH_LIMIT = 499;
    let batch = writeBatch(db);
    let count = 0;

    for (const householdDoc of householdsSnapshot.docs) {
      // サブコレクション(items)を先に削除
      const itemsSnapshot = await getDocs(
        collection(db, 'households', householdDoc.id, 'items')
      );
      for (const itemDoc of itemsSnapshot.docs) {
        batch.delete(itemDoc.ref);
        count++;
        if (count >= BATCH_LIMIT) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }

      // 親ドキュメントを削除
      batch.delete(householdDoc.ref);
      count++;
      if (count >= BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }

    // 設定ドキュメントも削除
    const settingsSnapshot = await getDocs(collection(db, 'settings'));
    for (const settingDoc of settingsSnapshot.docs) {
      batch.delete(settingDoc.ref);
      count++;
    }

    if (count > 0) {
      await batch.commit();
    }
  } catch (error) {
    throw new Error('データベースのリセットに失敗しました。');
  }
};