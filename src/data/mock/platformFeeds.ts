import { picsum, avatar } from '../../lib/picsum';

/* === 微信公众号 === */
export interface WeixinAccount {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  articleCount: number;
  followAgo: string;
}

export const WEIXIN_ACCOUNTS: WeixinAccount[] = [
  { id: 'a1', name: '硅星人', handle: 'guixingren123', avatar: avatar('wx-1'), articleCount: 12, followAgo: '关注 3 个月' },
  { id: 'a2', name: '量子位', handle: 'QbitAI', avatar: avatar('wx-2'), articleCount: 28, followAgo: '关注 1 年' },
  { id: 'a3', name: '36氪', handle: '36kr', avatar: avatar('wx-3'), articleCount: 184, followAgo: '关注 2 年' },
  { id: 'a4', name: '产品壹佰', handle: 'pm100', avatar: avatar('wx-4'), articleCount: 9, followAgo: '关注 2 周' },
  { id: 'a5', name: '虎嗅', handle: 'huxiu_com', avatar: avatar('wx-5'), articleCount: 67, followAgo: '关注 6 个月' },
];

export interface WeixinArticle {
  id: string;
  accountId: string;
  accountName: string;
  accountAvatar: string;
  cover: string;
  title: string;
  excerpt: string;
  publishedAgo: string;
  reads: number;
  likes: number;
}

export const WEIXIN_ARTICLES: WeixinArticle[] = [
  {
    id: 'wx1',
    accountId: 'a1',
    accountName: '硅星人',
    accountAvatar: avatar('wx-1'),
    cover: picsum('wx-art-1', 800, 450),
    title: 'OpenAI 的 GPT-5 不会出现，但它会以一种你想不到的方式回来',
    excerpt: '过去半年所有人都在等 GPT-5，但 Sam Altman 在最近一次访谈里给出了不一样的答案：模型不再以代际划分了。这背后是 OpenAI 整个产品策略的转向——',
    publishedAgo: '2 小时前',
    reads: 32100,
    likes: 1820,
  },
  {
    id: 'wx2',
    accountId: 'a2',
    accountName: '量子位',
    accountAvatar: avatar('wx-2'),
    cover: picsum('wx-art-2', 800, 450),
    title: '清华团队发布开源大模型 GLM-5，参数仅 9B 性能逼近 GPT-4',
    excerpt: '今天凌晨，清华 KEG 实验室与智谱 AI 联合发布了 GLM-5 系列开源模型，9B 参数版本在多项基准测试中表现超出预期——',
    publishedAgo: '5 小时前',
    reads: 28400,
    likes: 1240,
  },
  {
    id: 'wx3',
    accountId: 'a3',
    accountName: '36氪',
    accountAvatar: avatar('wx-3'),
    cover: picsum('wx-art-3', 800, 450),
    title: 'AI 编程工具横评：Cursor、Copilot 与 Claude Code 谁更适合独立开发者？',
    excerpt: '实测一周后，我们发现答案并不是非此即彼。三款工具在不同场景下各有优势，本文从代码补全、上下文理解、重构能力三个维度做完整对比——',
    publishedAgo: '昨天',
    reads: 18200,
    likes: 891,
  },
  {
    id: 'wx4',
    accountId: 'a5',
    accountName: '虎嗅',
    accountAvatar: avatar('wx-5'),
    cover: picsum('wx-art-4', 800, 450),
    title: '小红书 IPO 倒计时，但它正在悄悄变成一个"什么都有"的平台',
    excerpt: '从美妆穿搭到职场分享，从二手交易到直播带货，小红书的内容边界正以惊人速度扩张。这背后是流量焦虑，还是战略转型？',
    publishedAgo: '2 天前',
    reads: 24300,
    likes: 1421,
  },
  {
    id: 'wx5',
    accountId: 'a2',
    accountName: '量子位',
    accountAvatar: avatar('wx-2'),
    cover: picsum('wx-art-5', 800, 450),
    title: 'Anthropic 估值传至千亿美金，但创始人说："我们要做的事还在十年后"',
    excerpt: '在 Claude 4.7 发布的同一周，Anthropic 的估值被传出 1000 亿美金。但 CEO Dario Amodei 在播客中给出的判断更冷静——',
    publishedAgo: '3 天前',
    reads: 41200,
    likes: 2150,
  },
  {
    id: 'wx6',
    accountId: 'a4',
    accountName: '产品壹佰',
    accountAvatar: avatar('wx-4'),
    cover: picsum('wx-art-6', 800, 450),
    title: 'B 端产品经理的"AI 焦虑"：你的工作流到底在被替代什么？',
    excerpt: '在过去一年我访谈了 32 位 B 端 PM，发现他们的 AI 焦虑高度趋同——但实际被替代的部分，远远没有想象中那么大——',
    publishedAgo: '4 天前',
    reads: 8200,
    likes: 412,
  },
];

/* === 小红书 === */
export interface XhsNote {
  id: string;
  author: string;
  authorAvatar: string;
  cover: string;
  title: string;
  excerpt: string;
  likes: number;
  saves: number;
  comments: number;
  topic: string;
  publishedAgo: string;
}

export const XHS_NOTES: XhsNote[] = [
  {
    id: 'x1', author: '风格研究所', authorAvatar: avatar('xhs-1'),
    cover: picsum('xhs-1', 600, 800),
    title: '秋日通勤穿搭｜温差 10°C 的体面解法',
    excerpt: '内搭打底 + 软挺西装 + 一条围巾，三件搞定一周',
    likes: 8821, saves: 2348, comments: 312, topic: '穿搭', publishedAgo: '2 天前',
  },
  {
    id: 'x2', author: '护肤研究所', authorAvatar: avatar('xhs-2'),
    cover: picsum('xhs-2', 600, 800),
    title: '早 C 晚 A 真不是随便涂涂的',
    excerpt: '5 个新手最容易踩的雷，附我自用 routine',
    likes: 5621, saves: 1820, comments: 247, topic: '美妆', publishedAgo: '4 天前',
  },
  {
    id: 'x3', author: '城市漫步指南', authorAvatar: avatar('xhs-3'),
    cover: picsum('xhs-3', 600, 800),
    title: '上海宝藏咖啡馆｜五家被低估的店',
    excerpt: '远离网红，回归一杯好咖啡的本质',
    likes: 4221, saves: 1230, comments: 189, topic: '生活', publishedAgo: '1 周前',
  },
  {
    id: 'x4', author: '家居本本', authorAvatar: avatar('xhs-4'),
    cover: picsum('xhs-4', 600, 800),
    title: '40㎡ 老破小改造｜花了 8 万，全家都开心',
    excerpt: '装修预算 / 户型图 / 踩坑清单全公开',
    likes: 12200, saves: 3520, comments: 421, topic: '家居', publishedAgo: '3 天前',
  },
  {
    id: 'x5', author: '小满吃什么', authorAvatar: avatar('xhs-5'),
    cover: picsum('xhs-5', 600, 800),
    title: '上海 5 家被低估的小馆子｜本地人都不一定知道',
    excerpt: '一家做了 30 年的本帮菜，一家开在弄堂里的私房菜…',
    likes: 9810, saves: 2780, comments: 318, topic: '美食', publishedAgo: '5 天前',
  },
  {
    id: 'x6', author: '阿森的健身日记', authorAvatar: avatar('xhs-6'),
    cover: picsum('xhs-6', 600, 800),
    title: '我用 3 个月练出了人生第一块腹肌',
    excerpt: '不节食 / 不挨饿 / 每周 4 次健身房',
    likes: 6321, saves: 1820, comments: 256, topic: '运动', publishedAgo: '6 天前',
  },
  {
    id: 'x7', author: '设计师 Linda', authorAvatar: avatar('xhs-7'),
    cover: picsum('xhs-7', 600, 800),
    title: '今年大火的"安静奢华"配色 8 选',
    excerpt: '从墙漆到家具，附 RGB 色卡和搭配建议',
    likes: 4120, saves: 1240, comments: 142, topic: '家居', publishedAgo: '1 周前',
  },
  {
    id: 'x8', author: '宝宝爱画画', authorAvatar: avatar('xhs-8'),
    cover: picsum('xhs-8', 600, 800),
    title: '3 岁孩子的家庭手工 9 种玩法',
    excerpt: '材料随手可得 / 时间 30 分钟内 / 安全无毒',
    likes: 3210, saves: 1280, comments: 198, topic: '亲子', publishedAgo: '2 周前',
  },
];

/* === 抖音 === */
export interface DouyinVideo {
  id: string;
  author: string;
  authorAvatar: string;
  cover: string;
  title: string;
  duration: string;
  plays: number;
  likes: number;
  comments: number;
  topic: string;
  publishedAgo: string;
}

export const DOUYIN_VIDEOS: DouyinVideo[] = [
  {
    id: 'd1', author: '老王厨房', authorAvatar: avatar('dy-1'),
    cover: picsum('dy-1', 540, 960),
    title: '红烧肉的关键不是糖色，而是这一步｜15 万人收藏',
    duration: '01:24', plays: 1820000, likes: 289100, comments: 891, topic: '美食', publishedAgo: '5 天前',
  },
  {
    id: 'd2', author: '车评 25', authorAvatar: avatar('dy-2'),
    cover: picsum('dy-2', 540, 960),
    title: '15 万预算合资 SUV｜这 3 款闭眼买不踩雷',
    duration: '03:48', plays: 920000, likes: 42100, comments: 1280, topic: '汽车', publishedAgo: '2 天前',
  },
  {
    id: 'd3', author: '健身房教练阿伟', authorAvatar: avatar('dy-3'),
    cover: picsum('dy-3', 540, 960),
    title: '3 个动作虐爆腰背肌｜居家 5 分钟搞定',
    duration: '00:58', plays: 620000, likes: 38400, comments: 720, topic: '健身', publishedAgo: '4 天前',
  },
  {
    id: 'd4', author: '人间观察日记', authorAvatar: avatar('dy-4'),
    cover: picsum('dy-4', 540, 960),
    title: '在地铁口蹲了 3 天，我看到了 100 种活法',
    duration: '04:12', plays: 1240000, likes: 89200, comments: 4210, topic: '生活', publishedAgo: '6 天前',
  },
  {
    id: 'd5', author: '财经一刻', authorAvatar: avatar('dy-5'),
    cover: picsum('dy-5', 540, 960),
    title: '为什么巴菲特说"再投 10 年也不晚"',
    duration: '02:38', plays: 480000, likes: 28100, comments: 1820, topic: '财经', publishedAgo: '1 周前',
  },
  {
    id: 'd6', author: '旅行的小王', authorAvatar: avatar('dy-6'),
    cover: picsum('dy-6', 540, 960),
    title: '云南 7 日自驾｜大理→丽江→香格里拉全程攻略',
    duration: '05:24', plays: 820000, likes: 52100, comments: 1240, topic: '旅行', publishedAgo: '3 天前',
  },
];

export function formatPlays(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000) return (n / 10_000).toFixed(1) + 'w';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}
