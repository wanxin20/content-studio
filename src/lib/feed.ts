import type { Article } from '../types';

const CONTENT_NS = 'http://purl.org/rss/1.0/modules/content/';

export async function fetchFeed(sourceId: string, limit = 30): Promise<Article[]> {
  const resp = await fetch(`/feed/${sourceId}.md?limit=${limit}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const xml = await resp.text();
  return parseAtom(xml);
}

function parseAtom(xmlText: string): Article[] {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  return Array.from(doc.querySelectorAll('entry')).map((entry) => {
    const get = (sel: string) => entry.querySelector(sel)?.textContent?.trim() ?? '';
    const linkEl = entry.querySelector('link');
    const enclosure = entry.querySelector('enclosure');
    const contentEncoded = entry.getElementsByTagNameNS(CONTENT_NS, 'encoded')[0]?.textContent ?? '';
    return {
      id: get('id'),
      title: get('title'),
      summary: get('summary'),
      author: get('author'),
      updated: get('updated'),
      link: linkEl?.getAttribute('href') ?? '',
      thumb: enclosure?.getAttribute('url') ?? '',
      content: contentEncoded,
      status: 'todo',
    };
  });
}

export function mdToHtml(md: string): string {
  if (!md) {
    return '<p style="color:#9ca3af">(暂无正文,请到 we-mp-rss 主项目点「刷新」补抓内容)</p>';
  }
  const escapeHtml = (s: string) =>
    s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]!));

  let html = md
    .replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${escapeHtml(code)}</code></pre>`)
    .replace(/!\[([^\]]*)\]\((https?:[^)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  html = html
    .split(/\n{2,}/)
    .map((p) => (p.trim().startsWith('<') ? p : `<p>${p.replace(/\n/g, '<br>')}</p>`))
    .join('');

  return html;
}
