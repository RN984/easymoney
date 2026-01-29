// src/database/db.ts
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

// 環境変数やConstantsから設定を読み込む想定
// 実運用時は process.env や Expo Constants を使用してください
const firebaseConfig = {
  apiKey: "AIzaSyA1qJOkYoFFRyL7b-oE68wFwDQ_L4s0MTY",
  authDomain: "easy-money-88144.firebaseapp.com",
  projectId: "easy-money-88144",
  storageBucket: "easy-money-88144.firebasestorage.app",
  messagingSenderId: "355438898094",
  appId: "1:355438898094:web:e1f3c5a83be2ebd503763f",
  measurementId: "G-C5CPLNL3VL"
};

let app: FirebaseApp;
let db: Firestore;

try {
  // アプリが既に初期化されているか確認（ホットリロード対策）
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization failed:', error);
  throw error;
}

export { db };
