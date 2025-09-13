# Dispatt - Admin SPA

React + Vite + TypeScript + Tailwind + daisyUI + Supabase Auth による管理者向けSPAです。

## 🚀 技術スタック

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, daisyUI v5
- **Routing**: React Router v6
- **Authentication**: Supabase Auth (Google OAuth)
- **Backend**: Supabase

## 📁 ディレクトリ構成

```
src/
├── components/          # 共通コンポーネント
│   ├── Navbar.tsx      # ナビゲーションバー
│   ├── Sidebar.tsx     # サイドバー
│   └── ProtectedRoute.tsx  # 認証保護ルート
├── hooks/              # カスタムフック
│   └── useAuth.ts      # 認証フック
├── pages/              # ページコンポーネント
│   ├── Login.tsx       # ログインページ
│   ├── Logout.tsx      # ログアウトページ
│   ├── AuthCallback.tsx # OAuth認証コールバック
│   ├── Admin.tsx       # 管理ダッシュボード
│   ├── Forbidden.tsx   # アクセス拒否ページ
│   └── Health.tsx      # ヘルスチェック
├── utils/              # ユーティリティ関数
│   └── url.ts          # URL生成関数
└── integrations/supabase/  # Supabase設定
```

## 🔧 セットアップ

### 1. 環境変数設定

`.env.example` を `.env` にコピーし、適切な値を設定してください：

```bash
cp .env.example .env
```

必須項目：
- `VITE_SUPABASE_URL`: SupabaseプロジェクトのURL
- `VITE_SUPABASE_ANON_KEY`: Supabaseの公開キー
- `VITE_APP_ORIGIN`: アプリケーションのオリジンURL
- `VITE_ADMIN_EMAILS`: 管理者メールアドレス（カンマ区切り）

### 2. Supabase設定

#### 2.1 プロジェクト作成
1. [Supabase](https://supabase.com) にアクセス
2. 新しいプロジェクトを作成
3. プロジェクトURLとAnon Keyを `.env` に設定

#### 2.2 Google OAuth設定

1. **Google Cloud Console設定**:
   - [Google Cloud Console](https://console.cloud.google.com) にアクセス
   - 新しいプロジェクトを作成または既存プロジェクトを選択
   - 「APIs & Services」→「Credentials」に移動
   - 「Create Credentials」→「OAuth Client ID」を選択
   - Application type: Web application
   - Authorized JavaScript origins: `https://your-app-domain.com`
   - Authorized redirect URIs: `https://your-supabase-project.supabase.co/auth/v1/callback`

2. **Supabase Auth設定**:
   - Supabaseダッシュボード → Authentication → Providers
   - Google providerを有効化
   - Google Cloud ConsoleのClient IDとSecretを入力

3. **URL Configuration**:
   - Supabaseダッシュボード → Authentication → URL Configuration
   - Site URL: `https://your-app-domain.com`
   - Redirect URLs: アプリケーションのドメインを追加

### 3. ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## 🔐 認証フロー

1. **ログイン**: `/login` でGoogleアカウント認証
2. **コールバック**: `/auth/callback` でセッション確立
3. **認可チェック**: 管理者メール(`VITE_ADMIN_EMAILS`)に含まれるかチェック
4. **アクセス制御**: 
   - 未認証ユーザー → `/login` にリダイレクト
   - 非管理者ユーザー → `/forbidden` にリダイレクト
   - 管理者ユーザー → `/admin` ダッシュボードアクセス可能

## 📋 ルート一覧

| パス | 説明 | 認証 | 管理者権限 |
|------|------|------|------------|
| `/` | ルート（`/admin`にリダイレクト） | - | - |
| `/login` | ログインページ | - | - |
| `/logout` | ログアウト処理 | - | - |
| `/auth/callback` | OAuth認証コールバック | - | - |
| `/admin` | 管理ダッシュボード | ✅ | ✅ |
| `/forbidden` | アクセス拒否ページ | - | - |
| `/health` | ヘルスチェック | - | - |

## 🛠 ユーティリティ関数

### getPublicUrl

公開URLを生成するユーティリティ関数：

```typescript
import { getPublicUrl } from '@/utils/url';

const url = getPublicUrl({
  service: 'podcast',
  epNo: '123',
  variant: 'short'  // オプション
});
// 結果: https://dispatt.ch/podcast/ep/123/short
```

## 🎨 UI/UX

- **daisyUI**: テーマは `light` のみ（CSS肥大化防止）
- **レスポンシブ**: モバイル・デスクトップ対応
- **ダークモード**: 現在未対応（必要に応じて追加可能）

## 🚀 デプロイ

1. 環境変数を本番環境に設定
2. Supabaseの本番URLを更新
3. Google OAuth設定に本番ドメインを追加
4. ビルド・デプロイ

## 📝 今後の拡張

- [ ] ダッシュボード機能追加
- [ ] ユーザー管理機能
- [ ] データ可視化
- [ ] ダークモード対応
- [ ] PWA対応

## 🐛 トラブルシューティング

### ログインエラー
- Google OAuth設定を確認
- Supabase URL Configurationを確認
- 環境変数が正しく設定されているか確認

### アクセス拒否
- `VITE_ADMIN_EMAILS` に正しいメールアドレスが設定されているか確認
- 大文字小文字の違いを確認

## 📞 サポート

問題や質問がある場合は、GitHubのIssuesまでお気軽にお問い合わせください。
