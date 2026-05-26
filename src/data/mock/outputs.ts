import { picsum } from '../../lib/picsum';

export type OutputKind = 'text' | 'image' | 'video' | 'avatar';
export type OutputStatus = 'draft' | 'ready' | 'published';

export interface OutputItem {
  id: string;
  kind: OutputKind;
  title: string;
  cover?: string;
  status: OutputStatus;
  platforms: string[];
  updatedAgo: string;
}

export const OUTPUT_ITEMS: OutputItem[] = [
  {
    id: 'o1',
    kind: 'text',
    title: '极简通勤穿搭 · 草稿 03',
    status: 'draft',
    platforms: ['小红书'],
    updatedAgo: '2 分钟前',
  },
  {
    id: 'o2',
    kind: 'image',
    title: '封面图组｜极简通勤系列',
    cover: picsum('out-cover-1', 600, 400),
    status: 'ready',
    platforms: ['小红书', '微信'],
    updatedAgo: '1 小时前',
  },
  {
    id: 'o3',
    kind: 'video',
    title: '20s 短片｜咖啡馆探店',
    cover: picsum('out-video-1', 600, 400),
    status: 'published',
    platforms: ['抖音'],
    updatedAgo: '昨天',
  },
  {
    id: 'o4',
    kind: 'text',
    title: 'AI 编程工具横评 · 终稿',
    status: 'published',
    platforms: ['微信'],
    updatedAgo: '2 天前',
  },
  {
    id: 'o5',
    kind: 'avatar',
    title: '数字人成片｜林若秋 · 通勤主题',
    cover: picsum('out-avatar-1', 600, 400),
    status: 'ready',
    platforms: ['抖音', '小红书'],
    updatedAgo: '3 天前',
  },
  {
    id: 'o6',
    kind: 'image',
    title: '配图 · 早 C 晚 A',
    cover: picsum('out-cover-2', 600, 400),
    status: 'draft',
    platforms: [],
    updatedAgo: '4 天前',
  },
];

export const RECENT_ACTIVITY = [
  { id: 'a1', tag: '改写', module: 'text' as const, title: '极简通勤穿搭 · 草稿 03', timeAgo: '2 分钟前' },
  { id: 'a2', tag: '采集', module: 'library' as const, title: '小红书爆款 · 穿搭话题 32 条', timeAgo: '1 小时前' },
  { id: 'a3', tag: '生图', module: 'multimodal' as const, title: '封面图组 · 4 张已就绪', timeAgo: '今天 09:14' },
  { id: 'a4', tag: '发布', module: 'manage' as const, title: 'AI 编程工具横评 → 微信草稿箱', timeAgo: '昨天' },
  { id: 'a5', tag: '灵感', module: 'library' as const, title: '"反爆款" 选题方向', timeAgo: '昨天' },
];
