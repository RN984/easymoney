// src/constants/categories.ts
import { Category } from '../src/index'; // 型定義のパスに合わせて調整してください

export const DEFAULT_CATEGORIES: Category[] = [
  { 
    id: 'cat_food', 
    name: '食費', 
    color: '#DB8479' // Accent / Alert
  },
  { 
    id: 'cat_transport', 
    name: '交通費', 
    color: '#6179B5' // Primary Action
  },
  { 
    id: 'cat_daily', 
    name: '日用品', 
    color: '#F4DA61' // Secondary / Highlight
  },
  { 
    id: 'cat_ent', 
    name: '交際費', 
    color: '#272D2D' // Text / Surface (視認性のため適宜調整)
  },
  { 
    id: 'cat_other', 
    name: 'その他', 
    color: '#A0A0A0' // グレーなど
  },
];