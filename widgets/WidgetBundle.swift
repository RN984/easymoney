import WidgetKit
import SwiftUI

@main
struct EasyMoneyWidgetBundle: WidgetBundle {
    var body: some Widget {
        SpendingWidget()
        if #available(iOS 17.0, *) {
            QuickInputWidget()
        }
    }
}
