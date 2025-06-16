// 作成日: 2025-06-12
// 機能概要: Firebaseアプリの初期化とAuth/Firestoreインスタンスの提供
// 備考: 環境変数によってEmulatorと本番環境を切り替え可能

import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";

// Firebase 設定情報（環境変数から取得）
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Firebase アプリ初期化
const app = initializeApp(firebaseConfig);

// サービスインスタンスの取得
const auth = getAuth(app);
const db = getFirestore(app);

// Emulator環境であればローカル接続に切り替える
if (process.env.NEXT_PUBLIC_USE_EMULATOR === "true") {
  console.log("⚡ Using Firebase Emulators");
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    console.log("✅ Successfully connected to Firebase Emulators");
  } catch (error) {
    console.error("❌ Failed to connect to Firebase Emulators:", error);
  }
}

export { auth, db };
