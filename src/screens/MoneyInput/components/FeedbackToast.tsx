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
  uniqueKey: number;
}

export const FeedbackToast: React.FC<Props> = ({ message, uniqueKey }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (!message) return;

    // 数値をリセットしてからアニメーション開始
    opacity.value = 0;
    translateY.value = 20;

    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(1, { duration: 1000 }),
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
    // pointerEvents="none" を追加: トーストが表示されていても背面のボタン操作を阻害しないようにする
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // 画面全体に対する相対位置にするため、親(index.tsxのroot)基準で配置
    top: '45%', 
    alignSelf: 'center', // 左右中央寄せ
    backgroundColor: 'rgba(39, 45, 45, 0.9)', // 少し濃くして視認性アップ (Colors.light.text ベース)
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    zIndex: 9999, // 最前面を強制
    
    // 影をつけて浮き上がらせる
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});