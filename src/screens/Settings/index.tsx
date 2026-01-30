import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Palette } from '../../../constants/theme';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>設定</Text>
        <View style={styles.section}>
          <Text style={styles.label}>アプリバージョン</Text>
          <Text style={styles.value}>1.0.0</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>ユーザー設定</Text>
          <Text style={styles.description}>
            カテゴリ編集やテーマ変更機能は現在開発中です。
          </Text>
        </View>
      </View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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