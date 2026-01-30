import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NestableScrollContainer } from 'react-native-draggable-flatlist'; // 変更ポイント
import { SafeAreaView } from 'react-native-safe-area-context'; // Expo標準
import { Palette } from '../../../constants/theme';
import Accordion from './Category/components/Accordion';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <NestableScrollContainer contentContainerStyle={styles.content}>
        <Text style={styles.title}>設定</Text>
        
        {/* アプリ情報セクション */}
        <View style={styles.section}>
          <Text style={styles.label}>アプリバージョン</Text>
          <Text style={styles.value}>1.0.0</Text>
        </View>

        {/* ユーザー設定セクション */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ユーザー設定</Text>
        </View>

        {/* ここにアコーディオンを配置 */}
        <Accordion />

        <View style={styles.section}>
          <Text style={styles.label}>その他</Text>
          <Text style={styles.description}>
            その他の設定項目は順次追加予定です。
          </Text>
        </View>
        
      </NestableScrollContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Palette.text,
  },
  sectionHeader: {
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: Palette.text,
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});