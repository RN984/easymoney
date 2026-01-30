import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CoinValue } from '../../../index';

interface CoinListProps {
  onPressCoin: (value: CoinValue) => void;
}

const COINS: CoinValue[] = [10000, 5000, 1000, 500, 100, 50, 10, 5, 1];

export const CoinList: React.FC<CoinListProps> = ({ onPressCoin }) => {
  return (
    <View style={styles.container}>
      {COINS.map((value) => (
        <TouchableOpacity
          key={value}
          style={styles.coinButton}
          onPress={() => onPressCoin(value)}
        >
          {/* 画像があればImageを使用。ここでは簡易的に円形Viewで表現 */}
          <View style={[styles.coinCircle, getCoinStyle(value)]}>
            <Text style={styles.coinText}>{value.toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// 金額に応じた簡易スタイリング
const getCoinStyle = (value: number) => {
  if (value >= 1000) return { backgroundColor: '#E8D5B5', borderColor: '#8E7348' }; // 紙幣風
  if (value >= 100) return { backgroundColor: '#E0E0E0', borderColor: '#9E9E9E' }; // 銀貨風
  if (value >= 10) return { backgroundColor: '#CD7F32', borderColor: '#8B4513' };  // 銅貨風
  return { backgroundColor: '#F5F5F5', borderColor: '#CCCCCC' }; // アルミ風
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
    margin: 4,
  },
  coinCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  coinText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});