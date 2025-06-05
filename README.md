# SubTrack - サブスクリプション管理アプリ

## 📝 プロジェクト概要

SubTrackは、複数のサブスクリプションサービスを一元管理し、支出を可視化するためのWebアプリケーションです。

### 主な機能

- 📊 サブスクリプションの登録・編集・削除
- 💰 月額・年額の合計金額の自動計算
- 📅 支払い日の管理とリマインド
- 🔍 カテゴリ別フィルタリングと並び替え
- 📈 ダッシュボードでの支出分析
- 🔐 セキュアなユーザー認証

## 🛠 技術スタック

- **フロントエンド**
  - Next.js (App Router)
  - TypeScript
  - Tailwind CSS
- **バックエンド**
  - Firebase
    - Firestore (データベース)
    - Authentication (認証)
    - Hosting (ホスティング)

## 🚀 開発環境のセットアップ

1. リポジトリのクローン:
```bash
git clone [repository-url]
cd subtrack
```

2. 依存関係のインストール:
```bash
npm install
```

3. 環境変数の設定:
`.env.local`ファイルを作成し、必要な環境変数を設定:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. 開発サーバーの起動:
```bash
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## 📦 本番環境へのデプロイ

このプロジェクトはVercelへのデプロイを推奨しています：

1. [Vercel](https://vercel.com)でアカウントを作成
2. このリポジトリをインポート
3. 環境変数を設定
4. デプロイを実行

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。

## 👥 作者

- 作者名 - [@GitHubユーザー名]
