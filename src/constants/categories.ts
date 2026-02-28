// constants/categories.ts
import { Category, CategoryType } from '../index';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_fixed_income',
    name: '固定収入',
    color: '#4CAF50',
    icon: 'cash',
    type: 'income' as CategoryType,
    showInInput: false, // MoneyInputには表示しない
    order: 0
  },
  {
    id: 'cat_extra_income',
    name: '臨時収入',
    color: '#81C784',
    icon: 'trending-up',
    type: 'income' as CategoryType,
    order: 1
  },
  { 
    id: 'cat_food', 
    name: '食費', 
    color: '#DB8479',
    icon: 'fast-food', // Ionicons name
    type: 'expense' as CategoryType,
    order: 0
  },
  { 
    id: 'cat_transport', 
    name: '交通費', 
    color: '#6179B5',
    icon: 'bus',
    type: 'expense' as CategoryType,
    order: 1
  },
  { 
    id: 'cat_daily', 
    name: '日用品', 
    color: '#F4DA61',
    icon: 'cart',
    type: 'expense' as CategoryType,
    order: 2
  },
  { 
    id: 'cat_ent', 
    name: '交際費', 
    color: '#272D2D',
    icon: 'beer',
    type: 'expense' as CategoryType,
    order: 3
  },
  { 
    id: 'cat_other', 
    name: 'その他', 
    color: '#A0A0A0',
    icon: 'ellipsis-horizontal-circle',
    type: 'expense' as CategoryType,
    order: 4
  },
];
