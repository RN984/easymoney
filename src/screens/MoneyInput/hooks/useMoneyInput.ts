import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { CoinValue, CreateHouseholdDTO, CreateHouseholdItemDTO } from '../../../index';
import { addItem, createHeader } from '../../../services/transactionService';
import { useSound } from './useSound';

// アニメーション表示用データ
export interface FloatingCoinData {
  id: string;
  value: CoinValue;
  x: number;
  y: number;
}

export const useMoneyInput = (initialCategoryId: string) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);
  const [isSaving, setIsSaving] = useState(false);
  
  // アニメーション中のコイン一覧
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoinData[]>([]);

  const { playCoinSound } = useSound();
  
  // 連続タップ制御用（3秒ルールの準備: ここでは即時保存のままにしていますが、デバウンス処理の基盤になります）
  // ※ 今回の要件である「アニメーションと音」を優先しつつ、将来的な集計保存に対応可能な設計にします。
  
  const handlePressCoin = useCallback(async (value: CoinValue, x: number, y: number) => {
    // 1. UIフィードバック (音とアニメーション)
    playCoinSound();

    const newFloatingCoin: FloatingCoinData = {
      id: Math.random().toString(36).substr(2, 9),
      value,
      x: x - 20, // 指の位置より少しずらす調整
      y: y - 40,
    };
    setFloatingCoins((prev) => [...prev, newFloatingCoin]);

    // 2. データ保存処理
    // (将来的にここで setTimeout を使って3秒待ってから集計保存するロジックに変更可能)
    if (isSaving) return; // 簡易的な重複防止（本来はキューイングすべき）
    setIsSaving(true);

    try {
      const now = new Date();
      
      // Header作成
      const newHeaderData: CreateHouseholdDTO = {
        categoryId: selectedCategoryId,
        totalAmount: value,
        createdAt: now,
      };
      const createdHeader = await createHeader(newHeaderData);

      // Item作成
      const newItemData: Omit<CreateHouseholdItemDTO, 'transactionId'> = {
        categoryId: selectedCategoryId,
        amount: value,
        createdAt: now,
      };
      await addItem(createdHeader.id, newItemData);

      console.log(`Saved: ${value}`);
    } catch (error) {
      console.error(error);
      Alert.alert('エラー', '保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, selectedCategoryId, playCoinSound]);

  // アニメーション終了時のクリーンアップ
  const removeFloatingCoin = useCallback((id: string) => {
    setFloatingCoins((prev) => prev.filter((coin) => coin.id !== id));
  }, []);

  return {
    selectedCategoryId,
    setSelectedCategoryId,
    isSaving,
    floatingCoins,
    handlePressCoin,
    removeFloatingCoin,
  };
};