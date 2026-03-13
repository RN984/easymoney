// src/screens/Settings/index.tsx
import React from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Palette } from '../../constants/theme';

// Components
import CategoryAccordion from './components/Category/Accordion';
import CoinAccordion from './components/Coin/CoinAccordion';
import SalaryAccordion from './components/Salary/SalaryAccordion';
import { SettingItem } from './components/SettingItem';
import { SettingSection } from './components/SettingSection';

// Hooks
import { useSettings } from './hooks/useSettings';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isLoading, handleExportCSV, handleResetDatabase, baseSalary, salaryDay, handleUpdateBaseSalary, handleUpdateSalaryDay } = useSettings();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Section 1: General Settings */}
        <SettingSection title="一般">
          <SalaryAccordion
            isLoading={isLoading}
            baseSalary={baseSalary}
            salaryDay={salaryDay}
            handleUpdateBaseSalary={handleUpdateBaseSalary}
            handleUpdateSalaryDay={handleUpdateSalaryDay}
          />
          <CategoryAccordion />
          <CoinAccordion />
        </SettingSection>

        {/* Section 2: Widget (iOS only) */}
        {Platform.OS === 'ios' && (
          <SettingSection title="ウィジェット">
            <View style={styles.widgetInfo}>
              <Text style={styles.widgetTitle}>ホーム画面ウィジェット</Text>
              <Text style={styles.widgetDesc}>
                ホーム画面を長押し → 左上の「＋」→「easymoney」で追加できます。
              </Text>
              <View style={styles.widgetTypes}>
                <View style={styles.widgetType}>
                  <Text style={styles.widgetTypeName}>クイック入力</Text>
                  <Text style={styles.widgetTypeDesc}>コインをタップして素早く記録</Text>
                </View>
                <View style={styles.widgetType}>
                  <Text style={styles.widgetTypeName}>支出状況</Text>
                  <Text style={styles.widgetTypeDesc}>今月の支出と予算の進捗</Text>
                </View>
              </View>
              <Text style={styles.widgetHint}>
                ※ コインの表示は上の「コインリスト設定」と連動します{'\n'}
                ※ カテゴリはウィジェット長押し →「ウィジェットを編集」で変更
              </Text>
            </View>
          </SettingSection>
        )}

        {/* Section 3: Data Management */}
        <SettingSection title="データ管理">
          <SettingItem
            icon="download-outline"
            label="CSVエクスポート"
            onPress={handleExportCSV}
            showChevron={false}
          />
        </SettingSection>

        {/* Section 3: Debug / Danger Zone */}
        <SettingSection title="デバッグ">
          <SettingItem
            icon="trash-outline"
            label="データを初期化"
            onPress={handleResetDatabase}
            isDestructive
            showChevron={false}
          />
          <SettingItem
            icon="information-circle-outline"
            label="バージョン"
            value="1.0.0"
            onPress={() => {}}
          />
        </SettingSection>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetInfo: {
    padding: 16,
  },
  widgetTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Palette.text,
    marginBottom: 6,
  },
  widgetDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  widgetTypes: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  widgetType: {
    flex: 1,
    backgroundColor: Palette.background,
    borderRadius: 10,
    padding: 10,
  },
  widgetTypeName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Palette.text,
    marginBottom: 2,
  },
  widgetTypeDesc: {
    fontSize: 11,
    color: '#888',
  },
  widgetHint: {
    fontSize: 11,
    color: '#999',
    lineHeight: 16,
  },
});
