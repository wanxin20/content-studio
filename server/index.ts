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

  try {
    const resp = await anthropic.messages.create({
      model: profile.model,
      max_tokens: 8000,
      messages: [{ role: 'user', content: userMessage }],
    });

    // Concat text blocks
    const textParts: string[] = [];
    for (const block of resp.content) {
      if (block.type === 'text') textParts.push(block.text);
    }
    const rewritten = textParts.join('\n').trim();

    // Extract title from first H1 if present
    const titleMatch = rewritten.match(/^#\s+(.+)$/m);
    const rewrittenTitle = titleMatch ? titleMatch[1].trim() : `${article.title}（改写版）`;
    const body = titleMatch ? rewritten.replace(titleMatch[0], '').trim() : rewritten;

    console.log(
      `[LLM] ✓ rewrite ok: "${article.title.slice(0, 30)}…" → "${rewrittenTitle.slice(0, 30)}…" ` +
        `(in=${resp.usage?.input_tokens ?? '?'} out=${resp.usage?.output_tokens ?? '?'})`,
    );
    res.json({
      rewrittenTitle,
      rewrittenContent: body,
      raw: rewritten,
      model: profile.model,
      usage: resp.usage,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[LLM] error:', msg);
    res.status(500).json({ error: msg });
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
