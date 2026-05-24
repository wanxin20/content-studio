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
