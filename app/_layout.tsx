// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#EAE5C6', // アプリの背景色に合わせる
        },
        headerTintColor: '#272D2D',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#EAE5C6',
        }
      }}
    />
  );
}