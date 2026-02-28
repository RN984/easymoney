import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PinchGestureHandler, PinchGestureHandlerStateChangeEvent, State } from 'react-native-gesture-handler';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { Colors } from '../../../../constants/theme';
import { Category, Household } from '../../../../index';

interface MonthlyChartProps {
  transactions: Household[];
  currentDate: Date;
  categories: Category[];
  viewMode: 'income' | 'expense' | 'all';
}

type ChartMode = 'daily' | 'category';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_HEIGHT = 200;
const CHART_PADDING = 32;
const Y_AXIS_WIDTH = 38;
const BOTTOM_AXIS_HEIGHT = 20;
const TOP_PADDING = 8;

const getNiceMaxValue = (value: number): number => {
  if (value <= 0) return 1000;
  if (value >= 50000 && value < 100000) return 100000;

  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);

  let niceFraction = 1;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;

  return niceFraction * Math.pow(10, exponent);
};

const formatYAxisValue = (value: number): string => {
  const abs = Math.abs(value);
  const prefix = value < 0 ? '-' : '';

  if (abs >= 100000000) return `${prefix}${(abs / 100000000).toFixed(1)}億`;
  if (abs >= 10000) return `${prefix}${(abs / 10000).toFixed(abs % 10000 === 0 ? 0 : 1)}万`;
  return `${prefix}${abs.toLocaleString()}`;
};

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ transactions, currentDate, categories, viewMode }) => {
  const [zoomScale, setZoomScale] = useState(1);
  const baseZoomRef = useRef(1);
  const scrollRef = useRef<ScrollView>(null);
  const scrollXRef = useRef(0);
  const [scrollX, setScrollX] = useState(0);
  const [chartContainerTop, setChartContainerTop] = useState(0);
  const [chartMode, setChartMode] = useState<ChartMode>('daily');
  const [selectedBar, setSelectedBar] = useState<{ index: number; label: string; amount: number; value: number } | null>(null);

  useEffect(() => {
    if (viewMode === 'all') {
      setChartMode('daily');
    }
    setSelectedBar(null);
  }, [viewMode]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const getTransactionType = (t: Household): 'income' | 'expense' => {
    const type = categoryById.get(t.categoryId)?.type;
    if (type === 'income') return 'income';

    // 固定収入（base salary）の擬似レコードを収入として扱う
    if ((t as any).isBaseSalary || t.id === 'base_salary' || t.categoryId === 'cat_fixed_income') {
      return 'income';
    }

    return 'expense';
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.createdAt);
      if (isNaN(d.getTime())) return false;
      if (d.getFullYear() !== year || d.getMonth() !== month) return false;

      const type = getTransactionType(t);
      if (viewMode === 'income') return type === 'income';
      if (viewMode === 'expense') return type !== 'income';
      return true;
    });
  }, [transactions, year, month, viewMode, categoryById]);

  const dailyNetValues = useMemo(() => {
    const dailyNet = new Array(daysInMonth).fill(0);

    filteredTransactions.forEach((t) => {
      const d = new Date(t.createdAt);
      const day = d.getDate() - 1;
      const type = getTransactionType(t);
      const signed = viewMode === 'all' ? (type === 'income' ? t.totalAmount : -t.totalAmount) : t.totalAmount;
      dailyNet[day] += signed;
    });

    return dailyNet;
  }, [filteredTransactions, daysInMonth, categoryById, viewMode]);

  const dailyIncomeValues = useMemo(() => {
    const values = new Array(daysInMonth).fill(0);
    filteredTransactions.forEach((t) => {
      const d = new Date(t.createdAt);
      const day = d.getDate() - 1;
      if (getTransactionType(t) === 'income') {
        values[day] += t.totalAmount;
      }
    });
    return values;
  }, [filteredTransactions, daysInMonth, categoryById]);

  const dailyExpenseValues = useMemo(() => {
    const values = new Array(daysInMonth).fill(0);
    filteredTransactions.forEach((t) => {
      const d = new Date(t.createdAt);
      const day = d.getDate() - 1;
      if (getTransactionType(t) !== 'income') {
        values[day] += t.totalAmount;
      }
    });
    return values;
  }, [filteredTransactions, daysInMonth, categoryById]);

  const dailyHasRecord = useMemo(() => {
    const flags = new Array(daysInMonth).fill(false);
    filteredTransactions.forEach((t) => {
      const d = new Date(t.createdAt);
      const day = d.getDate() - 1;
      if (day >= 0 && day < daysInMonth) {
        flags[day] = true;
      }
    });
    return flags;
  }, [filteredTransactions, daysInMonth]);

  const cumulativeNetValues = useMemo(() => {
    let running = 0;
    return dailyNetValues.map((v) => {
      running += v;
      return running;
    });
  }, [dailyNetValues]);

  const categoryValues = useMemo(() => {
    const totals = new Map<string, number>();
    filteredTransactions.forEach((t) => {
      totals.set(t.categoryId, (totals.get(t.categoryId) || 0) + t.totalAmount);
    });

    return Array.from(totals.entries())
      .map(([categoryId, amount]) => ({
        categoryId,
        amount,
        category: categoryById.get(categoryId),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categoryById]);

  const dataPoints = useMemo(() => {
    if (chartMode === 'category' && viewMode !== 'all') {
      return categoryValues.map((item, index) => ({
        index,
        value: item.amount,
        amount: item.amount,
        label: item.category?.name || '不明',
        shortLabel: (item.category?.name || '不明').slice(0, 4),
        color: item.category?.color || Colors.light.secondary,
        hasRecord: true,
      }));
    }

    return dailyNetValues.map((value, index) => {
      const hasRecord = dailyHasRecord[index];
      const cumulative = cumulativeNetValues[index];
      const displayValue = viewMode === 'all' ? cumulative : value;

      return {
        index,
        value: displayValue,
        amount: viewMode === 'all' ? displayValue : Math.abs(displayValue),
        label: `${index + 1}日`,
        shortLabel: String(index + 1),
        color: viewMode === 'all'
          ? Colors.light.primary
          : (displayValue >= 0 ? Colors.light.primary : Colors.light.accent),
        hasRecord,
      };
    });
  }, [chartMode, viewMode, categoryValues, dailyNetValues, dailyHasRecord, cumulativeNetValues]);

  const values = dataPoints.map((d) => d.value);
  const minRaw = Math.min(...values, 0);
  const maxRaw = Math.max(...values, 0);

  const maxDomain = viewMode === 'all'
    ? (maxRaw > 0 ? getNiceMaxValue(maxRaw) : 0)
    : getNiceMaxValue(maxRaw);
  const minDomain = viewMode === 'all'
    ? (minRaw < 0 ? -getNiceMaxValue(Math.abs(minRaw)) : 0)
    : 0;

  const yTickCount = viewMode === 'all' ? 6 : 5;
  const yTicks = useMemo(() => {
    return Array.from({ length: yTickCount + 1 }, (_, i) => {
      const ratio = i / yTickCount;
      return minDomain + (maxDomain - minDomain) * ratio;
    });
  }, [yTickCount, minDomain, maxDomain]);

  const chartInnerWidth = SCREEN_WIDTH - CHART_PADDING * 2;
  const chartBaseWidth = chartInnerWidth - Y_AXIS_WIDTH;
  const chartWidth = chartBaseWidth * zoomScale;
  const chartPlotHeight = CHART_HEIGHT - BOTTOM_AXIS_HEIGHT - TOP_PADDING;
  const toY = (value: number) => TOP_PADDING + ((maxDomain - value) / (maxDomain - minDomain || 1)) * chartPlotHeight;
  const zeroY = toY(0);

  const stepX = chartWidth / Math.max(dataPoints.length, 1);
  const barWidth = stepX * 0.6;
  const pointCount = dataPoints.length;
  const xLabelInterval = pointCount <= 16 ? 1 : pointCount <= 24 ? 2 : 3;

  const handlePinchStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const prev = baseZoomRef.current;
      const next = Math.min(3, Math.max(1, prev * event.nativeEvent.scale));

      const focalX = event.nativeEvent.focalX;
      const ratio = next / prev;
      const contentX = scrollXRef.current + focalX;
      const nextContentX = contentX * ratio;

      const nextContentWidth = Y_AXIS_WIDTH + chartBaseWidth * next;
      const maxScrollX = Math.max(0, nextContentWidth - chartInnerWidth);
      const nextScrollX = Math.max(0, Math.min(maxScrollX, nextContentX - focalX));

      baseZoomRef.current = next;
      setZoomScale(next);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ x: nextScrollX, animated: false });
        scrollXRef.current = nextScrollX;
      });
    }
  };

  const tooltip = useMemo(() => {
    if (!selectedBar) return null;
    const yValue = toY(selectedBar.value);
    const yTop = Math.min(yValue, zeroY);
    const x = Y_AXIS_WIDTH + selectedBar.index * stepX + (stepX - barWidth) / 2;

    const labelLines = (() => {
      if (viewMode !== 'all') {
        return [`${selectedBar.label}: ¥${selectedBar.amount.toLocaleString()}`];
      }

      const dayIndex = selectedBar.index;
      const income = dailyIncomeValues[dayIndex] || 0;
      const expense = dailyExpenseValues[dayIndex] || 0;
      const cumulative = cumulativeNetValues[dayIndex] || 0;

      const lines = [`${dayIndex + 1}日`];
      if (expense > 0) lines.push(`支出: ¥${expense.toLocaleString()}`);
      if (income > 0) lines.push(`収入: ¥${income.toLocaleString()}`);
      lines.push(`累計: ¥${cumulative.toLocaleString()}`);
      return lines;
    })();

    return {
      x: x + barWidth / 2,
      y: Math.max(16, yTop - 12),
      labelLines,
    };
  }, [selectedBar, stepX, barWidth, zeroY, viewMode, cumulativeNetValues, dailyIncomeValues, dailyExpenseValues]);

  const overlayTooltip = useMemo(() => {
    if (!tooltip) return null;
    const bubbleWidth = 148;
    const bubbleHeight = Math.max(26, tooltip.labelLines.length * 14 + 8);
    const rawLeft = tooltip.x - scrollX - bubbleWidth / 2 + 8;
    const left = Math.max(0, Math.min(chartInnerWidth - bubbleWidth, rawLeft));
    return {
      left,
      top: chartContainerTop + tooltip.y - bubbleHeight,
      labelLines: tooltip.labelLines,
      bubbleHeight,
    };
  }, [tooltip, scrollX, chartInnerWidth, chartContainerTop]);

  const totalAmount = viewMode === 'all'
    ? (cumulativeNetValues[cumulativeNetValues.length - 1] || 0)
    : filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月の支出</Text>

      <PinchGestureHandler onHandlerStateChange={handlePinchStateChange}>
        <View style={styles.chartContainer} onLayout={(e) => setChartContainerTop(e.nativeEvent.layout.y)}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              scrollXRef.current = e.nativeEvent.contentOffset.x;
              setScrollX(e.nativeEvent.contentOffset.x);
            }}
            scrollEventThrottle={16}
          >
            <Svg width={Y_AXIS_WIDTH + chartWidth} height={CHART_HEIGHT}>
              {yTicks.map((tick, idx) => {
                const y = toY(tick);
                return (
                  <React.Fragment key={idx}>
                    <Line x1={Y_AXIS_WIDTH} y1={y} x2={Y_AXIS_WIDTH + chartWidth} y2={y} stroke={Colors.light.text} strokeWidth="1" opacity={0.12} />
                    <SvgText x={Y_AXIS_WIDTH - 4} y={y + 3} fontSize="9" fill={Colors.light.text} textAnchor="end" opacity={0.75}>
                      {formatYAxisValue(tick)}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              <Line x1={Y_AXIS_WIDTH} y1={TOP_PADDING} x2={Y_AXIS_WIDTH} y2={TOP_PADDING + chartPlotHeight} stroke={Colors.light.text} strokeWidth="1" opacity={0.3} />
              <Line x1={Y_AXIS_WIDTH} y1={zeroY} x2={Y_AXIS_WIDTH + chartWidth} y2={zeroY} stroke={Colors.light.text} strokeWidth="1" opacity={0.3} />

              {dataPoints.map((point, index) => {
                const yValue = toY(point.value);
                const y = Math.min(yValue, zeroY);
                const height = Math.max(Math.abs(zeroY - yValue), 1);
                const x = Y_AXIS_WIDTH + index * stepX + (stepX - barWidth) / 2;

                const showXLabel = chartMode === 'category' && viewMode !== 'all'
                  ? true
                  : (index + 1) === 1 || (index + 1) === dataPoints.length || (index + 1) % xLabelInterval === 0;

                return (
                  <React.Fragment key={index}>
                    {(viewMode !== 'all' || point.hasRecord) && (
                      <Rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={height}
                        fill={point.color}
                        rx={2}
                        onPress={() => {
                          setSelectedBar((prev) => {
                            if (prev && prev.index === index) return null;
                            return { index, label: point.label, amount: point.amount, value: point.value };
                          });
                        }}
                      />
                    )}
                    <Line x1={x + barWidth / 2} y1={zeroY} x2={x + barWidth / 2} y2={zeroY + 4} stroke={Colors.light.text} strokeWidth="1" opacity={0.35} />

                    {showXLabel && (
                      <SvgText x={x + barWidth / 2} y={CHART_HEIGHT - 5} fontSize={chartMode === 'category' ? '9' : '10'} fill={Colors.light.text} textAnchor="middle">
                        {point.shortLabel}
                      </SvgText>
                    )}
                  </React.Fragment>
                );
              })}
            </Svg>
          </ScrollView>
        </View>
      </PinchGestureHandler>

      {overlayTooltip && (
        <View
          pointerEvents="none"
          style={[
            styles.overlayTooltip,
            { left: overlayTooltip.left, top: overlayTooltip.top, height: overlayTooltip.bubbleHeight },
          ]}
        >
          {overlayTooltip.labelLines.map((line, idx) => (
            <Text key={`${line}-${idx}`} style={styles.overlayTooltipText}>{line}</Text>
          ))}
        </View>
      )}

      <Text style={styles.zoomHint}>2本指ピンチで拡大（最大3倍）・棒タップで金額表示</Text>

      <View style={styles.footer}>
        <View style={styles.totalGroup}>
          <Text style={styles.totalLabel}>{viewMode === 'all' ? '累計収支' : '合計支出'}</Text>
          <Text
            style={[
              styles.totalValue,
              viewMode === 'all' && { color: totalAmount >= 0 ? Colors.light.primary : Colors.light.accent },
            ]}
          >
            ¥{totalAmount.toLocaleString()}
          </Text>
        </View>

        {viewMode !== 'all' && (
          <TouchableOpacity
            style={styles.modeToggleButton}
            onPress={() => {
              setSelectedBar(null);
              setChartMode((prev) => (prev === 'daily' ? 'category' : 'daily'));
            }}
          >
            <Ionicons name={chartMode === 'daily' ? 'pricetags-outline' : 'calendar-outline'} size={16} color={Colors.light.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.text,
    alignItems: 'center',
  },
  chartContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  modeToggleButton: {
    position: 'absolute',
    right: 0,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(39,45,45,0.2)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(39, 45, 45, 0.1)',
    paddingTop: 8,
    width: '100%',
    justifyContent: 'center',
  },
  totalGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.light.text,
    marginRight: 8,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  zoomHint: {
    fontSize: 11,
    color: Colors.light.gray,
    marginTop: 6,
  },
  overlayTooltip: {
    position: 'absolute',
    width: 148,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    zIndex: 999,
    elevation: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  overlayTooltipText: {
    fontSize: 10,
    color: Colors.light.text,
  },
});
