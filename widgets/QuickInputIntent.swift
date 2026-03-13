import AppIntents
import WidgetKit

// MARK: - Category Entity for Widget Configuration

@available(iOS 17.0, *)
struct CategoryEntity: AppEntity {
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "カテゴリ"
    static var defaultQuery = CategoryEntityQuery()

    var id: String
    var name: String
    var color: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)")
    }
}

@available(iOS 17.0, *)
struct CategoryEntityQuery: EntityQuery {
    func entities(for identifiers: [String]) async throws -> [CategoryEntity] {
        let categories = SharedDataStore.shared.categories
        if categories.isEmpty {
            return WidgetCategory.defaultCategories.filter { identifiers.contains($0.id) }.map {
                CategoryEntity(id: $0.id, name: $0.name, color: $0.color)
            }
        }
        return categories.filter { identifiers.contains($0.id) }.map {
            CategoryEntity(id: $0.id, name: $0.name, color: $0.color)
        }
    }

    func suggestedEntities() async throws -> [CategoryEntity] {
        let categories = SharedDataStore.shared.categories
        if categories.isEmpty {
            return WidgetCategory.defaultCategories.filter { $0.type == "expense" }.map {
                CategoryEntity(id: $0.id, name: $0.name, color: $0.color)
            }
        }
        return categories.filter { $0.type == "expense" }.map {
            CategoryEntity(id: $0.id, name: $0.name, color: $0.color)
        }
    }

    func defaultResult() async -> CategoryEntity? {
        let categories = SharedDataStore.shared.categories
        if let first = categories.first(where: { $0.type == "expense" }) {
            return CategoryEntity(id: first.id, name: first.name, color: first.color)
        }
        let def = WidgetCategory.defaultCategories[0]
        return CategoryEntity(id: def.id, name: def.name, color: def.color)
    }
}

// MARK: - Add Coin Intent (Interactive Button Action)

@available(iOS 17.0, *)
struct AddCoinIntent: AppIntent {
    static var title: LocalizedStringResource = "コイン追加"
    static var description: IntentDescription = "選択したコインを家計簿に記録します"

    @Parameter(title: "金額")
    var amount: Int

    @Parameter(title: "カテゴリID")
    var categoryId: String

    @Parameter(title: "カテゴリ名")
    var categoryName: String

    init() {
        self.amount = 0
        self.categoryId = ""
        self.categoryName = ""
    }

    init(amount: Int, categoryId: String, categoryName: String) {
        self.amount = amount
        self.categoryId = categoryId
        self.categoryName = categoryName
    }

    func perform() async throws -> some IntentResult {
        let transaction = PendingTransaction(
            coinAmount: amount,
            categoryId: categoryId,
            categoryName: categoryName,
            timestamp: Date()
        )
        SharedDataStore.shared.addPendingTransaction(transaction)
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

// MARK: - Widget Configuration Intent

@available(iOS 17.0, *)
struct QuickInputConfigIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "クイック入力設定"
    static var description: IntentDescription = "カテゴリを選択してください"

    @Parameter(title: "カテゴリ")
    var category: CategoryEntity?
}
