# CLAUDE.md - EasyMoney プロジェクト概要

## プロジェクト概要
コインをタップして支出を記録する日本語の家計簿アプリ（React Native / Expo）。
「3秒ルール」により連続タップは同一トランザクションにまとめられる。

## 技術スタック
- **フレームワーク**: Expo SDK 54 + React Native 0.81 + React 19
- **ルーティング**: expo-router v6（ファイルベースルーティング `app/` ディレクトリ）
- **DB**: Firebase Firestore（`src/database/db.ts` で初期化）
- **状態管理**: React Hooks（カスタムフック中心、グローバルstate管理ライブラリなし）
- **アニメーション**: react-native-reanimated v4 + Animated API
- **ジェスチャー**: react-native-gesture-handler
- **言語**: TypeScript（strict mode）
- **ナビゲーション**: expo-router の Stack ナビゲーション

## ディレクトリ構成
```
app/                          # expo-router ページ定義
  _layout.tsx                 # Root Stack レイアウト
  index.tsx                   # ホーム画面（MoneyInput）
  history.tsx                 # 履歴画面
  settings.tsx                # 設定画面
src/
  index.ts                    # 全型定義（Category, Household, HouseholdItem 等）
  database/db.ts              # Firebase初期化
  constants/
    theme.ts                  # カラーパレット（Palette, Colors）
    categories.ts             # デフォルトカテゴリ定義
  components/
    HamburgerMenu.tsx         # ドロワーメニュー
  services/
    masterService.ts          # 設定CRUD（カテゴリ, 予算, 基本給, コイン設定）
    transactionService.ts     # 家計簿CRUD（Household, HouseholdItem）
  screens/
    MoneyInput/               # 画面1: コイン入力
      components/
        Coin/CoinList.tsx     # コイン一覧表示
        Coin/FloatingCoin.tsx # タップ時パーティクルアニメーション
        RadialCategoryMenu.tsx # 放射状カテゴリ選択（SVG）
        SegmentedProgressBar.tsx # 予算進捗バー
      hooks/
        useMoneyInput.ts      # ★コアロジック（3秒ルール、コイン追加）
        useSound.ts           # 効果音
    MoneyHistory/             # 画面2: 履歴・グラフ
      components/
        Chart/MonthlyChart.tsx # 月次棒グラフ（SVG）
        Chart/DateNavigator.tsx
        List/TransactionList.tsx
        List/TransactionItem.tsx # スワイプで編集/削除
        List/EditModal.tsx     # 取引編集モーダル（新規作成兼用）
        SummaryHeader.tsx      # 収入/支出/収支サマリー
        IncomeListSection.tsx
        IncomeModal.tsx
      hooks/
        useHistoryScreen.ts
    Settings/                 # 画面3: 設定
      components/
        Category/Accordion.tsx   # カテゴリ管理
        Category/EditModal.tsx
        Coin/CoinAccordion.tsx   # コイン表示/非表示設定
        Coin/CoinEditModal.tsx   # カスタムコイン編集
        Salary/SalaryAccordion.tsx # 固定収入設定
      hooks/useSettings.ts
```

## 主要な型定義（src/index.ts）
```typescript
Category       { id, name, color, icon, type: 'income'|'expense', showInInput?, order? }
Household      { id, categoryId, totalAmount, memo?, location?, createdAt }  // 親
HouseholdItem  { id, transactionId, categoryId, item?, amount, memo?, createdAt }  // 子
CoinValue      = 1 | 5 | 10 | 50 | 100 | 500 | 1000 | 5000 | 10000
CoinSettings   { hiddenCoins: CoinValue[], customCoins: CustomCoin[] }
CustomCoin     { id, name, amount, color, memo?, order }
LocationData   { latitude, longitude, address? }
```

## Firestore データ構造
```
households/{id}                → Household ドキュメント
  └── items/{id}               → HouseholdItem サブコレクション
settings/user_settings_v1      → categories, budget, baseSalary, salaryDay, coinSettings
```

## コアロジック: 3秒ルール（useMoneyInput.ts）
- コインタップ間隔が3秒以内 → 既存 Household に HouseholdItem を追加（`addItemToHousehold`）
- 3秒超過 or 初回 → 新規 Household 作成後に HouseholdItem 追加
- カテゴリ変更・収支切替時にタイマーリセット
- Promise チェーンで直列化（`transactionQueueRef`）
- `increment()` でアトミックに `totalAmount` を更新

## デザインシステム（src/constants/theme.ts）
```
Palette.background: '#EAE5C6'  // メイン背景
Palette.text:       '#272D2D'  // テキスト
Palette.primary:    '#6179B5'  // プライマリ
Palette.secondary:  '#F4DA61'  // セカンダリ
Palette.accent:     '#DB8479'  // アクセント/エラー
Palette.surface:    '#FFFFFF'  // カード背景
Palette.gray:       '#9CA3AF'  // グレー
```

## 環境変数（.env）
```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
```

## コマンド
```bash
npx expo start          # 開発サーバー起動
npx expo start --android
npx expo start --ios
npx expo lint           # ESLint実行
```

## 開発ルール
- UIテキストは全て日本語
- services層を経由してFirestoreにアクセス（画面から直接Firestoreを叩かない）
- カスタムフックで画面ロジックを分離（hooks/ディレクトリ）
- `Swipeable`（react-native-gesture-handler）でスワイプ編集/削除
- デフォルト収入カテゴリ（`cat_fixed_income`, `cat_extra_income`）は削除不可
- `babel.config.js` に `react-native-reanimated/plugin` 必須
- コイン画像は `assets/images/money/` に配置（webp形式）
- 効果音は `assets/sounds/coin.m4a`