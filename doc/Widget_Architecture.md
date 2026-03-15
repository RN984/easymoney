# EasyMoney ウィジェットアーキテクチャ

## 概要
iOS WidgetKitを使った2種類のウィジェットを提供。
React Native側とSwift側でApp Group (`group.com.easymoney.app`) を通じてデータを共有。

## データフロー

```
[React Native App]
  │
  ├── useMoneyInput.ts (コイン追加時)
  │     └── widgetService.syncSpendingToWidget()
  │           └── modules/widget-data/index.ts
  │                 └── WidgetDataModule.swift (App Group UserDefaults に書き込み)
  │
  └── Settings (カテゴリ/コイン変更時)
        └── widgetService.syncCoinsToWidget() / syncCategoriesToWidget()

[iOS Widget (Swift)]
  │
  ├── SharedData.swift (App Group UserDefaults から読み取り)
  │     ├── SpendingData    → SpendingWidget で表示
  │     ├── WidgetCoin[]    → QuickInputWidget で表示
  │     └── WidgetCategory[]→ QuickInputWidget 設定用
  │
  ├── QuickInputWidget.swift (コインタップ → AddCoinIntent)
  │     └── PendingTransaction を App Group に書き込み
  │
  └── SpendingWidget.swift (支出状況を表示のみ)

[React Native App 起動時]
  └── useMoneyInput.ts loadData()
        └── widgetService.consumePendingTransactions()
              └── 保留分をFirestoreに反映
```

## UserDefaults キー一覧

| キー | 型 | 書き込み元 | 読み取り元 |
|------|-----|-----------|-----------|
| `widget_spending_data` | SpendingData (JSON) | RN側 | SpendingWidget |
| `widget_coins` | WidgetCoin[] (JSON) | RN側 | QuickInputWidget |
| `widget_categories` | WidgetCategory[] (JSON) | RN側 | QuickInputWidget設定 |
| `widget_pending_transactions` | PendingTransaction[] (JSON) | QuickInputWidget | RN側（起動時に消費） |

## ウィジェット一覧

### 1. SpendingWidget（支出状況）
- サイズ: Small / Medium / Large
- 更新頻度: 10分ごと（`.after(600)`）
- 設定: なし（StaticConfiguration）
- 表示: 今月の支出合計、予算進捗バー、カテゴリ別内訳

### 2. QuickInputWidget（クイック入力）- iOS 17+
- サイズ: Small / Medium / Large
- 更新頻度: 5分ごと（`.after(300)`）
- 設定: カテゴリ選択（AppIntentConfiguration + WidgetConfigurationIntent）
- インタラクション: コインボタンタップ → AddCoinIntent → PendingTransaction保存

## Swift ファイル構成

| ファイル | 役割 |
|---------|------|
| `widgets/SharedData.swift` | データモデル定義 + SharedDataStore + Color/Theme |
| `widgets/QuickInputWidget.swift` | クイック入力ウィジェット（View + Provider） |
| `widgets/QuickInputIntent.swift` | AppIntent定義（AddCoinIntent, CategoryEntity等） |
| `widgets/SpendingWidget.swift` | 支出状況ウィジェット（View + Provider） |
| `widgets/WidgetBundle.swift` | WidgetBundle（エントリポイント） |
| `widgets/Attributes.swift` | Live Activities用プレースホルダ（未使用） |
| `widgets/Module.swift` | ExpoModulesCore用モジュール定義 |

## 注意事項
- ウィジェットからの保留トランザクションは**アプリ起動時のみ**処理される
- `modules/widget-data/` はExpo Native Moduleとして実装（iOS専用）
- Android（Platform.OS !== 'ios'）では全widgetService関数がno-op