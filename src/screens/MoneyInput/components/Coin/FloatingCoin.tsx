import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

// Gold color palette for money-like particles
const GOLD_COLORS = [
  '#FFD700', // Gold
  '#FFA500', // Orange gold
  '#FFF8DC', // Cornsilk (sparkle)
  '#F4DA61', // Coin gold
  '#DAA520', // Goldenrod
];

// --- Particle Sub-component ---
interface ParticleProps {
  endX: number;
  endY: number;
  delay: number;
  size: number;
  color: string;
  onComplete: () => void;
}

const Particle: React.FC<ParticleProps> = ({ endX, endY, delay, size, color, onComplete }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    const duration = 400 + Math.random() * 200; // Lighter: shorter duration

    // Move outwards with easing
    translateX.value = withDelay(delay, withTiming(endX, { 
      duration,
      easing: Easing.out(Easing.cubic),
    }));
    translateY.value = withDelay(delay, withTiming(endY, { 
      duration,
      easing: Easing.out(Easing.cubic),
    }));

    // Rotate while moving
    rotate.value = withDelay(delay, withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration }));

    // Shrink and fade out
    scale.value = withDelay(delay, withTiming(0, { duration }));
    opacity.value = withDelay(
      delay + duration * 0.3,
      withTiming(0, { duration: duration * 0.7 }, (finished) => {
        if (finished) {
          'worklet';
          onComplete();
        }
      })
    );
  }, [delay, endX, endY, onComplete, opacity, rotate, scale, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.particle, 
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        animatedStyle 
      ]} 
    />
  );
};

// --- Sparkle Sub-component (extra visual flair) ---
interface SparkleProps {
  endX: number;
  endY: number;
  delay: number;
  onComplete: () => void;
}

const Sparkle: React.FC<SparkleProps> = ({ endX, endY, delay, onComplete }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    const duration = 300 + Math.random() * 150;

    // Pop in
    scale.value = withDelay(delay, withTiming(1, { duration: duration * 0.3 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: duration * 0.2 }));
    rotate.value = withDelay(delay, withTiming(45, { duration }));

    // Fade out
    opacity.value = withDelay(
      delay + duration * 0.4,
      withTiming(0, { duration: duration * 0.6 }, (finished) => {
        if (finished) {
          'worklet';
          onComplete();
        }
      })
    );

    // Return to small
    scale.value = withDelay(
      delay + duration * 0.5,
      withTiming(0, { duration: duration * 0.5 })
    );
  }, [delay, endX, endY, onComplete, opacity, rotate, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: endX * 0.7 }, // Sparkles travel less distance
      { translateY: endY * 0.7 },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.sparkle, animatedStyle]} />
  );
};

// --- Main FloatingCoin Component ---
interface FloatingCoinProps {
  id: string;
  x: number;
  y: number;
  onAnimationComplete: (id: string) => void;
}

const PARTICLE_COUNT = 8; // Lighter: reduced from 12
const SPREAD = 90; // 10% smaller (120 * 0.9)
const SPARKLE_COUNT = 6;

export const FloatingCoin: React.FC<FloatingCoinProps> = ({
  id,
  x,
  y,
  onAnimationComplete,
}) => {
  const completedParticles = useSharedValue(0);
  const totalParticles = PARTICLE_COUNT + SPARKLE_COUNT;

  const onParticleComplete = () => {
    'worklet';
    completedParticles.value += 1;
    if (completedParticles.value === totalParticles) {
      runOnJS(onAnimationComplete)(id);
    }
  };

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, index) => {
      const angle = (index / PARTICLE_COUNT) * 2 * Math.PI;
      const distance = Math.random() * SPREAD * 0.5 + SPREAD * 0.5;
      const size = 6 + Math.random() * 8; // Varying sizes
      const color = GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];
      return {
        id: `p-${index}`,
        endX: Math.cos(angle) * distance,
        endY: Math.sin(angle) * distance,
        delay: Math.random() * 80,
        size,
        color,
      };
    });
  }, []);

  const sparkles = useMemo(() => {
    return Array.from({ length: SPARKLE_COUNT }).map((_, index) => {
      const angle = (index / SPARKLE_COUNT) * 2 * Math.PI + Math.PI / 4;
      const distance = Math.random() * SPREAD * 0.6 + SPREAD * 0.3;
      return {
        id: `s-${index}`,
        endX: Math.cos(angle) * distance,
        endY: Math.sin(angle) * distance,
        delay: 50 + Math.random() * 100,
      };
    });
  }, []);

  return (
    <View
      style={[styles.container, { left: x, top: y }]}
      pointerEvents="none"
    >
      {particles.map((p) => (
        <Particle
          key={p.id}
          endX={p.endX}
          endY={p.endY}
          delay={p.delay}
          size={p.size}
          color={p.color}
          onComplete={onParticleComplete}
        />
      ))}
      {sparkles.map((s) => (
        <Sparkle
          key={s.id}
          endX={s.endX}
          endY={s.endY}
          delay={s.delay}
          onComplete={onParticleComplete}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
    transform: [{ translateX: -8 }, { translateY: -8 }],
  },
  particle: {
    position: 'absolute',
  },
  sparkle: {
    position: 'absolute',
    width: 12,
    height: 12,
    // Star shape using borders
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFD700',
    borderBottomColor: '#FFD700',
  },
});
