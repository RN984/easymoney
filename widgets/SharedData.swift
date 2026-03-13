import Foundation
import SwiftUI

let appGroupId = "group.com.easymoney.app"

// MARK: - Data Models

struct WidgetCoin: Codable, Identifiable {
    let id: String
    let name: String
    let amount: Int
    let color: String
    let isCustom: Bool
}

struct WidgetCategory: Codable, Identifiable {
    let id: String
    let name: String
    let color: String
    let type: String
}

struct CategorySpending: Codable, Identifiable {
    var id: String { categoryId }
    let categoryId: String
    let categoryName: String
    let color: String
    let amount: Int
}

struct SpendingData: Codable {
    let totalSpending: Int
    let budget: Int
    let categoryBreakdown: [CategorySpending]
    let lastUpdated: Date
}

struct PendingTransaction: Codable, Identifiable {
    var id: String { "\(categoryId)_\(timestamp.timeIntervalSince1970)" }
    let coinAmount: Int
    let categoryId: String
    let categoryName: String
    let timestamp: Date
}

// MARK: - Shared Data Store

class SharedDataStore {
    static let shared = SharedDataStore()

    private let userDefaults = UserDefaults(suiteName: appGroupId)
    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .millisecondsSince1970
        return d
    }()
    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        e.dateEncodingStrategy = .millisecondsSince1970
        return e
    }()

    // Keys
    private let spendingDataKey = "widget_spending_data"
    private let coinsKey = "widget_coins"
    private let categoriesKey = "widget_categories"
    private let pendingTransactionsKey = "widget_pending_transactions"

    var spendingData: SpendingData? {
        guard let data = userDefaults?.data(forKey: spendingDataKey) else { return nil }
        return try? decoder.decode(SpendingData.self, from: data)
    }

    var coins: [WidgetCoin] {
        guard let data = userDefaults?.data(forKey: coinsKey) else { return [] }
        return (try? decoder.decode([WidgetCoin].self, from: data)) ?? []
    }

    var categories: [WidgetCategory] {
        guard let data = userDefaults?.data(forKey: categoriesKey) else { return [] }
        return (try? decoder.decode([WidgetCategory].self, from: data)) ?? []
    }

    var pendingTransactions: [PendingTransaction] {
        guard let data = userDefaults?.data(forKey: pendingTransactionsKey) else { return [] }
        return (try? decoder.decode([PendingTransaction].self, from: data)) ?? []
    }

    func addPendingTransaction(_ transaction: PendingTransaction) {
        var existing = pendingTransactions
        existing.append(transaction)
        if let data = try? encoder.encode(existing) {
            userDefaults?.set(data, forKey: pendingTransactionsKey)
        }
    }

    func clearPendingTransactions() {
        userDefaults?.removeObject(forKey: pendingTransactionsKey)
    }
}

// MARK: - Color Helper

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Theme Colors

struct WidgetTheme {
    static let background = Color(hex: "EAE5C6")
    static let text = Color(hex: "272D2D")
    static let primary = Color(hex: "6179B5")
    static let secondary = Color(hex: "F4DA61")
    static let accent = Color(hex: "DB8479")
    static let surface = Color.white
}

// MARK: - Sample Data (for previews / placeholder)

extension SpendingData {
    static let placeholder = SpendingData(
        totalSpending: 32500,
        budget: 50000,
        categoryBreakdown: [
            CategorySpending(categoryId: "cat_food", categoryName: "食費", color: "#DB8479", amount: 15000),
            CategorySpending(categoryId: "cat_transport", categoryName: "交通費", color: "#6179B5", amount: 8000),
            CategorySpending(categoryId: "cat_daily", categoryName: "日用品", color: "#F4DA61", amount: 5500),
            CategorySpending(categoryId: "cat_ent", categoryName: "交際費", color: "#272D2D", amount: 4000),
        ],
        lastUpdated: Date()
    )
}

extension WidgetCoin {
    static let defaultCoins: [WidgetCoin] = [
        WidgetCoin(id: "coin_10000", name: "1万", amount: 10000, color: "#F4DA61", isCustom: false),
        WidgetCoin(id: "coin_5000", name: "5千", amount: 5000, color: "#F4DA61", isCustom: false),
        WidgetCoin(id: "coin_1000", name: "千", amount: 1000, color: "#F4DA61", isCustom: false),
        WidgetCoin(id: "coin_500", name: "500", amount: 500, color: "#F4DA61", isCustom: false),
        WidgetCoin(id: "coin_100", name: "100", amount: 100, color: "#F4DA61", isCustom: false),
        WidgetCoin(id: "coin_50", name: "50", amount: 50, color: "#F4DA61", isCustom: false),
        WidgetCoin(id: "coin_10", name: "10", amount: 10, color: "#F4DA61", isCustom: false),
    ]
}

extension WidgetCategory {
    static let defaultCategories: [WidgetCategory] = [
        WidgetCategory(id: "cat_food", name: "食費", color: "#DB8479", type: "expense"),
        WidgetCategory(id: "cat_transport", name: "交通費", color: "#6179B5", type: "expense"),
        WidgetCategory(id: "cat_daily", name: "日用品", color: "#F4DA61", type: "expense"),
        WidgetCategory(id: "cat_ent", name: "交際費", color: "#272D2D", type: "expense"),
        WidgetCategory(id: "cat_other", name: "その他", color: "#A0A0A0", type: "expense"),
    ]
}
