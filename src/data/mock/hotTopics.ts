export type Platform = 'xhs' | 'weixin' | 'douyin' | 'weibo' | 'all';

export interface HotTopic {
  id: string;
  platform: Platform;
  title: string;
  category: string;
  heat: number;
  growth: number; // %
  hours: number;
  url?: string;
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  all: '全部',
  xhs: '小红书',
  weixin: '微信',
  douyin: '抖音',
  weibo: '微博',
};

export const HOT_TOPICS: HotTopic[] = [
  { id: 'h1', platform: 'xhs', title: '秋日通勤穿搭', category: '时尚', heat: 24800, growth: 82, hours: 6 },
  { id: 'h2', platform: 'douyin', title: '杨幂新剧定档', category: '娱乐', heat: 188000, growth: 56, hours: 2 },
  { id: 'h3', platform: 'weibo', title: '城市马拉松', category: '运动', heat: 62100, growth: 31, hours: 9 },
  { id: 'h4', platform: 'xhs', title: '早 C 晚 A 实测', category: '美妆', heat: 18400, growth: 124, hours: 4 },
  { id: 'h5', platform: 'weixin', title: 'AI 编程工具盘点', category: '科技', heat: 9200, growth: 67, hours: 12 },
  { id: 'h6', platform: 'xhs', title: '深圳周末漫游', category: '生活', heat: 12000, growth: 18, hours: 18 },
  { id: 'h7', platform: 'douyin', title: '家常红烧肉教程', category: '美食', heat: 92000, growth: 41, hours: 8 },
  { id: 'h8', platform: 'weibo', title: '高考志愿填报', category: '教育', heat: 73000, growth: 22, hours: 14 },
  { id: 'h9', platform: 'weixin', title: '副业月入过万', category: '职场', heat: 6800, growth: 156, hours: 5 },
  { id: 'h10', platform: 'xhs', title: '咖啡馆探店清单', category: '生活', heat: 14500, growth: 38, hours: 10 },
];
