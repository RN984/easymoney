import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  GestureResponderEvent,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../../../../constants/theme';
import { CoinSettings, CoinValue } from '../../../../index';

interface CoinListProps {
  onPressCoin: (value: number, x: number, y: number) => void;
  onAddPress: () => void;
  coinSettings: CoinSettings;
}

const COINS: CoinValue[] = [10000, 5000, 1000, 500, 100, 50, 10];

const COIN_IMAGES: Record<number, ImageSourcePropType> = {
  10000: require('../../../../../assets/images/money/10,000.webp'),
  5000:  require('../../../../../assets/images/money/5,000.webp'),
  1000:  require('../../../../../assets/images/money/1,000.webp'),
  500:   require('../../../../../assets/images/money/500.webp'),
  100:   require('../../../../../assets/images/money/100.webp'),
  50:    require('../../../../../assets/images/money/50.webp'),
  10:    require('../../../../../assets/images/money/10.webp'),
};

export const CoinList: React.FC<CoinListProps> = ({ onPressCoin, onAddPress, coinSettings }) => {

  const handlePress = (event: GestureResponderEvent, value: number) => {
    const { pageX, pageY } = event.nativeEvent;
    onPressCoin(value, pageX, pageY);
  };

  const handleAddPress = () => {
    if (typeof onAddPress === 'function') {
      onAddPress();
    }
  };

  const hiddenCoins = coinSettings?.hiddenCoins ?? [];
  const customCoins = coinSettings?.customCoins ?? [];
  const visibleCoins = COINS.filter((v) => !hiddenCoins.includes(v));
  const sortedCustomCoins = [...customCoins].sort((a, b) => a.order - b.order);

  return (
    <View style={styles.container}>
      {/* デフォルトコイン */}
      {visibleCoins.map((value) => {
        const imageSource = COIN_IMAGES[value];

        return (
          <TouchableOpacity
            key={value}
            style={styles.coinButton}
            onPress={(e) => handlePress(e, value)}
            activeOpacity={0.7}
          >
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.coinImage}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.coinCircleFallback, getCoinStyle(value)]}>
                <Text style={styles.coinText}>{value.toLocaleString()}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* カスタムコイン */}
      {sortedCustomCoins.map((coin) => (
        <TouchableOpacity
          key={coin.id}
          style={styles.coinButton}
          onPress={(e) => handlePress(e, coin.amount)}
          activeOpacity={0.7}
        >
          <View style={styles.customCoinWrapper}>
            <View style={[styles.customCoinCircle, { backgroundColor: coin.color }]}>
              <Text style={styles.customCoinName} numberOfLines={1}>{coin.name}</Text>
            </View>
            {coin.memo ? (
              <Text style={styles.customCoinMemo} numberOfLines={1}>{coin.memo}</Text>
            ) : null}
          </View>
        </TouchableOpacity>
      ))}

      {/* 追加ボタン（コインリスト最後尾） */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddPress}
        activeOpacity={0.7}
      >
        <View style={styles.addButtonCircle}>
          <Ionicons name="pencil" size={32} color={Colors.light.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const getCoinStyle = (value: number) => {
  if (value >= 1000) return { backgroundColor: '#E8D5B5', borderColor: '#8E7348' };
  if (value >= 100) return { backgroundColor: '#E0E0E0', borderColor: '#9E9E9E' };
  if (value >= 10) return { backgroundColor: '#CD7F32', borderColor: '#8B4513' };
  return { backgroundColor: '#F5F5F5', borderColor: '#CCCCCC' };
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    padding: 12,
  },
  coinButton: {
    margin: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  coinImage: {
    width: 63,
    height: 63,
  },
  coinCircleFallback: {
    width: 63,
    height: 63,
    borderRadius: 31.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  coinText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  customCoinWrapper: {
    alignItems: 'center',
    width: 63,
  },
  customCoinCircle: {
    width: 63,
    height: 63,
    borderRadius: 31.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customCoinName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  customCoinMemo: {
    fontSize: 9,
    color: '#999',
    marginTop: 2,
    textAlign: 'center',
  },
  addButton: {
    margin: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonCircle: {
    width: 63,
    height: 63,
    borderRadius: 31.5,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
