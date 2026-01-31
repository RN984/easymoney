import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated';

interface Props {
  message: string | null;
  uniqueKey: number; // 変更検知用
}

export const FeedbackToast: React.FC<Props> = ({ message, uniqueKey }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (!message) return;

    // アニメーションのリセットと実行
    opacity.value = 0;
    translateY.value = 20;

    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(1, { duration: 1000 }), // 1秒待機
      withTiming(0, { duration: 300 })
    );

    translateY.value = withSequence(
      withTiming(0, { duration: 300 }),
      withTiming(0, { duration: 1000 }),
      withTiming(-20, { duration: 300 })
    );
  }, [uniqueKey, message]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!message) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%', // 画面中央付近
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    zIndex: 100,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});