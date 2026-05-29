import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import { listImageProviders, generateImage, type ImageProviderId } from './imageProviders';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load .env in the project root (Node 20.6+).
// Won't throw if file is missing — falls through to model.json fallback below.
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath) && typeof (process as any).loadEnvFile === 'function') {
  try { (process as any).loadEnvFile(envPath); } catch (e) {
    console.warn(`[env] failed to load .env: ${e instanceof Error ? e.message : e}`);
  }
}

// ============== LLM CONFIG ==============
// Resolution order:
//   1. STUDIO_LLM_* env vars (from .env or shell) — preferred, production
//   2. ~/.gos-agent/model.json's active profile — local dev fallback
interface ModelProfile {
  id?: string;
  name: string;
  api_key: string;
  base_url: string;
  model: string;
  context_window_tokens?: number;
  auth_mode?: string;
}
interface ModelConfig {
  active_id: string;
  profiles: ModelProfile[];
}

function loadFromEnv(): ModelProfile | null {
  const key = process.env.STUDIO_LLM_API_KEY;
  const url = process.env.STUDIO_LLM_BASE_URL;
  const model = process.env.STUDIO_LLM_MODEL;
  if (!key || !url || !model) return null;
  return {
    name: process.env.STUDIO_LLM_NAME || model,
    api_key: key,
    base_url: url,
    model,
  };
}

function loadFromGosAgent(): ModelProfile | null {
  const home = process.env.USERPROFILE || process.env.HOME || '';
  if (!home) return null;
  const cfgPath = path.join(home, '.gos-agent', 'model.json');
  if (!fs.existsSync(cfgPath)) return null;
  try {
    const cfg: ModelConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
    const active = cfg.profiles.find((p) => p.id === cfg.active_id);
    if (!active || !active.api_key) return null;
    return active;
  } catch {
    return null;
  }
}

function loadActiveProfile(): ModelProfile {
  const fromEnv = loadFromEnv();
  if (fromEnv) {
    console.log('[LLM] config source: .env / process.env');
    return fromEnv;
  }
  const fromGos = loadFromGosAgent();
  if (fromGos) {
    console.log('[LLM] config source: ~/.gos-agent/model.json (dev fallback)');
    return fromGos;
  }
  throw new Error(
    'No LLM config found. Set STUDIO_LLM_API_KEY / STUDIO_LLM_BASE_URL / STUDIO_LLM_MODEL in .env, ' +
      'or place an active profile in ~/.gos-agent/model.json.',
  );
}

const profile = loadActiveProfile();
console.log(`[LLM] Loaded profile: ${profile.name} (${profile.model}) @ ${profile.base_url}`);

const anthropic = new Anthropic({
  apiKey: profile.api_key,
  baseURL: profile.base_url,
});

// ============== DRAFTS STORAGE ==============
interface Draft {
  id: string;
  sourceArticleId: string;
  sourceTitle: string;
  sourceAuthor: string;
  sourceLink: string;
  promptUsed: string;
  rewrittenContent: string;
  rewrittenTitle: string;
  status: 'draft' | 'published';
  createdAt: string;
  publishedAt?: string;
}

const dataDir = process.env.STUDIO_DATA_DIR || path.join(__dirname, '..', 'data');
const draftsPath = path.join(dataDir, 'drafts.json');
fs.mkdirSync(dataDir, { recursive: true });

function loadDrafts(): Draft[] {
  if (!fs.existsSync(draftsPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(draftsPath, 'utf-8'));
  } catch {
    return [];
  }
}
function saveDrafts(drafts: Draft[]) {
  fs.writeFileSync(draftsPath, JSON.stringify(drafts, null, 2), 'utf-8');
}

// ============== EXPRESS APP ==============
const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));

app.get('/studio/health', (_req, res) => {
  res.json({
    ok: true,
    llm: { name: profile.name, model: profile.model, base_url: profile.base_url },
  });
});

// ============== Sources (proxied from we-mp-rss) ==============
const WEMPRSS_BASE_URL = (process.env.WEMPRSS_BASE_URL || 'http://127.0.0.1:8001').replace(/\/$/, '');
const WEMPRSS_AK = process.env.WEMPRSS_AK || '';
const WEMPRSS_SK = process.env.WEMPRSS_SK || '';

function wempressAuthHeader(): Record<string, string> {
  return WEMPRSS_AK && WEMPRSS_SK
    ? { Authorization: `AK-SK ${WEMPRSS_AK}:${WEMPRSS_SK}` }
    : {};
}

interface CachedSources {
  ts: number;
  data: Array<{ id: string; name: string; platform: 'wechat'; cover?: string; intro?: string }>;
}
let sourcesCache: CachedSources | null = null;
const SOURCES_CACHE_TTL = 60_000; // 60s

app.get('/studio/sources', async (_req, res) => {
  // Serve from cache if fresh
  if (sourcesCache && Date.now() - sourcesCache.ts < SOURCES_CACHE_TTL) {
    return res.json({ ok: true, cached: true, sources: sourcesCache.data });
  }
  try {
    const r = await fetch(`${WEMPRSS_BASE_URL}/api/v1/wx/mps?limit=100`, {
      headers: wempressAuthHeader(),
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      return res.status(502).json({
        ok: false,
        error: `we-mp-rss returned ${r.status}: ${txt.slice(0, 200)}`,
        hint:
          r.status === 401
            ? '需要在 .env 设置 WEMPRSS_AK / WEMPRSS_SK(在 we-mp-rss 管理后台 → Access Key 页创建)'
            : undefined,
      });
    }
    const body = await r.json();
    // Standard shape: { code: 0, data: { list: [...] } }
    const list: any[] = body?.data?.list ?? body?.list ?? body?.data ?? body ?? [];
    if (!Array.isArray(list)) {
      return res.json({ ok: true, sources: [] });
    }
    const sources = list.map((mp) => ({
      id: String(mp.id ?? mp.mp_id ?? ''),
      name: String(mp.mp_name ?? mp.name ?? '未命名'),
      platform: 'wechat' as const,
      cover: mp.mp_cover ?? undefined,
      intro: mp.mp_intro ?? undefined,
    })).filter((s) => s.id);

    sourcesCache = { ts: Date.now(), data: sources };
    res.json({ ok: true, sources });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(502).json({ ok: false, error: msg });
  }
});

// ============== 小红书搜索 (proxied from TikHub app_v2) ==============
const TIKHUB_BASE_URL = (process.env.TIKHUB_BASE_URL || 'https://api.tikhub.io').replace(/\/$/, '');
const TIKHUB_API_KEY = process.env.TIKHUB_API_KEY || '';

interface XhsCacheEntry {
  ts: number;
  payload: unknown;
}
const xhsCache = new Map<string, XhsCacheEntry>();
const XHS_CACHE_TTL = 10 * 60_000; // 10 分钟:小红书搜索结果变化不快,且每次调用都要钱,缓存省额度 + 防 StrictMode 双扣

function pickImages(note: any): string[] {
  const list = note?.images_list;
  if (Array.isArray(list)) {
    return list.map((im: any) => im?.url || im?.url_size_large || '').filter(Boolean);
  }
  return [];
}

function normalizeXhsNote(item: any) {
  const note = item?.note ?? item ?? {};
  const id = String(note.id ?? item.id ?? '');
  const token = note.xsec_token ?? '';
  const images = pickImages(note);
  const idx = Number.isInteger(note?.cover_image_index) ? note.cover_image_index : 0;
  const cover = images[idx] || images[0] || '';
  return {
    id,
    title: String(note.title ?? note.display_title ?? '').trim(),
    desc: String(note.desc ?? '').trim(),
    type: note.type === 'video' ? 'video' : 'normal',
    cover,
    images,
    author: String(note.user?.nickname ?? '').trim(),
    authorAvatar: note.user?.images ?? '',
    authorId: String(note.user?.userid ?? note.user?.user_id ?? ''),
    liked: Number(note.liked_count ?? 0),
    collected: Number(note.collected_count ?? 0),
    comments: Number(note.comments_count ?? 0),
    timestamp: Number(note.timestamp ?? 0) * (String(note.timestamp ?? '').length <= 10 ? 1000 : 1),
    xsecToken: token,
    link: id ? `https://www.xiaohongshu.com/explore/${id}${token ? `?xsec_token=${token}` : ''}` : '',
  };
}

app.get('/studio/xhs/search', async (req, res) => {
  const keyword = String(req.query.keyword ?? '').trim();
  const page = String(req.query.page ?? '1');
  const sort = String(req.query.sort ?? 'general');
  const noteType = String(req.query.note_type ?? '不限');
  const searchId = String(req.query.search_id ?? '');
  const searchSessionId = String(req.query.search_session_id ?? '');
  if (!keyword) return res.status(400).json({ ok: false, error: 'keyword required' });
  if (!TIKHUB_API_KEY) {
    return res.status(500).json({ ok: false, error: '后端未配置 TIKHUB_API_KEY(在 .env 设置)' });
  }

  const cacheKey = `${keyword}|${page}|${sort}|${noteType}`;
  const hit = xhsCache.get(cacheKey);
  if (hit && Date.now() - hit.ts < XHS_CACHE_TTL) {
    return res.json({ ...(hit.payload as object), cached: true });
  }

  try {
    const url = new URL(`${TIKHUB_BASE_URL}/api/v1/xiaohongshu/app_v2/search_notes`);
    url.searchParams.set('keyword', keyword);
    url.searchParams.set('page', page);
    url.searchParams.set('sort_type', sort);
    url.searchParams.set('note_type', noteType);
    // 翻页:把首页返回的 search_id / search_session_id 透传回去
    if (searchId) url.searchParams.set('search_id', searchId);
    if (searchSessionId) url.searchParams.set('search_session_id', searchSessionId);
    const r = await fetch(url, { headers: { Authorization: `Bearer ${TIKHUB_API_KEY}` } });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const detail = (body as any)?.detail?.message_zh || (body as any)?.detail?.message || JSON.stringify(body).slice(0, 200);
      return res.status(r.status === 402 ? 402 : 502).json({
        ok: false,
        error: `TikHub ${r.status}: ${detail}`,
        hint: r.status === 402 ? 'TikHub 余额不足,需充值真实余额(免费额度不支持此接口)' : undefined,
      });
    }
    const inner = (body as any)?.data ?? {};
    const items: any[] = inner.items ?? inner.data?.items ?? [];
    const notes = items.map(normalizeXhsNote).filter((n) => n.id);
    const payload = {
      ok: true,
      notes,
      page: Number(page),
      search_id: inner.search_id ?? null,
      search_session_id: inner.search_session_id ?? null,
      next_page: inner.next_page ?? null,
    };
    xhsCache.set(cacheKey, { ts: Date.now(), payload });
    console.log(`[XHS] ✓ search "${keyword}" p${page} → ${notes.length} notes`);
    res.json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[XHS] error:', msg);
    res.status(502).json({ ok: false, error: msg });
  }
});

// ============== 小红书图文生成 ==============
// 第一步:用 LLM 按 baoyu-xhs-images 方法论生成一组图片提示词。
// 风格/布局是「单一事实源」:后端持有 key+label(给前端下拉)+desc(喂 LLM),
// 前端通过 /studio/image/providers 拉 key+label,不再各持一份。
const XHS_STYLE_DEFS = [
  { key: 'notion', label: 'Notion 知识卡', desc: '极简手绘线条、知识卡片感、理性高级，适合干货/概念' },
  { key: 'cute', label: '可爱甜美', desc: '可爱甜美、少女风、圆润字体、粉嫩配色、小贴纸装饰，经典小红书风' },
  { key: 'fresh', label: '清新自然', desc: '清新自然、留白干净、低饱和、原木/绿植元素' },
  { key: 'warm', label: '温暖治愈', desc: '温暖治愈、暖色调、柔和光感、亲切手写感' },
  { key: 'bold', label: '高冲击', desc: '高冲击、强对比、超大标题、醒目色块，适合避坑/提醒' },
  { key: 'minimal', label: '极简高级', desc: '极简高级、大量留白、克制配色、精致排版，商务感' },
  { key: 'retro', label: '复古', desc: '复古怀旧、做旧质感、经典色卡、胶片感' },
  { key: 'pop', label: '波普潮流', desc: '波普潮流、撞色、活力四射、夸张元素' },
  { key: 'chalkboard', label: '黑板教学', desc: '黑板彩色粉笔字、教学感，适合教程/课堂' },
  { key: 'study-notes', label: '手写笔记', desc: '真实手写笔记照片风、蓝笔+红批注+黄荧光笔' },
  { key: 'screen-print', label: '丝网海报', desc: '丝网印刷海报风、半调网点、有限配色、符号化叙事' },
] as const;
const XHS_LAYOUT_DEFS = [
  { key: 'balanced', label: '标准', desc: '标准内容布局(3-4 个点)' },
  { key: 'sparse', label: '极简', desc: '极简信息、最大冲击(1-2 个点)' },
  { key: 'dense', label: '密集', desc: '高信息密度、知识卡片(5-8 个点)' },
  { key: 'list', label: '清单', desc: '清单/排行(4-7 条)' },
  { key: 'comparison', label: '对比', desc: '左右对比' },
  { key: 'flow', label: '流程', desc: '流程/时间线(3-6 步)' },
  { key: 'mindmap', label: '导图', desc: '中心放射思维导图(4-8 分支)' },
  { key: 'quadrant', label: '四象限', desc: '四象限/分区' },
] as const;
const XHS_STYLES: Record<string, string> = Object.fromEntries(XHS_STYLE_DEFS.map((s) => [s.key, s.desc]));
const XHS_LAYOUTS: Record<string, string> = Object.fromEntries(XHS_LAYOUT_DEFS.map((l) => [l.key, l.desc]));

app.get('/studio/image/providers', (_req, res) => {
  res.json({
    ok: true,
    providers: listImageProviders(),
    styles: XHS_STYLE_DEFS.map(({ key, label }) => ({ key, label })),
    layouts: XHS_LAYOUT_DEFS.map(({ key, label }) => ({ key, label })),
  });
});

app.post('/studio/image/prompts', async (req, res) => {
  const { topic, style = 'notion', layout = 'balanced', count = 4, extra = '' } = req.body as {
    topic?: string; style?: string; layout?: string; count?: number; extra?: string;
  };
  if (!topic || !topic.trim()) return res.status(400).json({ ok: false, error: 'topic required' });
  const n = Math.min(10, Math.max(2, Number(count) || 4));
  const styleDesc = XHS_STYLES[style] || XHS_STYLES.notion;
  const layoutDesc = XHS_LAYOUTS[layout] || XHS_LAYOUTS.balanced;

  const sys = `你是小红书图文设计专家。根据主题，产出一组共 ${n} 张图片的「生图提示词」。
结构：第 1 张是封面(cover，强钩子、视觉冲击、sparse)，中间是内容(content)，最后 1 张是结尾(ending，行动号召/总结)。
统一视觉风格：${style} — ${styleDesc}。
信息布局倾向：${layout} — ${layoutDesc}。
要求：
- 每张提示词要详细到可直接喂给文生图模型：画面构图、主体、配色、装饰、画面内的中文文字内容(小红书图片通常带中文标题/要点)。
- 全系列风格、配色、字体保持一致。
- 提示词用中文写。
${extra ? `- 额外要求：${extra}` : ''}
只输出 JSON，不要解释。格式：
{"prompts":[{"role":"cover"|"content"|"ending","title":"该图简短标题","prompt":"详细生图提示词"}]}`;

  try {
    const resp = await anthropic.messages.create({
      model: profile.model,
      max_tokens: 4000,
      messages: [{ role: 'user', content: `${sys}\n\n主题：${topic.trim()}` }],
    });
    let text = '';
    for (const blk of resp.content) if (blk.type === 'text') text += blk.text;
    // 容错:剥离可能的 ```json 包裹
    const m = text.match(/\{[\s\S]*\}/);
    const parsed = m ? JSON.parse(m[0]) : { prompts: [] };
    const prompts = Array.isArray(parsed.prompts) ? parsed.prompts.slice(0, n) : [];
    console.log(`[IMG] ✓ prompts "${topic.trim().slice(0, 20)}" style=${style} → ${prompts.length} 条`);
    res.json({ ok: true, prompts, style, layout });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[IMG] prompts error:', msg);
    res.status(500).json({ ok: false, error: msg });
  }
});

// 第二步:按提示词调生图模型
app.post('/studio/image/generate', async (req, res) => {
  const { prompt, provider = 'dashscope', model, ar = '3:4', quality = '2k' } = req.body as {
    prompt?: string; provider?: ImageProviderId; model?: string; ar?: string; quality?: 'normal' | '2k';
  };
  if (!prompt || !prompt.trim()) return res.status(400).json({ ok: false, error: 'prompt required' });
  try {
    const out = await generateImage({ provider, prompt: prompt.trim(), model, ar, quality });
    console.log(`[IMG] ✓ generate ${provider}/${out.model} ${out.size}`);
    res.json({ ok: true, ...out });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[IMG] generate error:', msg);
    res.status(502).json({ ok: false, error: msg });
  }
});

// LLM rewrite
const DEFAULT_PROMPT = `你是一位资深公众号编辑。请把下面这篇原文改写一遍,保持核心观点和事实数据,但换一种叙述风格:语气更亲切,更适合通勤路上阅读,标题可重新拟。

要求:
1. 输出标准 Markdown
2. 第一行用 # 给出新标题
3. 不要简单的同义词替换,要重组段落、调整节奏
4. 保留所有图片(![](url) 语法不动)和外部链接
5. 篇幅与原文相近,不要大幅压缩或扩展`;

app.post('/studio/llm/rewrite', async (req, res) => {
  const { article, prompt } = req.body as {
    article: { title: string; author: string; content: string; link?: string };
    prompt?: string;
  };
  if (!article?.title || !article?.content) {
    return res.status(400).json({ error: 'article.title and article.content required' });
  }
  const systemOrUserPrompt = prompt?.trim() || DEFAULT_PROMPT;
  const userMessage =
    `${systemOrUserPrompt}\n\n---\n\n# 原文\n\n标题:${article.title}\n作者:${article.author || '未知'}\n${
      article.link ? `原文链接:${article.link}\n` : ''
    }\n${article.content}`;

  // === SSE streaming ===
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // 防 nginx 缓冲
  res.flushHeaders?.();

  const send = (obj: unknown) => {
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  let cancelled = false;
  req.on('close', () => {
    cancelled = true;
  });

  try {
    const stream = anthropic.messages.stream({
      model: profile.model,
      max_tokens: 8000,
      messages: [{ role: 'user', content: userMessage }],
    });

    let full = '';
    for await (const event of stream) {
      if (cancelled) {
        stream.controller.abort();
        return;
      }
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const t = event.delta.text;
        full += t;
        send({ type: 'delta', text: t });
      }
    }

    const finalMsg = await stream.finalMessage();
    const titleMatch = full.match(/^#\s+(.+)$/m);
    const rewrittenTitle = titleMatch ? titleMatch[1].trim() : `${article.title}（改写版）`;
    const body = titleMatch ? full.replace(titleMatch[0], '').trim() : full.trim();

    console.log(
      `[LLM] ✓ rewrite ok: "${article.title.slice(0, 30)}…" → "${rewrittenTitle.slice(0, 30)}…" ` +
        `(in=${finalMsg.usage?.input_tokens ?? '?'} out=${finalMsg.usage?.output_tokens ?? '?'}) [stream]`,
    );
    send({
      type: 'done',
      rewrittenTitle,
      rewrittenContent: body,
      raw: full,
      model: profile.model,
      usage: finalMsg.usage,
    });
    res.end();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[LLM] stream error:', msg);
    send({ type: 'error', error: msg });
    res.end();
  }
});

// Drafts CRUD
app.get('/studio/drafts', (_req, res) => {
  res.json(loadDrafts());
});

app.post('/studio/drafts', (req, res) => {
  const drafts = loadDrafts();
  console.log(`[drafts] + ${req.body.rewrittenTitle?.slice(0, 40)}…`);
  const draft: Draft = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    sourceArticleId: req.body.sourceArticleId,
    sourceTitle: req.body.sourceTitle,
    sourceAuthor: req.body.sourceAuthor || '',
    sourceLink: req.body.sourceLink || '',
    promptUsed: req.body.promptUsed || '',
    rewrittenTitle: req.body.rewrittenTitle,
    rewrittenContent: req.body.rewrittenContent,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  drafts.unshift(draft);
  saveDrafts(drafts);
  res.json(draft);
});

app.patch('/studio/drafts/:id', (req, res) => {
  const drafts = loadDrafts();
  const idx = drafts.findIndex((d) => d.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'not found' });
  drafts[idx] = { ...drafts[idx], ...req.body };
  saveDrafts(drafts);
  res.json(drafts[idx]);
});

app.delete('/studio/drafts/:id', (req, res) => {
  const drafts = loadDrafts();
  const next = drafts.filter((d) => d.id !== req.params.id);
  saveDrafts(next);
  res.json({ ok: true });
});

// Publish stub
app.post('/studio/publish/:id', (req, res) => {
  const drafts = loadDrafts();
  const idx = drafts.findIndex((d) => d.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'not found' });
  drafts[idx].status = 'published';
  drafts[idx].publishedAt = new Date().toISOString();
  saveDrafts(drafts);
  // TODO: 真正调微信公众号 API 或 CDP 把草稿发到草稿箱。
  res.json({ ok: true, note: 'publish 占位:仅本地状态切换。真发布需接入微信 API 或 CDP。', draft: drafts[idx] });
});

const PORT = Number(process.env.PORT) || 5174;
app.listen(PORT, () => {
  console.log(`[studio-server] listening on http://localhost:${PORT}`);
});
