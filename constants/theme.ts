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
  gray: '#9CA3AF',    // 追加: 汎用的なグレー
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
    gray: Palette.gray,   // 追加
    error: Palette.accent, // 追加: エラー色はAccent(赤系)を使用
  },
  dark: {
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
    gray: Palette.gray,   // 追加
    error: Palette.accent, // 追加
  },
};