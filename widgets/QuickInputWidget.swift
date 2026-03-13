import SwiftUI
import WidgetKit

// MARK: - Timeline Entry

struct QuickInputEntry: TimelineEntry {
    let date: Date
    let coins: [WidgetCoin]
    let categoryId: String
    let categoryName: String
    let categoryColor: String
    let spendingData: SpendingData?
    let lastAddedAmount: Int?
}

// MARK: - Timeline Provider

@available(iOS 17.0, *)
struct QuickInputProvider: AppIntentTimelineProvider {
    typealias Entry = QuickInputEntry
    typealias Intent = QuickInputConfigIntent

    func placeholder(in context: Context) -> QuickInputEntry {
        QuickInputEntry(
            date: Date(),
            coins: WidgetCoin.defaultCoins,
            categoryId: "cat_food",
            categoryName: "食費",
            categoryColor: "#DB8479",
            spendingData: .placeholder,
            lastAddedAmount: nil
        )
    }

    func snapshot(for configuration: QuickInputConfigIntent, in context: Context) async -> QuickInputEntry {
        makeEntry(for: configuration)
    }

    func timeline(for configuration: QuickInputConfigIntent, in context: Context) async -> Timeline<QuickInputEntry> {
        let entry = makeEntry(for: configuration)
        return Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(300)))
    }

    private func makeEntry(for configuration: QuickInputConfigIntent) -> QuickInputEntry {
        let store = SharedDataStore.shared
        let coins = store.coins.isEmpty ? WidgetCoin.defaultCoins : store.coins

        let categoryId: String
        let categoryName: String
        let categoryColor: String

        if let selected = configuration.category {
            categoryId = selected.id
            categoryName = selected.name
            categoryColor = selected.color
        } else {
            let cats = store.categories
            if let first = cats.first(where: { $0.type == "expense" }) {
                categoryId = first.id
                categoryName = first.name
                categoryColor = first.color
            } else {
                categoryId = "cat_food"
                categoryName = "食費"
                categoryColor = "#DB8479"
            }
        }

        let pending = store.pendingTransactions
        let lastAdded = pending.last?.coinAmount

        return QuickInputEntry(
            date: Date(),
            coins: coins,
            categoryId: categoryId,
            categoryName: categoryName,
            categoryColor: categoryColor,
            spendingData: store.spendingData,
            lastAddedAmount: lastAdded
        )
    }
}

// MARK: - Coin Button View

@available(iOS 17.0, *)
struct CoinButtonView: View {
    let coin: WidgetCoin
    let categoryId: String
    let categoryName: String
    let size: CGFloat

    var body: some View {
        Button(intent: AddCoinIntent(amount: coin.amount, categoryId: categoryId, categoryName: categoryName)) {
            VStack(spacing: 1) {
                ZStack {
                    Circle()
                        .fill(
                            coin.isCustom
                                ? Color(hex: coin.color)
                                : WidgetTheme.secondary
                        )
                        .frame(width: size, height: size)
                        .shadow(color: .black.opacity(0.15), radius: 1, y: 1)
                    Circle()
                        .strokeBorder(Color.white.opacity(0.4), lineWidth: 1)
                        .frame(width: size - 4, height: size - 4)
                    Text(coin.name)
                        .font(.system(size: size * 0.3, weight: .bold))
                        .foregroundColor(WidgetTheme.text)
                        .minimumScaleFactor(0.5)
                }
                Text(formatAmount(coin.amount))
                    .font(.system(size: 8, weight: .medium))
                    .foregroundColor(WidgetTheme.text.opacity(0.7))
                    .lineLimit(1)
            }
        }
        .buttonStyle(.plain)
    }

    private func formatAmount(_ amount: Int) -> String {
        if amount >= 10000 {
            return "\(amount / 10000)万"
        } else if amount >= 1000 {
            return "\(amount / 1000)千"
        }
        return "¥\(amount)"
    }
}

// MARK: - Small Widget View (6 coins: 3x2)

@available(iOS 17.0, *)
struct QuickInputSmallView: View {
    let entry: QuickInputEntry

    var displayCoins: [WidgetCoin] {
        Array(entry.coins.prefix(6))
    }

    var body: some View {
        VStack(spacing: 4) {
            // Category header
            HStack {
                Circle()
                    .fill(Color(hex: entry.categoryColor))
                    .frame(width: 8, height: 8)
                Text(entry.categoryName)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(WidgetTheme.text)
                Spacer()
            }

            // 3x2 coin grid
            let columns = Array(repeating: GridItem(.flexible(), spacing: 4), count: 3)
            LazyVGrid(columns: columns, spacing: 4) {
                ForEach(displayCoins) { coin in
                    CoinButtonView(
                        coin: coin,
                        categoryId: entry.categoryId,
                        categoryName: entry.categoryName,
                        size: 36
                    )
                }
            }

            Spacer(minLength: 0)
        }
        .padding(12)
    }
}

// MARK: - Medium Widget View (up to 9 coins in adaptive layout)

@available(iOS 17.0, *)
struct QuickInputMediumView: View {
    let entry: QuickInputEntry

    var displayCoins: [WidgetCoin] {
        Array(entry.coins.prefix(9))
    }

    var body: some View {
        VStack(spacing: 4) {
            // Category header
            HStack {
                Circle()
                    .fill(Color(hex: entry.categoryColor))
                    .frame(width: 8, height: 8)
                Text(entry.categoryName)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(WidgetTheme.text)
                Spacer()
                if let last = entry.lastAddedAmount {
                    Text("+¥\(last)")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(WidgetTheme.primary)
                }
            }

            // Adaptive coin layout
            if displayCoins.count <= 5 {
                HStack(spacing: 6) {
                    ForEach(displayCoins) { coin in
                        CoinButtonView(
                            coin: coin,
                            categoryId: entry.categoryId,
                            categoryName: entry.categoryName,
                            size: 38
                        )
                    }
                }
            } else {
                let topRow = Array(displayCoins.prefix((displayCoins.count + 1) / 2))
                let bottomRow = Array(displayCoins.suffix(displayCoins.count / 2))
                VStack(spacing: 2) {
                    HStack(spacing: 4) {
                        ForEach(topRow) { coin in
                            CoinButtonView(
                                coin: coin,
                                categoryId: entry.categoryId,
                                categoryName: entry.categoryName,
                                size: 34
                            )
                        }
                    }
                    HStack(spacing: 4) {
                        ForEach(bottomRow) { coin in
                            CoinButtonView(
                                coin: coin,
                                categoryId: entry.categoryId,
                                categoryName: entry.categoryName,
                                size: 34
                            )
                        }
                    }
                }
            }

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
    }
}

// MARK: - Large Widget View (up to 9 coins + progress bar)

@available(iOS 17.0, *)
struct QuickInputLargeView: View {
    let entry: QuickInputEntry

    var displayCoins: [WidgetCoin] {
        Array(entry.coins.prefix(9))
    }

    var body: some View {
        VStack(spacing: 8) {
            // Category header
            HStack {
                Circle()
                    .fill(Color(hex: entry.categoryColor))
                    .frame(width: 10, height: 10)
                Text(entry.categoryName)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(WidgetTheme.text)
                Spacer()
                if let last = entry.lastAddedAmount {
                    Text("+¥\(last)")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(WidgetTheme.primary)
                }
            }

            Spacer(minLength: 0)

            // Coin grid (3x3 for 9 coins)
            let columns = Array(repeating: GridItem(.flexible(), spacing: 6), count: 3)
            LazyVGrid(columns: columns, spacing: 6) {
                ForEach(displayCoins) { coin in
                    CoinButtonView(
                        coin: coin,
                        categoryId: entry.categoryId,
                        categoryName: entry.categoryName,
                        size: 48
                    )
                }
            }

            Spacer(minLength: 0)

            // Progress bar
            if let spending = entry.spendingData {
                BudgetProgressView(spending: spending)
            }
        }
        .padding(16)
    }
}

// MARK: - Budget Progress View (for Large widget)

struct BudgetProgressView: View {
    let spending: SpendingData

    private var progress: Double {
        guard spending.budget > 0 else { return 0 }
        return min(Double(spending.totalSpending) / Double(spending.budget), 1.0)
    }

    private var progressColor: Color {
        if progress >= 0.9 { return WidgetTheme.accent }
        if progress >= 0.7 { return WidgetTheme.secondary }
        return WidgetTheme.primary
    }

    var body: some View {
        VStack(spacing: 4) {
            HStack {
                Text("¥\(spending.totalSpending.formatted())")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(WidgetTheme.text)
                Text("/ ¥\(spending.budget.formatted())")
                    .font(.system(size: 11))
                    .foregroundColor(WidgetTheme.text.opacity(0.5))
                Spacer()
                Text("\(Int(progress * 100))%")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(progressColor)
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.gray.opacity(0.2))
                        .frame(height: 8)
                    RoundedRectangle(cornerRadius: 4)
                        .fill(progressColor)
                        .frame(width: geo.size.width * progress, height: 8)
                }
            }
            .frame(height: 8)
        }
    }
}

// MARK: - Widget Definition

@available(iOS 17.0, *)
struct QuickInputWidget: Widget {
    let kind: String = "QuickInputWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: QuickInputConfigIntent.self,
            provider: QuickInputProvider()
        ) { entry in
            QuickInputWidgetEntryView(entry: entry)
                .containerBackground(WidgetTheme.background, for: .widget)
        }
        .configurationDisplayName("クイック入力")
        .description("コインをタップして支出を素早く記録")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

@available(iOS 17.0, *)
struct QuickInputWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: QuickInputEntry

    var body: some View {
        switch family {
        case .systemSmall:
            QuickInputSmallView(entry: entry)
        case .systemMedium:
            QuickInputMediumView(entry: entry)
        case .systemLarge:
            QuickInputLargeView(entry: entry)
        default:
            QuickInputMediumView(entry: entry)
        }
    }
}
