import { avatar, picsum } from '../../lib/picsum';

export type AssetKind = 'avatar' | 'voice' | 'template';

export interface AssetItem {
  id: string;
  kind: AssetKind;
  name: string;
  cover: string;
  meta: string;
  usedCount: number;
  tags: string[];
}

export const ASSETS: AssetItem[] = [
  {
    id: 'as1',
    kind: 'avatar',
    name: '林若秋',
    cover: avatar('Lin', 200),
    meta: '女 · 知性 · 标清/高清',
    usedCount: 18,
    tags: ['通勤', '美妆'],
  },
  {
    id: 'as2',
    kind: 'avatar',
    name: '张子默',
    cover: avatar('Zhang', 200),
    meta: '男 · 沉稳 · 高清',
    usedCount: 11,
    tags: ['科技', '财经'],
  },
  {
    id: 'as3',
    kind: 'voice',
    name: '少年系 · 清亮',
    cover: picsum('voice-1', 200),
    meta: '中文男声 · 21 岁感',
    usedCount: 7,
    tags: ['短视频'],
  },
  {
    id: 'as4',
    kind: 'voice',
    name: '解说系 · 沉稳',
    cover: picsum('voice-2', 200),
    meta: '中文男声 · 35 岁感',
    usedCount: 14,
    tags: ['知识', '解说'],
  },
  {
    id: 'as5',
    kind: 'template',
    name: '小红书爆款·六段式',
    cover: picsum('tpl-1', 200),
    meta: '文本模板 · 适用穿搭/美妆',
    usedCount: 22,
    tags: ['小红书'],
  },
  {
    id: 'as6',
    kind: 'template',
    name: '微信深度文·三幕',
    cover: picsum('tpl-2', 200),
    meta: '文本模板 · 适用观点文',
    usedCount: 9,
    tags: ['微信'],
  },
];

export const ASSET_KIND_LABEL: Record<AssetKind, string> = {
  avatar: '数字人',
  voice: '音频',
  template: '模板',
};
