# EasyMoney Services API リファレンス

## transactionService.ts（`src/services/transactionService.ts`）

### createHousehold(data: CreateHouseholdDTO): Promise<Household>
新規の親家計簿データを作成。Location情報が含まれている場合はFirestoreに保存。
```ts
// CreateHouseholdDTO = Omit<Household, 'id'>
// { categoryId, totalAmount, memo?, location?, createdAt }
```

### updateHousehold(id: string, data: UpdateHouseholdDTO): Promise<void>
既存の親家計簿データを更新。createdAtがDateの場合はTimestampに自動変換。
```ts
// UpdateHouseholdDTO = Partial<Omit<Household, 'id'>>
```

### deleteHousehold(id: string): Promise<void>
親データとサブコレクション(items)をバッチ削除。

### addItemToHousehold(parentId: string, data: Omit<CreateHouseholdItemDTO, 'transactionId'>): Promise<HouseholdItem>
既存の親に明細を追加し、親の`totalAmount`を`increment()`でアトミック更新。
runTransaction内で実行。
```ts
// data: { categoryId, amount, createdAt, item?, memo? }
```

### getMonthlyTransactions(date: Date): Promise<Household[]>
指定月（1日〜末日）のHouseholdを取得。createdAt降順。

### getAllTransactions(): Promise<Household[]>
全件取得（エクスポート用）。

### resetAllData(): Promise<void>
全households（+サブコレクション）と全settings を削除。バッチ500件制限を考慮して分割処理。

---

## masterService.ts（`src/services/masterService.ts`）

設定は全て `settings/user_settings_v1` ドキュメントに `merge: true` で保存。

### fetchCategories(): Promise<Category[]>
カテゴリ一覧を取得。DEFAULT_CATEGORIESとマージし、不足分を自動補完。
showInInput, icon, order等のデフォルト値も補完する（`ensureCategoryDefaults`）。

### updateCategories(categories: Category[]): Promise<void>
カテゴリ一覧を上書き保存。

### fetchBudget(): Promise<number>
予算を取得。デフォルト: 50000。

### updateBudget(budget: number): Promise<void>

### fetchBaseSalary(): Promise<number>
基本給を取得。デフォルト: 0。

### updateBaseSalary(baseSalary: number): Promise<void>

### fetchSalaryDay(): Promise<number>
給料日を取得。0=月末, 1-28=カスタム日付。デフォルト: 1。

### updateSalaryDay(salaryDay: number): Promise<void>

### fetchCoinSettings(): Promise<CoinSettings>
コイン設定を取得。デフォルト: `{ hiddenCoins: [], customCoins: [] }`。

### updateCoinSettings(coinSettings: CoinSettings): Promise<void>

---

## widgetService.ts（`src/services/widgetService.ts`）

iOS専用。`modules/widget-data` 経由でApp Group UserDefaultsにJSON保存。

### syncCoinsToWidget(coinSettings: CoinSettings): void
デフォルトコイン（hidden除外）+ カスタムコインをウィジェットに同期。

### syncCategoriesToWidget(categories: Category[]): void
showInInput !== false のカテゴリをウィジェットに同期。

### syncSpendingToWidget(transactions, budget, categories): void
支出カテゴリの合計・内訳をウィジェットに同期。

### syncAllToWidget(transactions, budget, categories, coinSettings): void
上記3つをまとめて実行。

### consumePendingTransactions(): PendingTransaction[]
ウィジェットで記録された保留中トランザクションを取得して削除。