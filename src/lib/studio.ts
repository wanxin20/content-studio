import type { Article, Draft } from '../types';

// ============== LLM rewrite ==============
export interface RewriteResult {
  rewrittenTitle: string;
  rewrittenContent: string;
  raw: string;
  model: string;
  usage?: { input_tokens?: number; output_tokens?: number };
}

export async function rewriteArticle(article: Article, prompt?: string): Promise<RewriteResult> {
  const resp = await fetch('/studio/llm/rewrite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      article: {
        title: article.title,
        author: article.author,
        content: article.content,
        link: article.link,
      },
      prompt: prompt || undefined,
    }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${txt}`);
  }
  return resp.json();
}

/**
 * Streaming version of rewriteArticle.
 * Backend now returns SSE chunks: { type: 'delta', text } and finally
 * { type: 'done', rewrittenTitle, rewrittenContent, raw, model, usage } or
 * { type: 'error', error }.
 * onDelta is called for every text fragment; onDone with the final summary.
 * Returns an abort function the caller can use to cancel.
 */
export interface StreamHandlers {
  onDelta: (chunk: string) => void;
  onDone: (result: RewriteResult) => void;
  onError: (err: string) => void;
}

export function streamRewriteArticle(
  article: Article,
  prompt: string | undefined,
  handlers: StreamHandlers,
): () => void {
  const ctrl = new AbortController();

  (async () => {
    try {
      const resp = await fetch('/studio/llm/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: {
            title: article.title,
            author: article.author,
            content: article.content,
            link: article.link,
          },
          prompt: prompt || undefined,
        }),
        signal: ctrl.signal,
      });
      if (!resp.ok || !resp.body) {
        const txt = await resp.text().catch(() => '');
        handlers.onError(`HTTP ${resp.status}: ${txt}`);
        return;
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE events are separated by \n\n
        let idx: number;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const raw = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          // Parse "data: {...}" lines (ignore comment lines etc.)
          for (const line of raw.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            try {
              const obj = JSON.parse(line.slice(6));
              if (obj.type === 'delta' && typeof obj.text === 'string') {
                handlers.onDelta(obj.text);
              } else if (obj.type === 'done') {
                handlers.onDone(obj as RewriteResult);
              } else if (obj.type === 'error') {
                handlers.onError(String(obj.error || 'unknown error'));
              }
            } catch {
              // ignore malformed line
            }
          }
        }
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      handlers.onError(e instanceof Error ? e.message : String(e));
    }
  })();

  return () => ctrl.abort();
}

// ============== Drafts ==============
export async function listDrafts(): Promise<Draft[]> {
  const resp = await fetch('/studio/drafts');
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function createDraft(d: Omit<Draft, 'id' | 'status' | 'createdAt'>): Promise<Draft> {
  const resp = await fetch('/studio/drafts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(d),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function updateDraft(id: string, patch: Partial<Draft>): Promise<Draft> {
  const resp = await fetch(`/studio/drafts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function deleteDraft(id: string): Promise<void> {
  const resp = await fetch(`/studio/drafts/${id}`, { method: 'DELETE' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
}

export async function publishDraft(id: string): Promise<{ ok: boolean; note?: string; draft: Draft }> {
  const resp = await fetch(`/studio/publish/${id}`, { method: 'POST' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

// ============== Health ==============
export async function studioHealth(): Promise<{ ok: boolean; llm: { name: string; model: string } } | null> {
  try {
    const resp = await fetch('/studio/health');
    if (!resp.ok) return null;
    return resp.json();
  } catch {
    return null;
  }
}

// ============== Shared fetch helpers ==============
// 统一 fetch → json → {ok:false,error,hint} 兜底,供下面的 {ok} 形态接口复用。
interface ApiResult { ok: boolean; data?: any; error?: string; hint?: string }

async function studioFetch(path: string, init?: RequestInit): Promise<ApiResult> {
  try {
    const resp = await fetch(path, init);
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) return { ok: false, error: data?.error, hint: data?.hint };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function jsonPost(body: unknown): RequestInit {
  return { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

// ============== Sources (proxied from we-mp-rss) ==============
export interface SourceInfo {
  id: string;
  name: string;
  platform: 'wechat';
  cover?: string;
  intro?: string;
}

export interface SourcesResponse {
  ok: boolean;
  sources?: SourceInfo[];
  error?: string;
  hint?: string;
  cached?: boolean;
}

export async function listSources(): Promise<SourcesResponse> {
  const r = await studioFetch('/studio/sources');
  return r.ok ? r.data : { ok: false, error: r.error, hint: r.hint };
}

// ============== 小红书搜索 (proxied from TikHub) ==============
export interface XhsNote {
  id: string;
  title: string;
  desc: string;
  type: 'normal' | 'video';
  cover: string;
  images: string[];
  author: string;
  authorAvatar: string;
  authorId: string;
  liked: number;
  collected: number;
  comments: number;
  timestamp: number;
  xsecToken: string;
  link: string;
}

export interface XhsSearchResult {
  ok: boolean;
  notes?: XhsNote[];
  page?: number;
  search_id?: string | null;
  search_session_id?: string | null;
  next_page?: number | null;
  cached?: boolean;
  error?: string;
  hint?: string;
}

export type XhsNoteType = '不限' | '视频笔记' | '普通笔记';

// 排序在前端做(见 Xhs.tsx)，接口始终取相关性页,不影响计费。
export async function searchXhsNotes(
  keyword: string,
  opts: {
    page?: number;
    noteType?: XhsNoteType;
    searchId?: string | null;
    searchSessionId?: string | null;
  } = {},
): Promise<XhsSearchResult> {
  const qs = new URLSearchParams({
    keyword,
    page: String(opts.page ?? 1),
    note_type: opts.noteType ?? '不限',
  });
  if (opts.searchId) qs.set('search_id', opts.searchId);
  if (opts.searchSessionId) qs.set('search_session_id', opts.searchSessionId);
  const r = await studioFetch(`/studio/xhs/search?${qs.toString()}`);
  return r.ok ? r.data : { ok: false, error: r.error, hint: r.hint };
}

// ============== 小红书图文生成 ==============
export interface ImageModelOption { id: string; label: string }
export interface ImageProviderInfo {
  id: string;
  name: string;
  configured: boolean;
  models: ImageModelOption[];
  defaultModel: string;
  aspectRatios: string[];
}
export interface ImagePrompt {
  role: 'cover' | 'content' | 'ending';
  title: string;
  prompt: string;
}

/** key+label option used by the 风格/布局 selectors (definitions owned by backend). */
export interface KeyLabel { key: string; label: string }

export interface ImageOptions {
  providers: ImageProviderInfo[];
  styles: KeyLabel[];
  layouts: KeyLabel[];
}

export async function listImageOptions(): Promise<ImageOptions> {
  const r = await studioFetch('/studio/image/providers');
  if (r.ok && r.data?.ok) {
    return { providers: r.data.providers ?? [], styles: r.data.styles ?? [], layouts: r.data.layouts ?? [] };
  }
  return { providers: [], styles: [], layouts: [] };
}

export async function genImagePrompts(input: {
  topic: string; style: string; layout: string; count: number; extra?: string;
}): Promise<{ ok: boolean; prompts?: ImagePrompt[]; error?: string }> {
  const r = await studioFetch('/studio/image/prompts', jsonPost(input));
  return r.ok ? r.data : { ok: false, error: r.error };
}

export async function generateImage(input: {
  prompt: string; provider?: string; model?: string; ar?: string; quality?: 'normal' | '2k';
}): Promise<{ ok: boolean; url?: string; dataUrl?: string; model?: string; size?: string; error?: string }> {
  const r = await studioFetch('/studio/image/generate', jsonPost(input));
  return r.ok ? r.data : { ok: false, error: r.error };
}
