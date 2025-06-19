# ローカル開発環境のセットアップ

## 前提条件

- Node.js (v18以上)
- npm (v9以上)
- Firebase CLI (`npm install -g firebase-tools`)

## 環境変数の設定

1. `.env.local`ファイルを作成し、以下の環境変数を設定します：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAYUnE7xu1Cw703PHiWplK9pF8gui27Ltg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=subtrack-27ae6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=subtrack-27ae6
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=subtrack-27ae6.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=272849751744
NEXT_PUBLIC_FIREBASE_APP_ID=1:272849751744:web:b8646b6fcc2963198c6725
NEXT_PUBLIC_USE_EMULATOR=true
```

## アプリケーションの起動手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase Emulatorの起動

```bash
firebase emulators:start
```

正常に起動すると、以下のようなログが表示されます：

```
i  emulators: Starting emulators: auth, firestore, hosting
i  firestore: Firestore Emulator logging to firestore-debug.log
✔  firestore: Firestore Emulator UI websocket is running on 9150.
i  hosting[subtrack-27ae6]: Serving hosting files from: public
✔  hosting[subtrack-27ae6]: Local server: http://127.0.0.1:5000
┌─────────────────────────────────────────────────────────────┐
│ ✔  All emulators ready! It is now safe to connect your app. │
│ i  View Emulator UI at http://127.0.0.1:4000/               │
└─────────────────────────────────────────────────────────────┘
┌────────────────┬────────────────┬─────────────────────────────────┐
│ Emulator       │ Host:Port      │ View in Emulator UI             │
├────────────────┼────────────────┼─────────────────────────────────┤
│ Authentication │ 127.0.0.1:9099 │ http://127.0.0.1:4000/auth      │
├────────────────┼────────────────┼─────────────────────────────────┤
│ Firestore      │ 127.0.0.1:8080 │ http://127.0.0.1:4000/firestore │
├────────────────┼────────────────┼─────────────────────────────────┤
│ Hosting        │ 127.0.0.1:5000 │ n/a                             │
└────────────────┴────────────────┴─────────────────────────────────┘
```

### 3. アプリケーションの起動

新しいターミナルで以下のコマンドを実行：

```bash
npm run dev
```

正常に起動すると、以下のようなログが表示されます：

```
> subtrack@0.1.0 dev
> next dev
   ▲ Next.js 15.3.2
   - Local:        http://localhost:3000
   - Network:      http://10.255.255.254:3000
   - Environments: .env.local
 ✓ Starting...
 ✓ Ready in 1793ms
⚡ Using Firebase Emulators
✅ Successfully connected to Firebase Emulators
```

### 4. ダミーデータの投入

```bash
npx tsx src/scripts/seedDummyData.ts
```

## ブラウザからのアクセス

1. **アプリケーション**
   - URL: http://localhost:3000
   - 機能: メインアプリケーション

2. **Firebase Emulator UI**
   - URL: http://127.0.0.1:4000
   - 機能: 
     - Authentication: ユーザー管理
     - Firestore: データベース管理

## デバッグログの確認

### Firebase Emulator ログ
- 認証ログ: `firebase-debug.log`
- Firestoreログ: `firestore-debug.log`

### アプリケーションログ
- ブラウザの開発者ツール（DevTools）のコンソールで確認可能
- 主なログメッセージ：
  ```
  ⚡ Using Firebase Emulators
  ✅ Successfully connected to Firebase Emulators
  AuthProvider: Starting auth state monitoring
  ```

## トラブルシューティング

1. **Emulatorが起動しない場合**
   - ポートが使用中でないか確認
   - `firebase-debug.log`を確認

2. **アプリケーションがEmulatorに接続できない場合**
   - `.env.local`の`NEXT_PUBLIC_USE_EMULATOR`が`true`に設定されているか確認
   - ブラウザのコンソールでエラーメッセージを確認

3. **認証エラーが発生する場合**
   - Emulator UIでユーザーが正しく作成されているか確認
   - `firebase-debug.log`で認証関連のエラーを確認 