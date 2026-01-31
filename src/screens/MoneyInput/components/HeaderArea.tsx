// src/screens/MoneyInput/components/HeaderArea.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../../src/constants/theme';

export const HeaderArea: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.push('/settings')} style={styles.iconButton}>
        <Ionicons name="menu" size={28} color={Colors.light.text} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/history')} style={styles.iconButton}>
        <Ionicons name="stats-chart" size={24} color={Colors.light.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  iconButton: {
    padding: 8,
  },
});
