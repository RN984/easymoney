// app/index.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette } from '../constants/theme';
import MoneyInputScreen from '../src/screens/MoneyInput';

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* メイン機能の表示 */}
      <View style={styles.mainContent}>
        <MoneyInputScreen />
      </View>

      {/* 開発用: デバッグ画面へのフローティングボタン 
        本番リリース時には削除するか、フラグで制御してください
      */}
      <TouchableOpacity
        style={[styles.debugButton, { bottom: insets.bottom + 20 }]}
        onPress={() => router.push('/debug-test')}
      >
        <Text style={styles.debugButtonText}>🛠 Debug</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  mainContent: {
    flex: 1,
  },
  debugButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: Palette.text,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 100, // 最前面に表示
  },
  debugButtonText: {
    color: Palette.background, // テキスト色は背景色と反転
    fontWeight: 'bold',
    fontSize: 12,
  },
});