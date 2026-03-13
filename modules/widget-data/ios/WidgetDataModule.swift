import ExpoModulesCore
import WidgetKit

public class WidgetDataModule: Module {
    private let appGroupId = "group.com.easymoney.app"

    private var sharedDefaults: UserDefaults? {
        UserDefaults(suiteName: appGroupId)
    }

    public func definition() -> ModuleDefinition {
        Name("WidgetDataModule")

        Function("setData") { (key: String, value: String) in
            self.sharedDefaults?.set(value, forKey: key)
            self.sharedDefaults?.synchronize()
        }

        Function("getData") { (key: String) -> String? in
            return self.sharedDefaults?.string(forKey: key)
        }

        Function("removeData") { (key: String) in
            self.sharedDefaults?.removeObject(forKey: key)
            self.sharedDefaults?.synchronize()
        }

        Function("reloadAllTimelines") {
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }

        Function("reloadTimeline") { (kind: String) in
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadTimelines(ofKind: kind)
            }
        }
    }
}
