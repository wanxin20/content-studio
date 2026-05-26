import { type Platform } from './hotTopics';
import { picsum, avatar } from '../../lib/picsum';

export interface ViralPost {
  id: string;
  platform: Platform;
  cover: string;
  title: string;
  excerpt: string;
  author: string;
  authorAvatar: string;
  saves: number;
  likes: number;
  comments: number;
  tag: string;
  publishedAgo: string;
}

export const VIRAL_POSTS: ViralPost[] = [
  {
    id: 'v1',
    platform: 'xhs',
    cover: picsum('viral-fashion-1', 600, 800),
    title: '秋日通勤穿搭｜温差 10°C 的体面解法',
    excerpt: '内搭打底 + 软挺西装 + 一条围巾，三件搞定一周。',
    author: '风格研究所',
    authorAvatar: avatar('Fashion'),
    saves: 2348,
    likes: 8821,
    comments: 312,
    tag: '穿搭',
    publishedAgo: '2 天前',
  },
  {
    id: 'v2',
    platform: 'xhs',
    cover: picsum('viral-skincare-2', 600, 800),
    title: '早 C 晚 A 真不是随便涂涂的',
    excerpt: '5 个新手最容易踩的雷，附我自用 routine',
    author: '护肤研究所',
    authorAvatar: avatar('Skin'),
    saves: 1820,
    likes: 5621,
    comments: 247,
    tag: '美妆',
    publishedAgo: '4 天前',
  },
  {
    id: 'v3',
    platform: 'weixin',
    cover: picsum('viral-tech-3', 600, 400),
    title: 'AI 编程工具横评：Cursor、Copilot 与 Claude Code',
    excerpt: '实测一周后，我推荐这个组合给独立开发者',
    author: '编程的飞鸽',
    authorAvatar: avatar('Tech'),
    saves: 1240,
    likes: 3210,
    comments: 156,
    tag: '科技',
    publishedAgo: '3 天前',
  },
  {
    id: 'v4',
    platform: 'xhs',
    cover: picsum('viral-coffee-4', 600, 800),
    title: '上海宝藏咖啡馆｜五家被低估的店',
    excerpt: '远离网红，回归一杯好咖啡的本质。',
    author: '城市漫步指南',
    authorAvatar: avatar('City'),
    saves: 1230,
    likes: 4221,
    comments: 189,
    tag: '生活',
    publishedAgo: '1 周前',
  },
  {
    id: 'v5',
    platform: 'douyin',
    cover: picsum('viral-cook-5', 600, 800),
    title: '红烧肉的关键不是糖色，而是这一步',
    excerpt: '15 万人收藏的家常做法，照着做不会错',
    author: '老王厨房',
    authorAvatar: avatar('Cook'),
    saves: 5400,
    likes: 28910,
    comments: 891,
    tag: '美食',
    publishedAgo: '5 天前',
  },
  {
    id: 'v6',
    platform: 'weibo',
    cover: picsum('viral-run-6', 600, 400),
    title: '我用 3 个月跑出了人生第一个半马',
    excerpt: '完整训练计划 + 装备 + 心得分享',
    author: '跑者日记',
    authorAvatar: avatar('Run'),
    saves: 980,
    likes: 4521,
    comments: 312,
    tag: '运动',
    publishedAgo: '1 周前',
  },
];
