import { Platform } from 'expo-modules-core';

const isIOS = Platform.OS === 'ios';

interface WidgetDataModuleType {
  setData(key: string, value: string): void;
  getData(key: string): string | null;
  removeData(key: string): void;
  reloadAllTimelines(): void;
  reloadTimeline(kind: string): void;
}

let WidgetDataModule: WidgetDataModuleType | null = null;
if (isIOS) {
  try {
    const { requireNativeModule } = require('expo-modules-core');
    WidgetDataModule = requireNativeModule('WidgetDataModule');
  } catch (e) {
    console.warn('WidgetDataModule not available:', e);
  }
}

export function setWidgetData(key: string, value: string): void {
  WidgetDataModule?.setData(key, value);
}

export function getWidgetData(key: string): string | null {
  return WidgetDataModule?.getData(key) ?? null;
}

export function removeWidgetData(key: string): void {
  WidgetDataModule?.removeData(key);
}

export function reloadAllWidgets(): void {
  WidgetDataModule?.reloadAllTimelines();
}

export function reloadWidget(kind: string): void {
  WidgetDataModule?.reloadTimeline(kind);
}
