// src/screens/MoneyInput/components/CoinInputArea.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CoinSettings } from '../../../index';
import { CoinList } from '../components/Coin/CoinList';

interface CoinInputAreaProps {
  onAddCoin: (value: number) => void;
  onAddPress: () => void;
  coinSettings: CoinSettings;
}

export const CoinInputArea: React.FC<CoinInputAreaProps> = ({ onAddCoin, onAddPress, coinSettings }) => {
  return (
    <View style={styles.container}>
      <CoinList onPressCoin={onAddCoin} onAddPress={onAddPress} coinSettings={coinSettings} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
});