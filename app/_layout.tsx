// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Palette } from '../constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Palette.background,
          },
          headerTintColor: Palette.text,
          headerTitleStyle: {
            fontWeight: 'bold',
            color: Palette.text,
          },
          // 全画面共通の背景色設定
          contentStyle: {
            backgroundColor: Palette.background,
          },
          headerShadowVisible: false, // フラットなデザインにするため影を消去
        }}
      >
        {/* メイン画面（index）: ヘッダーは画面独自のものを使うか、ここで設定するか選択可能。
            今回はMoneyInputScreen内にヘッダー風のViewがあるため、Stackヘッダーは非表示推奨ですが、
            デバッグ用にStackヘッダーを残す構成にします。 */}
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'ホーム',
            headerShown: false // MoneyInputScreenのデザインを優先して非表示
          }} 
        />
        
        {/* デバッグ画面 */}
        <Stack.Screen 
          name="debug-test" 
          options={{ 
            title: '接続テスト',
            headerShown: true
          }} 
        />
      </Stack>
    </>
  );
}