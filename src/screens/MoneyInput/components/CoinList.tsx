import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CoinValue } from '../../../index';

interface CoinListProps {
  onPressCoin: (value: CoinValue) => void;
}

// マスタデータが未実装のため、ここで定義
const COIN_VALUES: CoinValue[] = [10000, 5000, 1000, 500, 100, 50, 10, 5, 1];

export const CoinList: React.FC<CoinListProps> = ({ onPressCoin }) => {
  return (
    <View style={styles.container}>
      {COIN_VALUES.map((value) => (
        <TouchableOpacity
          key={value}
          style={styles.coinButton}
          onPress={() => onPressCoin(value)}
          activeOpacity={0.7}
        >
          <View style={[styles.circle, getCoinColorStyle(value)]}>
            <Text style={styles.text}>{value}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// 金額に応じた簡易的な色分け
const getCoinColorStyle = (value: CoinValue) => {
  if (value >= 10000) return { backgroundColor: '#E0E0E0', borderColor: '#BDBDBD' }; // 札（諭吉）
  if (value >= 5000) return { backgroundColor: '#E8EAF6', borderColor: '#9FA8DA' };  // 札（一葉）
  if (value >= 1000) return { backgroundColor: '#E3F2FD', borderColor: '#90CAF9' };  // 札（英世）
  if (value === 500) return { backgroundColor: '#FFFDE7', borderColor: '#FFF59D' };
  if (value === 100) return { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0' };
  if (value === 50) return { backgroundColor: '#E0F2F1', borderColor: '#80CBC4' }; // 穴あき想定
  if (value === 10) return { backgroundColor: '#EFEBE9', borderColor: '#BCAAA4' }; // 銅
  if (value === 5) return { backgroundColor: '#FFF8E1', borderColor: '#FFE082' };  // 穴あき
  return { backgroundColor: '#FBE9E7', borderColor: '#FFAB91' }; // アルミ
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
  },
  coinButton: {
    width: '30%', // 3列表示
    alignItems: 'center',
    marginBottom: 8,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});