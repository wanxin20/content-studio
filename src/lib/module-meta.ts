import {
  Home,
  BookOpen,
  PenLine,
  Sparkles,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';

export type ModuleKey = 'home' | 'library' | 'text' | 'multimodal' | 'manage';

export interface ModuleMeta {
  key: ModuleKey;
  name: string;
  path: string;
  icon: LucideIcon;
  text: string;
  bg: string;
  tint: string;
  border: string;
  ring: string;
  hex: string;
  description: string;
}

export const MODULES: Record<ModuleKey, ModuleMeta> = {
  home: {
    key: 'home',
    name: '首页',
    path: '/',
    icon: Home,
    text: 'text-zinc-900',
    bg: 'bg-zinc-900',
    tint: 'bg-zinc-100',
    border: 'border-zinc-900',
    ring: 'ring-zinc-900',
    hex: '#18181b',
    description: '今天想创作什么',
  },
  library: {
    key: 'library',
    name: '素材库',
    path: '/library',
    icon: BookOpen,
    text: 'text-blue-600',
    bg: 'bg-blue-600',
    tint: 'bg-blue-50',
    border: 'border-blue-600',
    ring: 'ring-blue-600',
    hex: '#2563eb',
    description: '数据源 · 灵感速记',
  },
  text: {
    key: 'text',
    name: '文本创作',
    path: '/text',
    icon: PenLine,
    text: 'text-orange-600',
    bg: 'bg-orange-600',
    tint: 'bg-orange-50',
    border: 'border-orange-600',
    ring: 'ring-orange-600',
    hex: '#ea580c',
    description: '热点创作 / 文本改写',
  },
  multimodal: {
    key: 'multimodal',
    name: '多模态',
    path: '/multimodal',
    icon: Sparkles,
    text: 'text-emerald-600',
    bg: 'bg-emerald-600',
    tint: 'bg-emerald-50',
    border: 'border-emerald-600',
    ring: 'ring-emerald-600',
    hex: '#059669',
    description: '图 / 视频 / 数字人',
  },
  manage: {
    key: 'manage',
    name: '管理',
    path: '/manage',
    icon: LayoutDashboard,
    text: 'text-violet-600',
    bg: 'bg-violet-600',
    tint: 'bg-violet-50',
    border: 'border-violet-600',
    ring: 'ring-violet-600',
    hex: '#7c3aed',
    description: '资产 · 生成物 · 数据',
  },
};

export const MODULE_ORDER: ModuleKey[] = ['home', 'library', 'text', 'multimodal', 'manage'];

export function moduleFromPath(pathname: string): ModuleKey {
  if (pathname.startsWith('/library')) return 'library';
  if (pathname.startsWith('/text')) return 'text';
  if (pathname.startsWith('/multimodal')) return 'multimodal';
  if (pathname.startsWith('/manage')) return 'manage';
  return 'home';
}

/* === 模块侧栏：分组导航 === */
export interface NavItem {
  label: string;
  to?: string;          // missing => SOON / disabled
  status: 'live' | 'soon';
  badge?: string | number;
  brand?: 'weixin' | 'xhs' | 'douyin' | 'weibo';
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const MODULE_NAV: Record<Exclude<ModuleKey, 'home'>, NavGroup[]> = {
  library: [
    {
      label: '热门',
      items: [
        { label: '热点榜', status: 'soon' },
      ],
    },
    {
      label: '平台数据源',
      items: [
        { label: '微信公众号', to: '/library/weixin', status: 'live', brand: 'weixin' },
        { label: '小红书', to: '/library/xhs', status: 'live', brand: 'xhs' },
        { label: '抖音', status: 'soon', brand: 'douyin' },
      ],
    },
    {
      label: '私人',
      items: [
        { label: '灵感簿', status: 'soon' },
      ],
    },
    {
      label: '工具',
      items: [
        { label: '添加来源', status: 'soon' },
      ],
    },
  ],
  text: [
    {
      label: '创作',
      items: [
        { label: '热点创作', status: 'soon' },
        { label: '文本改写', to: '/text/rewrite', status: 'live' },
      ],
    },
  ],
  multimodal: [
    {
      label: '生成',
      items: [
        { label: '图片', to: '/multimodal/image', status: 'live' },
        { label: '视频', status: 'soon' },
        { label: '数字人', status: 'soon' },
      ],
    },
    {
      label: '后期',
      items: [
        { label: '配音', status: 'soon' },
        { label: '封面工坊', status: 'soon' },
      ],
    },
  ],
  manage: [
    {
      label: '内容',
      items: [
        { label: '生成物', status: 'soon' },
        { label: '资产', status: 'soon' },
      ],
    },
    {
      label: '数据',
      items: [
        { label: '看板', status: 'soon' },
      ],
    },
    {
      label: '操作',
      items: [
        { label: '一键发布', status: 'soon' },
        { label: '操作日志', status: 'soon' },
      ],
    },
  ],
};

/** Flatten MODULE_NAV to a plain list (used by old mobile drawer / fallbacks) */
export function navItems(key: Exclude<ModuleKey, 'home'>): NavItem[] {
  return MODULE_NAV[key].flatMap((g) => g.items);
}

/* === 首页用：模块下属能力卡片 === */
export interface HomeCard {
  char: string;
  title: string;
  desc: string;
  to?: string;
  status: 'live' | 'soon';
  brand?: 'weixin' | 'xhs' | 'douyin' | 'weibo';
}

export const HOME_CARDS: Record<Exclude<ModuleKey, 'home'>, HomeCard[]> = {
  library: [
    { char: '热', title: '热点榜', desc: '实时跨平台热门话题聚合 — 含小红书 / 抖音 / 微信 / 微博', status: 'soon' },
    { char: '微', title: '微信公众号', desc: '订阅公众号文章源 — 全文采集 / 改写素材库', to: '/library/weixin', status: 'live', brand: 'weixin' },
    { char: '红', title: '小红书', desc: '关键词搜索笔记 — 封面 + 文案 + 互动数据', to: '/library/xhs', status: 'live', brand: 'xhs' },
    { char: '抖', title: '抖音', desc: '账号 / 话题视频源 — 含播放量 / 点赞数据', status: 'soon', brand: 'douyin' },
    { char: '灵', title: '灵感簿', desc: '私人选题 / 比喻 / 观点的快速记录与分类', status: 'soon' },
  ],
  text: [
    { char: '热', title: '热点创作', desc: '按热点话题 + 模板 → AI 输出第一稿', status: 'soon' },
    { char: '改', title: '文本改写', desc: '把爆款按你的风格重写 — 极简 / 幽默 / 职场 / 文艺', to: '/text/rewrite', status: 'live' },
  ],
  multimodal: [
    { char: '图', title: '图片生成', desc: '文生图 / 小红书图文 · 通义万象，模型可选', to: '/multimodal/image', status: 'live' },
    { char: '视', title: '视频生成', desc: '首尾帧 + 动作描述 → 4-20s 短片，4 种风格', status: 'soon' },
    { char: '人', title: '数字人合成', desc: '数字人形象 + 文案 + 配音 一键成片', status: 'soon' },
    { char: '音', title: '配音生成', desc: '文本转语音 · 多音色 · 可对口型', status: 'soon' },
    { char: '封', title: '封面工坊', desc: '10 种排版模板 · 文字+图自动合成', status: 'soon' },
  ],
  manage: [
    { char: '物', title: '生成物', desc: '所有 AI 产出从草稿到已发布的全生命周期管理', status: 'soon' },
    { char: '资', title: '资产库', desc: '数字人 / 音频 / 模板 — 可反复复用', status: 'soon' },
    { char: '数', title: '数据看板', desc: '发布数 / 曝光 / 互动 · KPI + 趋势图 + 平台分布', status: 'soon' },
    { char: '发', title: '一键发布', desc: '小红书 / 微信 / 抖音 · 草稿箱直送', status: 'soon' },
    { char: '日', title: '操作日志', desc: '所有 AI 调用 / 生成 / 发布的可追溯记录', status: 'soon' },
  ],
};

/** Which top-level modules have at least one live sub-feature. */
export const MODULE_LIVE: Record<Exclude<ModuleKey, 'home'>, boolean> = {
  library: true,    // 微信公众号 + 小红书
  text: true,       // 文本改写
  multimodal: true, // 小红书图文生成
  manage: false,
};
