import SwiftUI
import WidgetKit

// MARK: - Timeline Entry

struct SpendingEntry: TimelineEntry {
    let date: Date
    let spendingData: SpendingData?
}

// MARK: - Timeline Provider

struct SpendingProvider: TimelineProvider {
    func placeholder(in context: Context) -> SpendingEntry {
        SpendingEntry(date: Date(), spendingData: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (SpendingEntry) -> Void) {
        let entry = SpendingEntry(
            date: Date(),
            spendingData: SharedDataStore.shared.spendingData ?? .placeholder
        )
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SpendingEntry>) -> Void) {
        let entry = SpendingEntry(
            date: Date(),
            spendingData: SharedDataStore.shared.spendingData
        )
        let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(600)))
        completion(timeline)
    }
}

// MARK: - Small View (total spending + progress)

struct SpendingSmallView: View {
    let data: SpendingData

    private var progress: Double {
        guard data.budget > 0 else { return 0 }
        return min(Double(data.totalSpending) / Double(data.budget), 1.0)
    }

    private var progressColor: Color {
        if progress >= 0.9 { return WidgetTheme.accent }
        if progress >= 0.7 { return WidgetTheme.secondary }
        return WidgetTheme.primary
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("今月の支出")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(WidgetTheme.text.opacity(0.6))
                Spacer()
            }

            Text("¥\(data.totalSpending.formatted())")
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(WidgetTheme.text)
                .minimumScaleFactor(0.7)
                .lineLimit(1)

            // Progress bar
            VStack(spacing: 3) {
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

                HStack {
                    Text("\(Int(progress * 100))%")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(progressColor)
                    Spacer()
                    Text("¥\(data.budget.formatted())")
                        .font(.system(size: 10))
                        .foregroundColor(WidgetTheme.text.opacity(0.5))
                }
            }

            Spacer(minLength: 0)

            // Top category
            if let top = data.categoryBreakdown.max(by: { $0.amount < $1.amount }) {
                HStack(spacing: 4) {
                    Circle()
                        .fill(Color(hex: top.color))
                        .frame(width: 6, height: 6)
                    Text(top.categoryName)
                        .font(.system(size: 10))
                        .foregroundColor(WidgetTheme.text.opacity(0.7))
                    Spacer()
                    Text("¥\(top.amount.formatted())")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(WidgetTheme.text)
                }
            }
        }
        .padding(14)
    }
}

// MARK: - Medium View (total + category breakdown)

struct SpendingMediumView: View {
    let data: SpendingData

    private var progress: Double {
        guard data.budget > 0 else { return 0 }
        return min(Double(data.totalSpending) / Double(data.budget), 1.0)
    }

    private var progressColor: Color {
        if progress >= 0.9 { return WidgetTheme.accent }
        if progress >= 0.7 { return WidgetTheme.secondary }
        return WidgetTheme.primary
    }

    private var sortedCategories: [CategorySpending] {
        data.categoryBreakdown.sorted { $0.amount > $1.amount }
    }

    var body: some View {
        HStack(spacing: 12) {
            // Left: total & progress
            VStack(alignment: .leading, spacing: 6) {
                Text("今月の支出")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(WidgetTheme.text.opacity(0.6))

                Text("¥\(data.totalSpending.formatted())")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(WidgetTheme.text)
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)

                Spacer(minLength: 0)

                VStack(spacing: 3) {
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

                    HStack {
                        Text("\(Int(progress * 100))%")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(progressColor)
                        Spacer()
                        Text("/ ¥\(data.budget.formatted())")
                            .font(.system(size: 10))
                            .foregroundColor(WidgetTheme.text.opacity(0.5))
                    }
                }
            }
            .frame(maxWidth: .infinity)

            // Right: category breakdown
            VStack(alignment: .leading, spacing: 4) {
                ForEach(Array(sortedCategories.prefix(5))) { cat in
                    HStack(spacing: 4) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color(hex: cat.color))
                            .frame(width: 4, height: 16)
                        Text(cat.categoryName)
                            .font(.system(size: 10))
                            .foregroundColor(WidgetTheme.text)
                            .lineLimit(1)
                        Spacer()
                        Text("¥\(cat.amount.formatted())")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(WidgetTheme.text)
                    }
                }
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity)
        }
        .padding(14)
    }
}

// MARK: - Large View (total + progress + full breakdown + mini chart)

struct SpendingLargeView: View {
    let data: SpendingData

    private var progress: Double {
        guard data.budget > 0 else { return 0 }
        return min(Double(data.totalSpending) / Double(data.budget), 1.0)
    }

    private var progressColor: Color {
        if progress >= 0.9 { return WidgetTheme.accent }
        if progress >= 0.7 { return WidgetTheme.secondary }
        return WidgetTheme.primary
    }

    private var sortedCategories: [CategorySpending] {
        data.categoryBreakdown.sorted { $0.amount > $1.amount }
    }

    private var remaining: Int {
        max(data.budget - data.totalSpending, 0)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header
            HStack {
                Text("今月の支出")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(WidgetTheme.text.opacity(0.6))
                Spacer()
                Text("残り ¥\(remaining.formatted())")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(remaining > 0 ? WidgetTheme.primary : WidgetTheme.accent)
            }

            // Total amount
            Text("¥\(data.totalSpending.formatted())")
                .font(.system(size: 30, weight: .bold))
                .foregroundColor(WidgetTheme.text)

            // Progress bar
            VStack(spacing: 3) {
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 5)
                            .fill(Color.gray.opacity(0.2))
                            .frame(height: 10)
                        RoundedRectangle(cornerRadius: 5)
                            .fill(progressColor)
                            .frame(width: geo.size.width * progress, height: 10)
                    }
                }
                .frame(height: 10)

                HStack {
                    Text("\(Int(progress * 100))% 使用")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(progressColor)
                    Spacer()
                    Text("予算 ¥\(data.budget.formatted())")
                        .font(.system(size: 10))
                        .foregroundColor(WidgetTheme.text.opacity(0.5))
                }
            }

            Divider()

            // Category breakdown with bar chart
            Text("カテゴリ別")
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(WidgetTheme.text.opacity(0.6))

            let maxAmount = sortedCategories.first?.amount ?? 1
            ForEach(sortedCategories) { cat in
                HStack(spacing: 8) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color(hex: cat.color))
                        .frame(width: 4, height: 20)

                    Text(cat.categoryName)
                        .font(.system(size: 11))
                        .foregroundColor(WidgetTheme.text)
                        .frame(width: 50, alignment: .leading)

                    GeometryReader { geo in
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color(hex: cat.color).opacity(0.6))
                            .frame(
                                width: geo.size.width * CGFloat(cat.amount) / CGFloat(max(maxAmount, 1)),
                                height: 12
                            )
                            .frame(maxHeight: .infinity, alignment: .center)
                    }

                    Text("¥\(cat.amount.formatted())")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(WidgetTheme.text)
                        .frame(width: 65, alignment: .trailing)
                }
                .frame(height: 22)
            }

            Spacer(minLength: 0)
        }
        .padding(16)
    }
}

// MARK: - No Data View

struct SpendingNoDataView: View {
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "yensign.circle")
                .font(.system(size: 32))
                .foregroundColor(WidgetTheme.primary)
            Text("アプリを開いて\nデータを同期してください")
                .font(.system(size: 12))
                .foregroundColor(WidgetTheme.text.opacity(0.6))
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}

// MARK: - Widget Definition

struct SpendingWidget: Widget {
    let kind: String = "SpendingWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SpendingProvider()) { entry in
            if #available(iOS 17.0, *) {
                SpendingWidgetEntryView(entry: entry)
                    .containerBackground(WidgetTheme.background, for: .widget)
            } else {
                SpendingWidgetEntryView(entry: entry)
                    .background(WidgetTheme.background)
            }
        }
        .configurationDisplayName("支出状況")
        .description("今月の支出と予算の進捗を表示")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct SpendingWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: SpendingEntry

    var body: some View {
        if let data = entry.spendingData {
            switch family {
            case .systemSmall:
                SpendingSmallView(data: data)
            case .systemMedium:
                SpendingMediumView(data: data)
            case .systemLarge:
                SpendingLargeView(data: data)
            default:
                SpendingMediumView(data: data)
            }
        } else {
            SpendingNoDataView()
        }
    }
}
