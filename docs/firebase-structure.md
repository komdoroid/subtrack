# Firebase 構成ガイド

## 📁 ファイル配置と構成の目的

本プロジェクトでは、Firebase SDK を `/src/firebase.ts` に定義し、アプリ全体から共通で利用できるようにしています。

### ✅ firebase.ts の格納場所
- 現在のパス: `/src/firebase.ts`
- 目的: Firebase アプリの初期化とサービスインスタンス（Auth, Firestoreなど）を提供するための共通エントリーポイント

この場所は Next.js プロジェクト構成として妥当です。ただし、今後機能が増える場合は以下のように構成を整理することが推奨されます。

```plaintext
/src/
  firebase/
    index.ts       # 旧 firebase.ts（インスタンス初期化とエクスポート）
    config.ts      # Firebaseの設定やユーティリティ（オプション）
```

---

## 🔧 firebase.ts の役割と使用意図

### 🎯 主な目的
Firebase SDK の初期化と、アプリ全体から利用可能なサービス（Firestore, Authなど）の**単一インスタンス**を提供します。

### ✅ 提供する機能
- Firebase App の初期化
- Auth / Firestore インスタンスの生成
- 開発用エミュレータとの接続切り替え（`.env.local`の `NEXT_PUBLIC_USE_EMULATOR` による制御）

### 📦 使用例
アプリの任意のファイルで以下のようにインポートして使用：

```ts
import { auth, db } from "@/firebase"
```

---

## ⚠️ 補足：環境変数による切り替え

開発用に `.env.local` に以下を設定すると、Emulator に接続されます。

```env
NEXT_PUBLIC_USE_EMULATOR=true
```

本番では Vercel の環境変数にて `false` を設定してください。

---

## 📌 推奨構成

今後 Storage や Cloud Functions を追加する場合は `/src/firebase/` に機能別ファイルを分割し、`index.ts` で集約する構成がメンテナンス性に優れます。

```plaintext
/src/firebase/
  ├─ index.ts        # auth, db などをまとめて export
  ├─ auth.ts         # getAuth 関連の処理
  ├─ firestore.ts    # getFirestore 関連の処理
  └─ config.ts       # firebaseConfig の定義
```
