// src/screens/MoneyInput/hooks/useMoneyInput.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { CoinValue, CreateHouseholdDTO } from '../../../index';
import { addItemToHousehold, createHeader } from '../../../services/transactionService';
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
  const [isSaving, setIsSaving] = useState(false); // UIインジケータ用
  
  // アニメーション中のコイン一覧
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoinData[]>([]);

  // ロジック用Ref (再レンダリングを発生させずに即時値を保持)
  const currentHouseholdIdRef = useRef<string | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  
  // 非同期処理の直列化用キュー (Promise Chain)
  const transactionQueueRef = useRef<Promise<void>>(Promise.resolve());

  const { playCoinSound } = useSound();

  // カテゴリが変更されたら、次の入力は強制的に新規Headerとして扱う
  useEffect(() => {
    currentHouseholdIdRef.current = null;
  }, [selectedCategoryId]);

  const handlePressCoin = useCallback((value: CoinValue, x: number, y: number) => {
    // 1. UIフィードバック (即時実行)
    playCoinSound();

    const newFloatingCoin: FloatingCoinData = {
      id: Math.random().toString(36).substr(2, 9),
      value,
      x: x - 20,
      y: y - 40,
    };
    setFloatingCoins((prev) => [...prev, newFloatingCoin]);
    setIsSaving(true);

    // 2. ロジック判定 (タップ時点の時刻で判定)
    const now = Date.now();
    const timeDiff = now - lastTapTimeRef.current;
    
    // 3秒以内 かつ 直前のIDが存在すれば「続き」とみなす
    // ※ カテゴリ変更時は useEffect で id が null になるため、自動的に false (新規) になる
    const isContinuation = timeDiff < 3000 && currentHouseholdIdRef.current !== null;

    // 最終タップ時刻を更新
    lastTapTimeRef.current = now;

    // 3. データ保存処理 (Promise Chainで順番待ちさせる)
    transactionQueueRef.current = transactionQueueRef.current
      .then(async () => {
        try {
          const entryTime = new Date();

          if (isContinuation && currentHouseholdIdRef.current) {
            // --- ケースA: 既存Headerへの追記 ---
            await addItemToHousehold(currentHouseholdIdRef.current, {
              categoryId: selectedCategoryId,
              amount: value,
              createdAt: entryTime,
            });
            console.log(`[Append] Added ${value} to ${currentHouseholdIdRef.current}`);

          } else {
            // --- ケースB: 新規Header作成と明細追加 ---
            // まずHeaderを totalAmount: 0 で作成
            const newHeaderData: CreateHouseholdDTO = {
              categoryId: selectedCategoryId,
              totalAmount: 0, 
              createdAt: entryTime,
            };
            const createdHeader = await createHeader(newHeaderData);
            
            // IDをRefに保存 (次のタップがここを参照できるようになる)
            currentHouseholdIdRef.current = createdHeader.id;

            // 明細を追加 (Transaction内で totalAmount が加算される)
            await addItemToHousehold(createdHeader.id, {
              categoryId: selectedCategoryId,
              amount: value,
              createdAt: entryTime,
            });
            console.log(`[New] Created ${createdHeader.id} & Added ${value}`);
          }
        } catch (error) {
          console.error('Transaction Error:', error);
          Alert.alert('エラー', '保存に失敗しました。');
          // エラー時はIDをリセットし、次を新規作成にするなど安全側に倒す
          currentHouseholdIdRef.current = null;
        } finally {
          // 保存処理が一段落したらローディング表示を消す
          setIsSaving(false);
        }
      });
      
  }, [selectedCategoryId, playCoinSound]);

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