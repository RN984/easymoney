import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export interface OnboardingStep {
  id: string;
  message: string;
  arrowDirection: 'up' | 'down';
  // position relative to screen
  top?: number | string;
  bottom?: number | string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'category',
    message: 'カテゴリを選んで\n支出・収入を切り替えよう',
    arrowDirection: 'down',
    top: '8%',
  },
  {
    id: 'coins',
    message: 'コインをタップして\n金額を入力しよう',
    arrowDirection: 'down',
    top: '55%',
  },
  {
    id: 'progress',
    message: 'ここで予算の使用状況が\n一目でわかるよ',
    arrowDirection: 'up',
    top: '25%',
  },
  {
    id: 'history',
    message: 'ここから履歴を\n確認できるよ',
    arrowDirection: 'up',
    top: '14%',
  },
  {
    id: 'menu',
    message: '設定やその他の機能は\nここからアクセスできるよ',
    arrowDirection: 'up',
    top: '14%',
  },
];

export function useOnboarding() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY).then((value) => {
      if (value !== 'true') {
        setIsActive(true);
      }
      setIsLoading(false);
    });
  }, []);

  const currentStep = ONBOARDING_STEPS[currentStepIndex] ?? null;

  const next = useCallback(() => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // 最後のステップ完了
      setIsActive(false);
      AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    }
  }, [currentStepIndex]);

  const skip = useCallback(() => {
    setIsActive(false);
    AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  }, []);

  return {
    isActive: !isLoading && isActive,
    currentStep,
    currentStepIndex,
    totalSteps: ONBOARDING_STEPS.length,
    next,
    skip,
  };
}

/** データ初期化時にオンボーディングフラグをリセットする */
export async function resetOnboarding() {
  await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
}
