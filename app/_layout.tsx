import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Palette } from '../src/constants/theme';

export default function RootLayout() {
  return (

     <GestureHandlerRootView style={{ flex: 1 }}>
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
          contentStyle: {
            backgroundColor: Palette.background,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'ホーム',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="history" 
          options={{ 
            title: '履歴',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: '設定',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="debug-test" 
          options={{ 
            title: '接続テスト',
            headerShown: true
          }} 
        />
      </Stack>
      </GestureHandlerRootView>
  );
}