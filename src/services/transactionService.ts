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

export const createHeader = async (data: CreateHouseholdDTO): Promise<Household> => {
  try {
    const docRef = await addDoc(
      collection(db, 'households').withConverter(householdConverter), 
      data as Household
    );
    return { ...data, id: docRef.id };
  } catch (error) {
    console.error('Error creating household header:', error);
    throw new Error('家計簿データの作成に失敗しました。');
  }
};

export const addItem = async (parentId: string, data: Omit<CreateHouseholdItemDTO, 'transactionId'>): Promise<HouseholdItem> => {
  try {
    const itemData: CreateHouseholdItemDTO = { ...data, transactionId: parentId };
    const subCollectionRef = collection(db, 'households', parentId, 'items').withConverter(itemConverter);
    const docRef = await addDoc(subCollectionRef, itemData as HouseholdItem);
    return { ...itemData, id: docRef.id };
  } catch (error) {
    console.error(`Error adding item to household ${parentId}:`, error);
    throw new Error('明細の追加に失敗しました。');
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