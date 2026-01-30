// constants/categories.ts
import { Category } from '../src/index';

export const DEFAULT_CATEGORIES: Category[] = [
  { 
    id: 'cat_food', 
    name: '食費', 
    color: '#DB8479',
    icon: 'fast-food' // Ionicons name
  },
  { 
    id: 'cat_transport', 
    name: '交通費', 
    color: '#6179B5',
    icon: 'train'
  },
  { 
    id: 'cat_daily', 
    name: '日用品', 
    color: '#F4DA61',
    icon: 'basket'
  },
  { 
    id: 'cat_ent', 
    name: '交際費', 
    color: '#272D2D',
    icon: 'beer'
  },
  { 
    id: 'cat_other', 
    name: 'その他', 
    color: '#A0A0A0',
    icon: 'ellipsis-horizontal-circle'
  },
];