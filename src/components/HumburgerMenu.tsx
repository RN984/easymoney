// src/components/HamburgerMenu.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/theme';

export const HamburgerMenu = () => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => console.log('Menu Toggled')}>
      {/* 簡易的な3本線アイコン (実際はSVGや画像推奨) */}
      <Text style={styles.icon}>≡</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
});