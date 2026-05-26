export interface Inspiration {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAgo: string;
}

export const INSPIRATIONS: Inspiration[] = [
  {
    id: 'i1',
    title: '把 AI 写作工具拟人化',
    body: '不要写"输入 prompt 获得回答"——写"和一个有 5 年经验的文案聊一下午"。把抽象工具变成熟人。',
    tags: ['文案', '比喻'],
    createdAgo: '今天',
  },
  {
    id: 'i2',
    title: '"反爆款" 选题方向',
    body: '所有人都在写"如何在 30 天 / 0 基础 / 月入 X 万"——做相反的：慢、深、长。下一个流量周期可能在这边。',
    tags: ['选题', '策略'],
    createdAgo: '昨天',
  },
  {
    id: 'i3',
    title: '系列封面统一感',
    body: '同一系列的小红书封面用同一种字体大小 + 同一个色调，互动率可能上升一档。',
    tags: ['视觉', '小红书'],
    createdAgo: '3 天前',
  },
  {
    id: 'i4',
    title: '数字人不要追求"看不出来"',
    body: '反而把"我是 AI"做成一个梗。坦诚比拟真更打动人。',
    tags: ['数字人', '产品'],
    createdAgo: '1 周前',
  },
];
