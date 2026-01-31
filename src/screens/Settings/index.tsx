// src/screens/Settings/index.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';

// Components
import { SettingItem } from './components/SettingItem';
import { SettingSection } from './components/SettingSection';

// Hooks
import { useSettings } from './hooks/useSettings';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading, handleExportCSV, handleResetDatabase } = useSettings();

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
          <SettingItem
            icon="pricetag"
            label="カテゴリ設定"
            onPress={() => router.push('./components/settings/categories')} // パスは適宜調整
          />
          {/* 必要に応じて予算設定なども追加 */}
          {/* <SettingItem icon="wallet" label="予算設定" onPress={() => {}} /> */}
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
            onPress={() => {}} // About画面などへ
          />
        </SettingSection>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background, // 背景色をテーマに合わせる
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