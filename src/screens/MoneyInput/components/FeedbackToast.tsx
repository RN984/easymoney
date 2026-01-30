import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Colors } from '../../../../constants/theme';

interface FeedbackToastProps {
  visible: boolean;
  message: string;
  categoryColor?: string;
}

export const FeedbackToast: React.FC<FeedbackToastProps> = ({ visible, message, categoryColor }) => {
  if (!visible) return null;

  return (
    <Animated.View 
      entering={FadeInUp.springify().damping(12)}
      exiting={FadeOutUp}
      style={[styles.container, { backgroundColor: categoryColor || Colors.light.primary }]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%', // 画面中央付近
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});