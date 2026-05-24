// E2E sanity test: fetch one article from we-mp-rss → rewrite via studio backend → save as draft.
const FEED_URL = 'http://localhost:5173/feed/MP_WXS_3223096120.md?limit=1';
const STUDIO = 'http://localhost:5173';

function getText(parent, selector) {
  const el = parent.querySelector(selector);
  return el ? el.textContent.trim() : '';
}

async function main() {
  console.log('1) Fetching feed...');
  const xml = await (await fetch(FEED_URL)).text();
  const { DOMParser } = await import('@xmldom/xmldom').catch(() => ({}));
  let doc;
  if (DOMParser) {
    doc = new DOMParser().parseFromString(xml, 'application/xml');
  } else {
    // Fallback: minimal regex extraction since xmldom isn't installed.
    const titleM = xml.match(/<entry>[\s\S]*?<title>([^<]+)<\/title>/);
    const authorM = xml.match(/<entry>[\s\S]*?<author>([^<]+)<\/author>/);
    const linkM = xml.match(/<entry>[\s\S]*?<link href="([^"]+)"/);
    const contentM = xml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/);
    const article = {
      title: titleM?.[1] || '',
      author: authorM?.[1] || '',
      link: linkM?.[1] || '',
      content: contentM?.[1]
        ?.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"') || '',
    };
    console.log('   title:', article.title);
    console.log('   author:', article.author);
    console.log('   content length:', article.content.length);

    console.log('\n2) Calling LLM rewrite...');
    const t0 = Date.now();
    const resp = await fetch(`${STUDIO}/studio/llm/rewrite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        article,
        prompt: '请把这篇文章改写成「读完只要 200 字摘要」的形式,markdown 输出,首行 # 给出新标题。',
      }),
    });
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    if (!resp.ok) {
      console.error('   FAILED:', resp.status, await resp.text());
      process.exit(1);
    }
    const result = await resp.json();
    console.log(`   ✓ rewrote in ${elapsed}s. model=${result.model}`);
    console.log('   usage:', result.usage);
    console.log('   newTitle:', result.rewrittenTitle);
    console.log('   newContent (first 300):', result.rewrittenContent.slice(0, 300));

    console.log('\n3) Saving draft...');
    const draft = await (await fetch(`${STUDIO}/studio/drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceArticleId: 'TEST-' + Date.now(),
        sourceTitle: article.title,
        sourceAuthor: article.author,
        sourceLink: article.link,
        promptUsed: 'test e2e',
        rewrittenTitle: result.rewrittenTitle,
        rewrittenContent: result.rewrittenContent,
      }),
    })).json();
    console.log('   ✓ draft saved:', draft.id);

    console.log('\n4) Listing drafts...');
    const list = await (await fetch(`${STUDIO}/studio/drafts`)).json();
    console.log(`   ✓ total drafts: ${list.length}`);

    console.log('\nDONE.');
  }
}

main().catch((e) => { console.error('ERROR:', e); process.exit(1); });
