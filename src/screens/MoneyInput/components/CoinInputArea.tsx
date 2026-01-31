// src/screens/MoneyInput/components/CoinInputArea.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CoinValue } from '../../../index';
import { CoinList } from '../components/Coin/CoinList';

interface CoinInputAreaProps {
  onAddCoin: (value: CoinValue) => void;
}

export const CoinInputArea: React.FC<CoinInputAreaProps> = ({ onAddCoin }) => {
  return (
    <View style={styles.container}>
      <CoinList onPressCoin={onAddCoin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
});