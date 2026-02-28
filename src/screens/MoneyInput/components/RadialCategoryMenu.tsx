// src/screens/MoneyInput/components/RadialCategoryMenu.tsx

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { DEFAULT_CATEGORIES } from '../../../constants/categories';
import { Category, CategoryType } from '../../../index';

/**
 * Props定義
 */
interface RadialCategoryMenuProps {
  categories: Category[];
  selectedCategoryId: string | null;
  inputType: CategoryType;
  onToggleInputType: () => void;
  onSelectCategory: (categoryId: string) => void;
  radius?: number; // 外径の半径
}

// デザイン定数
const { width } = Dimensions.get('window');
const CONTAINER_SIZE = width * 0.81;
const DEFAULT_RADIUS = CONTAINER_SIZE / 2;

// ★変更点1: 穴の比率を小さくしました (0.55 -> 0.3)
const INNER_RADIUS_RATIO = 0.3; 

// Design System Colors
const COLORS = {
  // activeStroke: '#6179B5', // ← 個別の category.color を使うため削除/不使用
  inactiveFill: '#FFFFFF', // 未選択エリアの背景
  activeFill: '#F4F4F4',   // 選択中エリアの背景
  textActive: '#272D2D',   // 選択中のテキスト
  textInactive: '#999999', // 未選択のテキスト
  shadow: '#272D2D',
};

/**
 * 座標計算用の型
 */
type Point = { x: number; y: number };

const getIconNameForCategory = (category: Category): keyof typeof Ionicons.glyphMap => {
  // 1) MoneyInputで取得したiconを優先
  if (category.icon && Object.prototype.hasOwnProperty.call(Ionicons.glyphMap, category.icon)) {
    return category.icon as keyof typeof Ionicons.glyphMap;
  }

  // 2) MoneyHistoryで使っているデフォルトカテゴリ定義をfallbackに使う
  const defaultCategory = DEFAULT_CATEGORIES.find((c) => c.id === category.id);
  if (defaultCategory?.icon && Object.prototype.hasOwnProperty.call(Ionicons.glyphMap, defaultCategory.icon)) {
    return defaultCategory.icon as keyof typeof Ionicons.glyphMap;
  }

  // 3) 最終fallback
  return 'cash';
};

/**
 * 極座標から直交座標へ変換
 */
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): Point => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

/**
 * SVGの円弧パス(d属性)を生成
 */
const createSectorPath = (
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string => {
  const startOuter = polarToCartesian(x, y, outerRadius, endAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const startInner = polarToCartesian(x, y, innerRadius, endAngle);
  const endInner = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', startOuter.x, startOuter.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
    'L', endInner.x, endInner.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
    'Z',
  ].join(' ');
};

/**
 * 外周の太い円弧（インジケーター）のパスを生成
 */
const createArcStrokePath = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
};

export const RadialCategoryMenu: React.FC<RadialCategoryMenuProps> = ({
  categories,
  selectedCategoryId,
  inputType,
  onToggleInputType,
  onSelectCategory,
  radius = DEFAULT_RADIUS,
}) => {
  const innerRadius = radius * INNER_RADIUS_RATIO;
  const cx = radius; // 中心のX座標
  const cy = radius; // 中心のY座標

  // order順でソートされたカテゴリ一覧
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });
  }, [categories]);

  const angleStep = 360 / sortedCategories.length; // 1カテゴリあたりの角度

  // 描画データの生成
  const sectors = useMemo(() => {
    // カテゴリーが1つの場合は360度ではなく359.99度にする（完全な円を避ける）
    const adjustedAngleStep = sortedCategories.length === 1 ? 359.99 : angleStep;

    return sortedCategories.map((category, index) => {
      const startAngle = index * adjustedAngleStep;
      const endAngle = (index + 1) * adjustedAngleStep;

      // テキスト配置用の角度
      const midAngle = startAngle + adjustedAngleStep / 2;
      // テキスト配置位置
      const labelRadius = innerRadius + (radius - innerRadius) * 0.55;
      const labelPos = polarToCartesian(cx, cy, labelRadius, midAngle);

      const isSelected = selectedCategoryId === category.id;

      return {
        ...category,
        startAngle,
        endAngle,
        labelPos,
        isSelected,
        path: createSectorPath(cx, cy, radius, innerRadius, startAngle, endAngle),
        strokePath: createArcStrokePath(cx, cy, radius - 4, startAngle, endAngle),
      };
    });
  }, [sortedCategories, selectedCategoryId, radius, innerRadius, cx, cy, angleStep]);

  return (
    <View style={[styles.container, { width: radius * 2, height: radius * 2 }]}>
      {/* 影をつけるための背景円 */}
      <View style={[
        styles.shadowCircle, 
        { 
          width: radius * 2, 
          height: radius * 2, 
          borderRadius: radius 
        }
      ]} />

      <Svg height={radius * 2} width={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        {/* 中心円（装飾） */}
        <Circle cx={cx} cy={cy} r={innerRadius} fill="transparent" />

        {sectors.map((sector) => (
          <G
            key={sector.id}
            onPress={() => onSelectCategory(sector.id)}
          >
            {/* セクター背景 */}
            <Path
              d={sector.path}
              fill={sector.isSelected ? COLORS.activeFill : COLORS.inactiveFill}
              stroke="#EAE5C6" // 背景色と同じ色で区切り線を入れる
              strokeWidth="2"
            />

            {/* 選択時の外周インジケーター */}
            {sector.isSelected && (
              <Path
                d={sector.strokePath}
                fill="none"
                // ★変更点2: カテゴリ固有の色を使用
                stroke={sector.color} 
                strokeWidth="6"
                strokeLinecap="round"
              />
            )}
          </G>
        ))}
      </Svg>

      {/* アイコン + カテゴリ名（SVGの上にオーバーレイ表示） */}
      <View pointerEvents="none" style={styles.labelsLayer}>
        {sectors.map((sector) => (
          <View
            key={`label-${sector.id}`}
            style={[
              styles.labelItem,
              {
                left: sector.labelPos.x,
                top: sector.labelPos.y,
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: sector.color || '#ccc' }]}>
              <Ionicons
                name={getIconNameForCategory(sector)}
                size={14}
                color="#fff"
              />
            </View>
            <Text
              style={[
                styles.labelText,
                {
                  color: sector.isSelected ? COLORS.textActive : COLORS.textInactive,
                  fontWeight: sector.isSelected ? '700' : '400',
                },
              ]}
              numberOfLines={1}
            >
              {sector.name}
            </Text>
          </View>
        ))}
      </View>

      {/* 中央の装飾 */}
      <View style={[styles.centerContent, { 
        width: innerRadius * 2, 
        height: innerRadius * 2,
        left: cx - innerRadius,
        top: cy - innerRadius,
      }]}>
        <TouchableOpacity style={styles.centerButton} onPress={onToggleInputType} activeOpacity={0.8}>
          {/* 財布アイコン（上層） */}
          <Ionicons
            name="wallet-outline"
            size={40}
            color="#666"
            style={[styles.walletIcon, { transform: [{ translateX: -7 }] }]}
          />
          {/* 矢印アイコン（下層） */}
          <Ionicons
            name="arrow-down-outline"
            size={26}
            color={inputType === 'expense' ? '#E53935' : '#2196F3'}
            style={[
              styles.arrowIcon,
              {
                transform: [
                  { translateX: 20 },
                  { rotate: inputType === 'expense' ? '-90deg' : '90deg' }
                ],
              },
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  shadowCircle: {
    position: 'absolute',
    backgroundColor: '#EAE5C6',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  labelsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
  },
  labelItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -28 }, { translateY: -20 }],
    width: 56,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    marginTop: 4,
    fontSize: 11,
    textAlign: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  centerButton: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletIcon: {
    position: 'absolute',
    zIndex: 2,
  },
  arrowIcon: {
    position: 'absolute',
    zIndex: 1,
  },
});
