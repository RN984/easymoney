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
import { CoinValue } from '../../../../index';

interface CoinListProps {
  // ★変更: アニメーション用に座標(x, y)も渡すようにシグネチャを変更
  onPressCoin: (value: CoinValue, x: number, y: number) => void;
}

// 金額リスト
const COINS: CoinValue[] = [10000, 5000, 1000, 500, 100, 50, 10];

// 画像のパスをマッピング
const COIN_IMAGES: Record<number, ImageSourcePropType> = {
  10000: require('../../../../../assets/images/money/10,000.webp'),
  5000:  require('../../../../../assets/images/money/5,000.webp'),
  1000:  require('../../../../../assets/images/money/1,000.webp'),
  500:   require('../../../../../assets/images/money/500.webp'),
  100:   require('../../../../../assets/images/money/100.webp'),
  50:    require('../../../../../assets/images/money/50.webp'),
  10:    require('../../../../../assets/images/money/10.webp'),
};

export const CoinList: React.FC<CoinListProps> = ({ onPressCoin }) => {
  
  // ★追加: タップイベントから座標を取得して親へ渡すハンドラ
  const handlePress = (event: GestureResponderEvent, value: CoinValue) => {
    const { pageX, pageY } = event.nativeEvent;
    onPressCoin(value, pageX, pageY);
  };

  return (
    <View style={styles.container}>
      {COINS.map((value) => {
        const imageSource = COIN_IMAGES[value];

        return (
          <TouchableOpacity
            key={value}
            style={styles.coinButton}
            // ★変更: handlePressを経由させる
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
              // 画像がない場合のフォールバックデザイン
              <View style={[styles.coinCircleFallback, getCoinStyle(value)]}>
                <Text style={styles.coinText}>{value.toLocaleString()}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// 画像がない場合のフォールバック用スタイル
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
    gap: 16,
    padding: 16,
  },
  coinButton: {
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  coinImage: {
    width: 70,
    height: 70,
  },
  coinCircleFallback: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  coinText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});