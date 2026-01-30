// src/screens/MoneyInput/components/RadialCategoryMenu.tsx

import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { Category } from '../../../index';

/**
 * Props定義
 */
interface RadialCategoryMenuProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  radius?: number; // 外径の半径
}

// デザイン定数
const { width } = Dimensions.get('window');
const CONTAINER_SIZE = width * 0.9;
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
  onSelectCategory,
  radius = DEFAULT_RADIUS,
}) => {
  const innerRadius = radius * INNER_RADIUS_RATIO;
  const cx = radius; // 中心のX座標
  const cy = radius; // 中心のY座標
  const angleStep = 360 / categories.length; // 1カテゴリあたりの角度

  // 描画データの生成
  const sectors = useMemo(() => {
    return categories.map((category, index) => {
      const startAngle = index * angleStep;
      const endAngle = (index + 1) * angleStep;
      
      // テキスト配置用の角度
      const midAngle = startAngle + angleStep / 2;
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
  }, [categories, selectedCategoryId, radius, innerRadius, cx, cy, angleStep]);

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

            {/* カテゴリ名 */}
            <SvgText
              x={sector.labelPos.x}
              y={sector.labelPos.y}
              fill={sector.isSelected ? COLORS.textActive : COLORS.textInactive}
              fontSize="14"
              fontWeight={sector.isSelected ? "bold" : "normal"}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {sector.name}
            </SvgText>
          </G>
        ))}
      </Svg>

      {/* 中央の装飾 */}
      <View style={[styles.centerContent, { 
        width: innerRadius * 2, 
        height: innerRadius * 2,
        left: cx - innerRadius,
        top: cy - innerRadius,
      }]}>
         {/* 必要であればここに合計金額などを表示 */}
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
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  }
});