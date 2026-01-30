import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef } from 'react';

// ※ 音声ファイルは assets/sounds/coin.mp3 に配置されていると仮定します
// 実際のファイルパスに合わせて require の引数を変更してください
const COIN_SOUND_SOURCE = require('../../../../../assets/sounds/coin.m4a'); 

export const useSound = () => {
  const soundRef = useRef<Audio.Sound | null>(null);

  // サウンドのロード
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(COIN_SOUND_SOURCE);
        soundRef.current = sound;
      } catch (error) {
        console.warn('Failed to load sound', error);
      }
    };

    loadSound();

    return () => {
      // アンマウント時に解放
      soundRef.current?.unloadAsync();
    };
  }, []);

  const playCoinSound = useCallback(async () => {
    try {
      if (soundRef.current) {
        // 連続再生のためにリプレイ設定
        await soundRef.current.replayAsync();
      }
    } catch (error) {
      console.warn('Failed to play sound', error);
    }
  }, []);

  return { playCoinSound };
};