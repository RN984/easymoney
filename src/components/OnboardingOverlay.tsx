import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Palette } from '../constants/theme';
import { OnboardingStep } from '../hooks/useOnboarding';

interface OnboardingOverlayProps {
  step: OnboardingStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onSkip,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [stepIndex]);

  const isLastStep = stepIndex === totalSteps - 1;

  // 吹き出しの位置を計算
  const tooltipPositionStyle: Record<string, number | string> = {};
  if (step.top != null) tooltipPositionStyle.top = step.top;
  if (step.bottom != null) tooltipPositionStyle.bottom = step.bottom;

  // 特定ステップで吹き出しの水平位置を調整
  const getHorizontalStyle = () => {
    if (step.id === 'history') {
      return { alignItems: 'flex-end' as const, paddingRight: 24 };
    }
    if (step.id === 'menu') {
      return { alignItems: 'flex-start' as const, paddingLeft: 24 };
    }
    return { alignItems: 'center' as const };
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* 半透明背景（タップで次へ進まないようにする） */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => {}}
      />

      {/* 吹き出し */}
      <Animated.View
        style={[
          styles.tooltipWrapper,
          tooltipPositionStyle,
          getHorizontalStyle(),
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        pointerEvents="box-none"
      >
        {/* 上向き矢印 */}
        {step.arrowDirection === 'up' && (
          <View style={[
            styles.arrowUp,
            step.id === 'history' && { alignSelf: 'flex-end', marginRight: 16 },
            step.id === 'menu' && { alignSelf: 'flex-start', marginLeft: 16 },
          ]} />
        )}

        <View style={styles.bubble}>
          <Text style={styles.message}>{step.message}</Text>

          {/* ステップインジケーター */}
          <View style={styles.dotsContainer}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === stepIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* ボタン */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>スキップ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onNext} style={styles.nextButton}>
              <Text style={styles.nextText}>
                {isLastStep ? 'はじめる' : '次へ'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 下向き矢印 */}
        {step.arrowDirection === 'down' && (
          <View style={styles.arrowDown} />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tooltipWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 32,
  },
  bubble: {
    backgroundColor: Palette.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    maxWidth: SCREEN_WIDTH - 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: Palette.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: Palette.primary,
    width: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    color: Palette.gray,
  },
  nextButton: {
    backgroundColor: Palette.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  nextText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Palette.white,
  },
  arrowUp: {
    width: 0,
    height: 0,
    alignSelf: 'center',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Palette.white,
    marginBottom: -1,
  },
  arrowDown: {
    width: 0,
    height: 0,
    alignSelf: 'center',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Palette.white,
    marginTop: -1,
  },
});
