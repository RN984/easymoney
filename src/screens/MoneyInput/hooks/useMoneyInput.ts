// src/screens/MoneyInput/hooks/useMoneyInput.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { CoinValue, CreateHouseholdDTO } from '../../../index';
import { addItemToHousehold, createHousehold } from '../../../services/transactionService';
import { useSound } from './useSound';

export interface FloatingCoinData {
  id: string;
  value: CoinValue;
  x: number;
  y: number;
}

export const useMoneyInput = (initialCategoryId: string) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);
  const [isSaving, setIsSaving] = useState(false);
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoinData[]>([]);

  const currentHouseholdIdRef = useRef<string | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const transactionQueueRef = useRef<Promise<void>>(Promise.resolve());

  const { playCoinSound } = useSound();

  useEffect(() => {
    currentHouseholdIdRef.current = null;
  }, [selectedCategoryId]);

  const handlePressCoin = useCallback((value: CoinValue, x: number, y: number) => {
    playCoinSound();

    const newFloatingCoin: FloatingCoinData = {
      id: Math.random().toString(36).substr(2, 9),
      value,
      x: x - 20,
      y: y - 40,
    };
    setFloatingCoins((prev) => [...prev, newFloatingCoin]);
    setIsSaving(true);

    const now = Date.now();
    const timeDiff = now - lastTapTimeRef.current;
    
    // 3秒ルール判定
    const isContinuation = timeDiff < 3000 && currentHouseholdIdRef.current !== null;
    lastTapTimeRef.current = now;

    transactionQueueRef.current = transactionQueueRef.current
      .then(async () => {
        try {
          const entryTime = new Date();

          if (isContinuation && currentHouseholdIdRef.current) {
            // --- 既存Headerへの追記 ---
            await addItemToHousehold(currentHouseholdIdRef.current, {
              categoryId: selectedCategoryId,
              amount: value,
              createdAt: entryTime,
            });
            console.log(`[Append] Added ${value} to ${currentHouseholdIdRef.current}`);

          } else {
            // --- 新規Header作成と明細追加 ---
            const newHeaderData: CreateHouseholdDTO = {
              categoryId: selectedCategoryId,
              totalAmount: 0, 
              createdAt: entryTime,
            };
            // 名前変更: createHeader -> createHousehold
            const createdHousehold = await createHousehold(newHeaderData);
            
            currentHouseholdIdRef.current = createdHousehold.id;

            await addItemToHousehold(createdHousehold.id, {
              categoryId: selectedCategoryId,
              amount: value,
              createdAt: entryTime,
            });
            console.log(`[New] Created ${createdHousehold.id} & Added ${value}`);
          }
        } catch (error) {
          console.error('Transaction Error:', error);
          Alert.alert('エラー', '保存に失敗しました。');
          currentHouseholdIdRef.current = null;
        } finally {
          setIsSaving(false);
        }
      });
      
  }, [selectedCategoryId, playCoinSound]);

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