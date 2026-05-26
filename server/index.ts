import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

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
