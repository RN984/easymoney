// src/services/transactionService.ts
import {
  addDoc,
  collection,
  DocumentData,
  FirestoreDataConverter,
  getDocs,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp
} from 'firebase/firestore';
import { db } from '../database/db';
import { CreateHouseholdDTO, CreateHouseholdItemDTO, Household, HouseholdItem } from '../index';

/**
 * Firestore Data Converter
 * FirestoreのTimestampをJavaScriptのDateに変換し、その逆も行うコンバータ
 */
const householdConverter: FirestoreDataConverter<Household> = {
  toFirestore(data: Household): DocumentData {
    // IDはFirestoreが生成するため保存データには含めない（または無視する）
    // 下記フィールドのみを書き込む
    return {
      categoryId: data.categoryId,
      transactionName: data.transactionName || null, // undefined対策
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
 * 親ドキュメント（Household）を作成する
 * @param data Household作成用データ
 * @returns 作成されたHouseholdオブジェクト（ID付き）
 */
export const createHeader = async (data: CreateHouseholdDTO): Promise<Household> => {
  try {
    // addDocはGenerics<T>に対しT型の引数を求めるが、IDは自動生成されるため
    // DTOをHouseholdとしてキャストして渡す（toFirestoreでIDは使われないため安全）
    const docRef = await addDoc(
      collection(db, 'households').withConverter(householdConverter), 
      data as Household
    );
    
    return {
      ...data,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error creating household header:', error);
    throw new Error('家計簿データの作成に失敗しました。');
  }
};

/**
 * 子ドキュメント（HouseholdItem）を追加する
 * 構造: households/{householdId}/items/{itemId}
 * @param parentId 親HouseholdのID
 * @param data Item作成用データ
 */
export const addItem = async (parentId: string, data: Omit<CreateHouseholdItemDTO, 'transactionId'>): Promise<HouseholdItem> => {
  try {
    const itemData: CreateHouseholdItemDTO = {
      ...data,
      transactionId: parentId
    };

    const subCollectionRef = collection(db, 'households', parentId, 'items').withConverter(itemConverter);
    
    const docRef = await addDoc(subCollectionRef, itemData as HouseholdItem);

    return {
      ...itemData,
      id: docRef.id,
    };
  } catch (error) {
    console.error(`Error adding item to household ${parentId}:`, error);
    throw new Error('明細の追加に失敗しました。');
  }
};

/**
 * 全てのHousehold（親）を取得する
 */
export const getAllTransactions = async (): Promise<Household[]> => {
  try {
    const querySnapshot = await getDocs(
      collection(db, 'households').withConverter(householdConverter)
    );
    
    // Converterが正しく型付けされたため、doc.data() は Household を返す
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('データ取得に失敗しました。');
  }
};