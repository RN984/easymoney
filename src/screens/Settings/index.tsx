// src/screens/Settings/index.tsx
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';

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

        {/* Section 2: Data Management */}
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
});
