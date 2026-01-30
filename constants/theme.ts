// constants/theme.ts
/**
 * Design System Color Palette
 * Based on user requirements:
 * - Background (Main): #EAE5C6
 * - Text / Surface: #272D2D
 * - Primary Action: #6179B5
 * - Secondary / Highlight: #F4DA61
 * - Accent / Alert: #DB8479
 */

export const Palette = {
  background: '#EAE5C6',
  text: '#272D2D',
  primary: '#6179B5',
  secondary: '#F4DA61',
  accent: '#DB8479',
  white: '#FFFFFF',
  surface: '#FFFFFF', // カードやモーダル等の背景用
} as const;

export const Colors = {
  light: {
    text: Palette.text,
    background: Palette.background,
    tint: Palette.primary,
    icon: Palette.text,
    tabIconDefault: Palette.text,
    tabIconSelected: Palette.primary,
    // Custom semantic colors
    primary: Palette.primary,
    secondary: Palette.secondary,
    accent: Palette.accent,
    surface: Palette.surface,
  },
  dark: {
    // 今回の要件ではダークモードの具体的な指定がないため、Lightモードのトーンを維持しつつ視認性を確保する設定にするか、
    // あるいはデザインシステムが固定色の場合はLightと同じ値を割り当てることが一般的です。
    // ここでは安全のためLightと同じ配色をベースにします。
    text: Palette.text,
    background: Palette.background,
    tint: Palette.primary,
    icon: Palette.text,
    tabIconDefault: Palette.text,
    tabIconSelected: Palette.primary,
    primary: Palette.primary,
    secondary: Palette.secondary,
    accent: Palette.accent,
    surface: Palette.surface,
  },
};