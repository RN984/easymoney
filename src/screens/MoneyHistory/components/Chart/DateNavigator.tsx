// src/screens/MoneyHistory/components/DateNavigator.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../../constants/theme';

interface DateNavigatorProps {
  currentDate: Date;
  onChangeMonth: (increment: number) => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({ currentDate, onChangeMonth }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onChangeMonth(-1)} style={styles.button}>
        <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
      </TouchableOpacity>
      
      <Text style={styles.dateText}>
        {year}年 <Text style={styles.monthText}>{month}</Text>月
      </Text>
      
      <TouchableOpacity onPress={() => onChangeMonth(1)} style={styles.button}>
        <Ionicons name="chevron-forward" size={24} color={Colors.light.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.light.background,
  },
  button: {
    padding: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginHorizontal: 20,
  },
  monthText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
});