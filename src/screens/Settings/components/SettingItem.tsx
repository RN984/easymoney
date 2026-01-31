// src/screens/Settings/components/SettingItem.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../../src/constants/theme';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  isDestructive?: boolean;
  showChevron?: boolean;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  value,
  onPress,
  isDestructive = false,
  showChevron = true,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isDestructive && styles.destructiveIcon]}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={isDestructive ? Colors.light.accent : Colors.light.text} 
        />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.label, isDestructive && styles.destructiveText]}>
          {label}
        </Text>
        {value && <Text style={styles.value}>{value}</Text>}
      </View>

      {showChevron && onPress && (
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  destructiveIcon: {
    opacity: 0.8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    color: Colors.light.text,
  },
  value: {
    fontSize: 16,
    color: '#8E8E93',
  },
  destructiveText: {
    color: Colors.light.accent,
  },
});