

## 外部API エンドポイント構築計画

サービスとエピソードの CRUD 操作を外部から API キー認証で行えるようにする。

### 認証方式

- ユーザーごとに一意の API キーを発行・管理
- `api_keys` テーブルを新設し、ハッシュ化した API キーと `user_id` を紐付け
- リクエスト時に `Authorization: Bearer <api_key>` ヘッダーで認証

### データベース変更

**新規テーブル: `api_keys`**
- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL)
- `key_hash` (text, NOT NULL, UNIQUE) — SHA-256ハッシュ
- `name` (text) — キーの名前（管理用）
- `is_active` (boolean, default true)
- `last_used_at` (timestamptz)
- `created_at`, `updated_at`
- RLS: ユーザーは自分のキーのみ閲覧・管理可能

### Edge Function: `api`

1つの Edge Function で全エンドポイントを処理:

```text
POST   /api/services          → サービス作成
GET    /api/services          → サービス一覧
GET    /api/services/:id      → サービス詳細
PUT    /api/services/:id      → サービス更新
DELETE /api/services/:id      → サービス削除

POST   /api/episodes          → エピソード作成
GET    /api/episodes           → エピソード一覧 (?service_id=xxx)
GET    /api/episodes/:id       → エピソード詳細
PUT    /api/episodes/:id       → エピソード更新
DELETE /api/episodes/:id       → エピソード削除
```

認証フロー:
1. `Authorization` ヘッダーから API キーを取得
2. SHA-256 ハッシュ化して `api_keys` テーブルと照合
3. 一致する `user_id` を取得し、service_role クライアントでそのユーザーのデータのみ操作

### UI 変更

- 設定画面（または新規ページ）に API キー管理セクションを追加
- キー生成ボタン → 生成時に1度だけ平文キーを表示
- キー一覧（名前、作成日、最終使用日、有効/無効切替、削除）
- API ドキュメント（簡易的なエンドポイント一覧と使用例）

### 技術詳細

- Edge Function は `supabase/functions/api/index.ts` に作成
- URLパスのパース: `new URL(req.url).pathname` でルーティング
- サービスロールキー（`SUPABASE_SERVICE_ROLE_KEY`）を使用してRLSをバイパスし、`user_id` フィルターで手動制御
- 入力バリデーション: Zod でリクエストボディを検証
- レスポンス形式: JSON (`{ data: ..., error: ... }`)
- CORS ヘッダー付与

### 実装順序

1. `api_keys` テーブル作成（マイグレーション）
2. `api` Edge Function 作成
3. UI に API キー管理画面を追加

