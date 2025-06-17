# Firestore コレクション構造統合提案

## 🎯 目的

Firestore に複数存在する以下のサブスクリプション関連コレクションを、**利便性・可読性・拡張性**の観点から、1つの統一された構造にリファクタリングする。

| 種別 | 目的 |
|------|------|
| **現在契約中の管理** | 編集・停止・再開などの操作対象 |
| **過去の月別履歴の管理** | 支出グラフや分析に使用 |

---

## ✅ 統合後のコレクション名

```plaintext
subscriptions
```

---

## 🔸 サブスクリプションドキュメント構造

| フィールド名        | 型             | 説明 |
|---------------------|----------------|------|
| `id`                | string         | FirestoreドキュメントID（または明示的に指定） |
| `userId`            | string         | Firebase UID |
| `name`              | string         | サービス名（例：Netflix） |
| `price`             | number         | 月額料金 |
| `category`          | string         | 分類カテゴリ（動画・音楽など） |
| `billingDay`        | number         | 毎月の請求日（1〜31） |
| `isActive`          | boolean        | 現在も有効か |
| `month`             | string \| null | `YYYY-MM`形式、履歴の場合に使用 |
| `createdFrom`       | string \| null | テンプレートから作られた履歴の場合、その元ID |
| `startDate`         | string         | 利用開始日（ISO文字列） |
| `endDate`           | string \| null | 終了日（解約時、または履歴） |
| `description`       | string \| null | 任意の説明文 |
| `createdAt`         | timestamp      | 作成日時 |
| `updatedAt`         | timestamp      | 最終更新日時 |

---

## 🔹 利用例と分類

| 用途               | `isActive` | `month`     | `createdFrom` |
|--------------------|------------|-------------|----------------|
| 現在の契約         | `true`     | `null`      | `null`         |
| 過去の履歴         | `false`    | `'YYYY-MM'` | テンプレートIDなど |

---

## 📁 Firestore ドキュメント構造例

```plaintext
subscriptions
  ├── abc123 (現在契約中)
  ├── def456 (2025-06の履歴)
  ├── ghi789 (2025-05の履歴)
```

---

## 🧠 この統合設計のメリット

- **UIロジックの再利用**が容易になる
- **履歴と現在契約のクエリ構造が統一**され、集計が効率的に
- **拡張性が高く**、将来的な自動課金通知やAI分析とも親和性が良い

---

## 🧩 次のステップ（提案）

1. `subscriptions`, `subscriptionLogs`, `subscriptionTemplates` → 統一
2. `generateMonthlyLogsIfNeeded()` の更新（新構造に対応）
3. 表示処理では `isActive` と `month` を条件に分岐
4. `useSubscriptionData()` のロジック整理
5. 必要に応じて **マイグレーションスクリプト作成**

---
