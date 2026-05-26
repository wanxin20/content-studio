export interface Kpi {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
}

export const KPIS: Kpi[] = [
  { label: '本周发布', value: '12', delta: '+3', trend: 'up' },
  { label: '总曝光', value: '48.2k', delta: '+18%', trend: 'up' },
  { label: '互动数', value: '3.1k', delta: '+9%', trend: 'up' },
  { label: '草稿待发', value: '7', delta: '-2', trend: 'down' },
];

export interface DayBar {
  day: string;
  value: number;
}

export const PUBLISH_PER_DAY: DayBar[] = [
  { day: '周一', value: 2 },
  { day: '周二', value: 4 },
  { day: '周三', value: 3 },
  { day: '周四', value: 6 },
  { day: '周五', value: 5 },
  { day: '周六', value: 8 },
  { day: '周日', value: 5 },
];

export interface PlatformShare {
  platform: string;
  pct: number;
  color: string;
}

export const PLATFORM_SHARE: PlatformShare[] = [
  { platform: '小红书', pct: 46, color: '#ef4444' },
  { platform: '微信', pct: 28, color: '#10b981' },
  { platform: '抖音', pct: 18, color: '#18181b' },
  { platform: '微博', pct: 8, color: '#f59e0b' },
];

export const RECENT_OUTPUTS = [
  { id: 'd1', title: '极简通勤穿搭', platform: '小红书', impressions: 12800, interactions: 412 },
  { id: 'd2', title: 'AI 编程工具横评', platform: '微信', impressions: 6320, interactions: 184 },
  { id: 'd3', title: '咖啡馆探店清单', platform: '小红书', impressions: 9410, interactions: 312 },
  { id: 'd4', title: '红烧肉教程 20s', platform: '抖音', impressions: 14200, interactions: 891 },
];
