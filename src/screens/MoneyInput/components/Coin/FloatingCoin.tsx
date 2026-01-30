import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { CoinValue } from '../../../../index';

interface FloatingCoinProps {
  id: string;
  value: CoinValue;
  x: number;
  y: number;
  onAnimationComplete: (id: string) => void;
}

export const FloatingCoin: React.FC<FloatingCoinProps> = ({
  id,
  value,
  x,
  y,
  onAnimationComplete,
}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // アニメーション実行: 上に50px移動しながらフェードアウト
    translateY.value = withTiming(-50, { duration: 600 });
    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(onAnimationComplete)(id);
        }
      })
    );
  }, [id, onAnimationComplete, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { left: x, top: y }, // タップ位置に絶対配置
        animatedStyle,
      ]}
      pointerEvents="none" // タッチイベントを透過させる
    >
      <View style={styles.coinCircle}>
        <Text style={styles.coinText}>+{value.toLocaleString()}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100, // 最前面に表示
  },
  coinCircle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F4DA61', // Secondary / Highlight
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#272D2D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  coinText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#272D2D',
  },
});