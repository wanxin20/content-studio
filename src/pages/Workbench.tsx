import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Article, Draft, Source } from '../types';
import { fetchFeed, mdToHtml } from '../lib/feed';
import {
  rewriteArticle,
  listDrafts,
  createDraft,
  deleteDraft,
  publishDraft,
  studioHealth,
} from '../lib/studio';

const SOURCES: Source[] = [
  { id: 'MP_WXS_3223096120', name: '数字生命卡兹克', platform: 'wechat' },
  { id: 'MP_WXS_FEATURED_ARTICLES', name: '精选文章', platform: 'wechat' },
];

const DEFAULT_PROMPT_HINT =
  '留空使用默认改写 prompt(亲切口语化、重拟标题、保留图片和链接)。或自定义:「改写成小红书风格」「改写成读书笔记摘要」。';

type ViewKind = 'feeds' | 'drafts' | 'published' | 'settings';

function pathToView(pathname: string): { kind: ViewKind; sourceId?: string } {
  if (pathname.startsWith('/wechat/feeds')) {
    const m = pathname.match(/^\/wechat\/feeds\/(.+)$/);
    return { kind: 'feeds', sourceId: m?.[1] || SOURCES[0].id };
  }
  if (pathname.startsWith('/wechat/drafts')) return { kind: 'drafts' };
  if (pathname.startsWith('/wechat/published')) return { kind: 'published' };
  if (pathname.startsWith('/settings')) return { kind: 'settings' };
  return { kind: 'feeds', sourceId: SOURCES[0].id };
}

export default function Workbench() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const view = useMemo(() => pathToView(pathname), [pathname]);

  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [llmInfo, setLlmInfo] = useState<{ model: string; name: string } | null>(null);
  const [clock, setClock] = useState('');

  const [rewriteState, setRewriteState] = useState<
    | null
    | { article: Article; status: 'prompt' }
    | { article: Article; status: 'running'; prompt: string }
    | { article: Article; status: 'done'; prompt: string; result: { rewrittenTitle: string; rewrittenContent: string } }
    | { article: Article; status: 'error'; prompt: string; error: string }
  >(null);

  const currentSource = useMemo(
    () => (view.kind === 'feeds' ? SOURCES.find((s) => s.id === view.sourceId) || null : null),
    [view],
  );

  useEffect(() => {
    studioHealth().then((h) => h && setLlmInfo(h.llm));
    listDrafts().then(setDrafts).catch(() => {});
    const tick = () => {
      const d = new Date();
      setClock(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (view.kind !== 'feeds' || !currentSource) return;
    setSelectedIdx(null);
    setLoading(true);
    setError(null);
    fetchFeed(currentSource.id)
      .then(setArticles)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [view.kind, currentSource?.id]);

  async function refreshDrafts() {
    try {
      setDrafts(await listDrafts());
    } catch {}
  }

  async function handleRewriteStart(prompt: string) {
    if (!rewriteState || rewriteState.status !== 'prompt') return;
    const article = rewriteState.article;
    setRewriteState({ article, status: 'running', prompt });
    try {
      const result = await rewriteArticle(article, prompt);
      setRewriteState({
        article,
        status: 'done',
        prompt,
        result: { rewrittenTitle: result.rewrittenTitle, rewrittenContent: result.rewrittenContent },
      });
    } catch (e) {
      setRewriteState({
        article,
        status: 'error',
        prompt,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async function handleSaveDraft() {
    if (!rewriteState || rewriteState.status !== 'done') return;
    const r = rewriteState;
    try {
      await createDraft({
        sourceArticleId: r.article.id,
        sourceTitle: r.article.title,
        sourceAuthor: r.article.author,
        sourceLink: r.article.link,
        promptUsed: r.prompt,
        rewrittenTitle: r.result.rewrittenTitle,
        rewrittenContent: r.result.rewrittenContent,
      });
      setRewriteState(null);
      await refreshDrafts();
      navigate('/wechat/drafts');
    } catch (e) {
      alert('保存失败:' + (e instanceof Error ? e.message : String(e)));
    }
  }

  const draftCount = drafts.filter((d) => d.status === 'draft').length;
  const publishedCount = drafts.filter((d) => d.status === 'published').length;

  return (
    <div className="h-full flex flex-col bg-bg text-fg font-sans relative overflow-hidden">
      <div className="fixed inset-0 grid-bg opacity-25 pointer-events-none animate-drift z-0" aria-hidden />
      {/* subtle halos only — no particles in workbench to keep focus */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute -top-32 -right-20 w-[30rem] h-[30rem] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.06), transparent 60%)', filter: 'blur(48px)' }} />
        <div className="absolute bottom-0 -left-20 w-[28rem] h-[28rem] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(255,184,0,0.05), transparent 60%)', filter: 'blur(56px)' }} />
      </div>
      <TopBar llmInfo={llmInfo} clock={clock} />
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar
          sources={SOURCES}
          view={view}
          draftCount={draftCount}
          publishedCount={publishedCount}
        />
        <main className="flex-1 flex flex-col overflow-hidden bg-bg">
          {view.kind === 'feeds' && currentSource && (
            <FeedsView
              source={currentSource}
              articles={articles}
              selectedIdx={selectedIdx}
              loading={loading}
              error={error}
              onSelect={setSelectedIdx}
              onRefresh={() => {
                setLoading(true);
                fetchFeed(currentSource.id)
                  .then(setArticles)
                  .catch((e) => setError(e instanceof Error ? e.message : String(e)))
                  .finally(() => setLoading(false));
              }}
              onRewrite={(art) => setRewriteState({ article: art, status: 'prompt' })}
            />
          )}
          {view.kind === 'drafts' && (
            <DraftsView
              drafts={drafts.filter((d) => d.status === 'draft')}
              title="改写中"
              code="DRAFTS"
              onRefresh={refreshDrafts}
              onPublish={async (id) => {
                const r = await publishDraft(id);
                await refreshDrafts();
                alert(r.note || '已切换为已发布');
              }}
              onDelete={async (id) => {
                if (!confirm('删除这份草稿?')) return;
                await deleteDraft(id);
                await refreshDrafts();
              }}
            />
          )}
          {view.kind === 'published' && (
            <DraftsView
              drafts={drafts.filter((d) => d.status === 'published')}
              title="已发布"
              code="PUBLISHED"
              onRefresh={refreshDrafts}
              onDelete={async (id) => {
                if (!confirm('删除这份记录?')) return;
                await deleteDraft(id);
                await refreshDrafts();
              }}
            />
          )}
          {view.kind === 'settings' && <SettingsView llmInfo={llmInfo} />}
        </main>
      </div>

      {rewriteState && (
        <RewriteFlowModal
          state={rewriteState}
          onClose={() => setRewriteState(null)}
          onStart={handleRewriteStart}
          onSave={handleSaveDraft}
          onRetry={() => {
            if (rewriteState.status === 'done' || rewriteState.status === 'error') {
              setRewriteState({ article: rewriteState.article, status: 'prompt' });
            }
          }}
        />
      )}
    </div>
  );
}

// ============== TopBar ==============
function TopBar({ llmInfo, clock }: { llmInfo: { model: string; name: string } | null; clock: string }) {
  return (
    <div className="h-14 bg-bg/95 backdrop-blur-md border-b border-edge flex items-center px-6 gap-4 flex-shrink-0 relative z-20">
      <Link to="/" className="flex items-baseline gap-2 group">
        <span className="font-mono text-fg-faint group-hover:text-cyan transition-colors text-sm">&lt;</span>
        <span className="font-sans font-bold text-base tracking-tightish text-fg group-hover:glow-cyan transition-all">
          STUDIO
        </span>
        <span className="font-mono text-fg-faint group-hover:text-cyan transition-colors text-sm">/&gt;</span>
      </Link>
      <span className="font-mono text-[10px] uppercase tracking-widest2 text-fg-faint hidden md:inline">
        / WORKBENCH
      </span>
      <div className="ml-auto flex items-center gap-5 text-[10px] font-mono uppercase tracking-widest2">
        <div className="text-fg-faint">
          DATA<span className="text-fg-dim mx-1">·</span><span className="text-fg">:8001</span>
        </div>
        <div className="text-fg-faint">
          LLM<span className="text-fg-dim mx-1">·</span><span className="text-fg">{llmInfo?.model || '—'}</span>
        </div>
        <div className="flex items-center gap-2 pl-4 border-l border-edge">
          <span className="status-dot amber" />
          <span className="tabular text-amber">{clock}</span>
        </div>
      </div>
    </div>
  );
}

// ============== Sidebar ==============
interface SidebarProps {
  sources: Source[];
  view: { kind: ViewKind; sourceId?: string };
  draftCount: number;
  publishedCount: number;
}
function Sidebar({ sources, view, draftCount, publishedCount }: SidebarProps) {
  const wechatSources = sources.filter((s) => s.platform === 'wechat');
  return (
    <aside className="w-64 bg-bg-panel/60 backdrop-blur-sm border-r border-edge flex flex-col overflow-y-auto flex-shrink-0">
      <SectionTitle>SOURCES</SectionTitle>
      <NavGroupLabel icon="◉" label="微信公众号" active={view.kind === 'feeds'} accentClass="text-cyan" />
      <div className="pl-9 text-sm pb-3">
        {wechatSources.map((s) => (
          <Link
            key={s.id}
            to={`/wechat/feeds/${s.id}`}
            className={`block px-2 py-1.5 font-zh transition-colors text-sm ${
              view.sourceId === s.id
                ? 'text-cyan glow-cyan font-medium border-l border-cyan -ml-px pl-2.5'
                : 'text-fg-muted hover:text-fg'
            }`}
          >
            <span className="font-mono text-fg-dim mr-2">·</span>{s.name}
          </Link>
        ))}
      </div>
      <DisabledItem icon="◐" label="小红书" accentColor="#FF1F8A" />
      <DisabledItem icon="◑" label="抖音" accentColor="#9FFF1F" />

      <SectionTitle>WORK</SectionTitle>
      <NavLink to="/wechat/drafts" icon="✎" label="改写中" code="DRAFTS" count={draftCount} active={view.kind === 'drafts'} />
      <NavLink to="/wechat/published" icon="↗" label="已发布" code="PUB" count={publishedCount} active={view.kind === 'published'} />
      <NavLink to="/settings" icon="⚙" label="设置" code="CFG" active={view.kind === 'settings'} />

      <div className="mt-auto px-6 py-4 text-[10px] text-fg-dim border-t border-edge font-mono uppercase tracking-widest2">
        <div className="mb-1">v0.3 · MVP</div>
        <div>WS → WS · 1:1</div>
      </div>
    </aside>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-widest2 text-fg-faint px-6 pt-6 pb-3 font-mono flex items-center gap-2">
      <span>/</span>
      <span>{children}</span>
      <span className="flex-1 h-px bg-edge/50 ml-1" />
    </div>
  );
}

function NavGroupLabel({ icon, label, active, accentClass }: { icon: string; label: string; active: boolean; accentClass: string }) {
  return (
    <div className={`flex items-center px-6 py-2 gap-3 text-sm ${active ? `${accentClass} font-medium` : 'text-fg'}`}>
      <span className="w-4 text-center font-mono">{icon}</span>
      <span className="font-zh">{label}</span>
    </div>
  );
}

function DisabledItem({ icon, label, accentColor }: { icon: string; label: string; accentColor: string }) {
  return (
    <div className="flex items-center px-6 py-2 gap-3 text-sm text-fg-dim cursor-not-allowed">
      <span className="w-4 text-center font-mono opacity-40" style={{ color: accentColor }}>{icon}</span>
      <span className="font-zh">{label}</span>
      <span className="ml-auto font-mono text-[9px] uppercase tracking-widest2 text-fg-dim">SOON</span>
    </div>
  );
}

function NavLink({
  to, icon, label, code, count, active,
}: { to: string; icon: string; label: string; code: string; count?: number; active?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center px-6 py-2 gap-3 text-sm transition-colors group ${
        active
          ? 'text-cyan glow-cyan font-medium border-r border-cyan'
          : 'text-fg hover:text-cyan'
      }`}
    >
      <span className="w-4 text-center font-mono">{icon}</span>
      <span className="font-zh">{label}</span>
      <span className="ml-auto font-mono text-[9px] uppercase tracking-widest2 text-fg-faint group-hover:text-cyan">
        {code}
      </span>
      {count !== undefined && (
        <span
          className={`px-1.5 py-0.5 text-[10px] font-mono tabular border ${
            active ? 'border-cyan text-cyan' : 'border-edge text-fg-muted'
          }`}
        >
          {String(count).padStart(2, '0')}
        </span>
      )}
    </Link>
  );
}

// ============== Toolbar ==============
function Toolbar({ title, code, crumb, children }: { title: string; code: string; crumb: string; children?: React.ReactNode }) {
  return (
    <div className="bg-bg-panel/60 backdrop-blur-sm border-b border-edge flex items-center px-6 gap-3 flex-shrink-0 py-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-cyan glow-cyan">[{code}]</span>
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-fg-faint">{crumb}</span>
        </div>
        <div className="font-zh text-2xl text-fg font-bold tracking-tightish">{title}</div>
      </div>
      <div className="ml-auto flex gap-2">{children}</div>
    </div>
  );
}

// ============== FeedsView ==============
interface FeedsViewProps {
  source: Source;
  articles: Article[];
  selectedIdx: number | null;
  loading: boolean;
  error: string | null;
  onSelect: (idx: number) => void;
  onRefresh: () => void;
  onRewrite: (article: Article) => void;
}
function FeedsView({ source, articles, selectedIdx, loading, error, onSelect, onRefresh, onRewrite }: FeedsViewProps) {
  const selected = selectedIdx !== null ? articles[selectedIdx] : null;
  return (
    <>
      <Toolbar title={source.name} code="SOURCE" crumb={`SOURCES / WEIXIN / ${source.name}`}>
        <Btn variant="ghost" onClick={onRefresh}>↻ REFRESH</Btn>
      </Toolbar>
      <div className="flex-1 flex overflow-hidden">
        <ArticleList
          articles={articles}
          selectedIdx={selectedIdx}
          loading={loading}
          error={error}
          onSelect={onSelect}
        />
        <ArticlePreview article={selected} onRewrite={onRewrite} />
      </div>
    </>
  );
}

// ============== ArticleList ==============
interface ArticleListProps {
  articles: Article[];
  selectedIdx: number | null;
  loading: boolean;
  error: string | null;
  onSelect: (idx: number) => void;
}
function ArticleList({ articles, selectedIdx, loading, error, onSelect }: ArticleListProps) {
  return (
    <div className="w-2/5 min-w-[300px] bg-bg-panel/40 border-r border-edge overflow-y-auto">
      {loading && <div className="p-8 text-center text-sm text-fg-faint font-mono uppercase tracking-widest2">LOADING…</div>}
      {error && (
        <div className="p-4 bg-rose/10 text-rose border-b border-rose/30 text-sm font-mono">
          ERROR · {error}
        </div>
      )}
      {!loading && !error && articles.length === 0 && (
        <div className="p-8 text-center text-sm text-fg-faint font-zh">
          这个公众号还没有文章。
        </div>
      )}
      {articles.map((a, i) => {
        const date = a.updated
          ? new Date(a.updated).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
          : '';
        return (
          <div
            key={a.id || i}
            onClick={() => onSelect(i)}
            className={`px-6 py-4 border-b border-edge/50 cursor-pointer transition-colors ${
              selectedIdx === i
                ? 'bg-cobalt-soft border-l-2 border-l-cyan pl-[22px]'
                : 'hover:bg-bg-elev'
            }`}
          >
            <div className="font-zh font-medium text-[15px] text-fg leading-snug mb-2 line-clamp-2">
              {a.title}
            </div>
            <div className="flex gap-3 items-center text-xs text-fg-faint font-mono">
              <span className="tabular">{date}</span>
              <StatusPill status={a.status} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusPill({ status }: { status: Article['status'] }) {
  const styles = {
    todo: 'text-amber border-amber/40',
    done: 'text-fg-muted border-edge-bright',
    published: 'text-cyan border-cyan/40',
  };
  const labels = { todo: '待改', done: '已改', published: '已发' };
  return (
    <span className={`px-1.5 py-px text-[10px] uppercase tracking-wider font-mono border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// ============== ArticlePreview ==============
interface ArticlePreviewProps {
  article: Article | null;
  onRewrite: (article: Article) => void;
}
function ArticlePreview({ article, onRewrite }: ArticlePreviewProps) {
  if (!article) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-fg-faint gap-4 bg-bg">
        <div className="font-mono text-7xl text-edge-bright opacity-50">▢</div>
        <div className="font-mono text-xs uppercase tracking-widest2">NO ARTICLE SELECTED</div>
      </div>
    );
  }
  const date = article.updated ? new Date(article.updated).toLocaleString('zh-CN') : '';
  return (
    <div className="flex-1 bg-bg overflow-y-auto">
      <div className="bg-bg-panel/50 backdrop-blur-sm px-10 py-7 border-b border-edge sticky top-0 z-10">
        <h1 className="font-zh font-bold text-3xl text-fg mb-3 leading-tight tracking-tightish">
          {article.title}
        </h1>
        <div className="text-xs text-fg-faint flex gap-3 items-center flex-wrap font-mono uppercase tracking-wider">
          <span className="text-fg-muted">@</span><span className="text-fg">{article.author}</span>
          <span className="text-fg-dim">·</span>
          <span className="tabular">{date}</span>
          {article.link && (
            <>
              <span className="text-fg-dim">·</span>
              <a href={article.link} target="_blank" rel="noreferrer" className="text-cyan hover:glow-cyan">
                SOURCE ↗
              </a>
            </>
          )}
        </div>
        <div className="mt-5 flex gap-2">
          <Btn variant="primary" onClick={() => onRewrite(article)}>✨ AI 改写</Btn>
          <Btn variant="ghost" onClick={() => alert('收藏功能:TODO')}>★ 收藏</Btn>
        </div>
      </div>
      <div
        className="px-10 py-8 pb-20 max-w-3xl text-fg-muted preview-body"
        dangerouslySetInnerHTML={{ __html: mdToHtml(article.content) }}
      />
    </div>
  );
}

// ============== Btn ==============
function Btn({
  children, variant = 'secondary', onClick, disabled,
}: { children: React.ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; onClick?: () => void; disabled?: boolean }) {
  const styles = {
    primary: 'bg-cyan text-bg hover:bg-cyan-dim hover:shadow-glowCyan border border-cyan disabled:opacity-50',
    secondary: 'bg-bg-elev text-fg hover:bg-bg-hi disabled:opacity-50 border border-edge',
    ghost: 'bg-transparent text-fg-muted hover:text-cyan hover:bg-bg-elev disabled:opacity-50 border border-edge',
    danger: 'bg-rose/15 text-rose hover:bg-rose/25 disabled:opacity-50 border border-rose/30',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-medium transition-all inline-flex items-center gap-1.5 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

// ============== RewriteFlowModal ==============
interface RewriteFlowModalProps {
  state: any;
  onClose: () => void;
  onStart: (prompt: string) => void;
  onSave: () => void;
  onRetry: () => void;
}
function RewriteFlowModal({ state, onClose, onStart, onSave, onRetry }: RewriteFlowModalProps) {
  const [customPrompt, setCustomPrompt] = useState('');

  if (state.status === 'prompt') {
    return (
      <ModalShell onClose={onClose} title={`改写 :: ${truncate(state.article.title, 40)}`} code="REWRITE" wide>
        <div className="text-sm text-fg-muted mb-3 leading-relaxed font-zh">
          {DEFAULT_PROMPT_HINT}
        </div>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          rows={8}
          placeholder="// custom prompt (leave empty for default)"
          className="w-full border border-edge bg-bg text-fg p-3 text-sm font-mono focus:outline-none focus:border-cyan focus:shadow-glowCyan transition-all"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>CANCEL</Btn>
          <Btn variant="primary" onClick={() => onStart(customPrompt)}>✨ EXECUTE</Btn>
        </div>
      </ModalShell>
    );
  }
  if (state.status === 'running') {
    return (
      <ModalShell onClose={onClose} title="改写中…" code="EXECUTING" wide>
        <div className="py-12 text-center">
          <div className="font-mono text-6xl text-cyan mb-4 glow-cyan animate-pulse">⁂</div>
          <div className="font-zh text-fg-muted">正在调用 LLM,根据文章长度大约 10–60 秒…</div>
          <div className="text-xs text-fg-faint mt-3 font-mono uppercase tracking-widest2">DO_NOT_CLOSE</div>
        </div>
      </ModalShell>
    );
  }
  if (state.status === 'error') {
    return (
      <ModalShell onClose={onClose} title="改写失败" code="ERROR" wide>
        <div className="bg-rose/10 border border-rose/30 p-3 text-sm text-rose mb-3 font-mono">
          {state.error}
        </div>
        <div className="text-xs text-fg-faint mb-4 font-zh">
          常见原因:LLM API key 失效、网络问题、原文过长超出 max_tokens。
        </div>
        <div className="flex justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>CLOSE</Btn>
          <Btn variant="primary" onClick={onRetry}>RETRY</Btn>
        </div>
      </ModalShell>
    );
  }
  return (
    <ModalShell onClose={onClose} title="改写完成 · 预览" code="REVIEW" wide tall>
      <div className="text-xs text-fg-faint mb-2 font-mono uppercase tracking-wider">SOURCE · {state.article.title}</div>
      <h2 className="font-zh font-bold text-2xl text-fg mb-4 tracking-tightish">
        {state.result.rewrittenTitle}
      </h2>
      <div
        className="flex-1 overflow-y-auto bg-bg border border-edge p-5 preview-body text-sm"
        dangerouslySetInnerHTML={{ __html: mdToHtml(state.result.rewrittenContent) }}
      />
      <div className="mt-4 flex justify-end gap-2">
        <Btn variant="ghost" onClick={onClose}>DISCARD</Btn>
        <Btn variant="secondary" onClick={onRetry}>↻ RETRY</Btn>
        <Btn variant="primary" onClick={onSave}>💾 SAVE AS DRAFT</Btn>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  children, onClose, title, code, wide, tall,
}: { children: React.ReactNode; onClose: () => void; title: string; code: string; wide?: boolean; tall?: boolean }) {
  return (
    <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className={`relative bg-bg-panel border border-edge ${wide ? 'max-w-3xl' : 'max-w-md'} w-[92%] ${tall ? 'max-h-[85vh]' : ''} flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 grid-bg-fine opacity-30 pointer-events-none" />
        <div className="relative px-6 py-4 border-b border-edge flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="status-dot" />
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-cyan">[{code}]</span>
            <span className="font-zh text-sm text-fg">{title}</span>
          </div>
          <button onClick={onClose} className="text-fg-faint hover:text-cyan text-2xl leading-none">×</button>
        </div>
        <div className="relative p-6 flex flex-col flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

// ============== DraftsView ==============
interface DraftsViewProps {
  drafts: Draft[];
  title: string;
  code: string;
  onRefresh: () => void;
  onPublish?: (id: string) => void;
  onDelete: (id: string) => void;
}
function DraftsView({ drafts, title, code, onRefresh, onPublish, onDelete }: DraftsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = drafts.find((d) => d.id === selectedId) || null;
  return (
    <>
      <Toolbar title={title} code={code} crumb={`WORK / ${code}`}>
        <Btn variant="ghost" onClick={onRefresh}>↻ REFRESH</Btn>
      </Toolbar>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-2/5 min-w-[300px] bg-bg-panel/40 border-r border-edge overflow-y-auto">
          {drafts.length === 0 && (
            <div className="p-8 text-center text-sm text-fg-faint font-mono uppercase tracking-widest2">
              EMPTY · 暂无
            </div>
          )}
          {drafts.map((d) => (
            <div
              key={d.id}
              onClick={() => setSelectedId(d.id)}
              className={`px-6 py-4 border-b border-edge/50 cursor-pointer transition-colors ${
                selectedId === d.id
                  ? 'bg-cobalt-soft border-l-2 border-l-cyan pl-[22px]'
                  : 'hover:bg-bg-elev'
              }`}
            >
              <div className="font-zh font-medium text-[15px] text-fg leading-snug mb-1 line-clamp-2">
                {d.rewrittenTitle}
              </div>
              <div className="text-xs text-fg-faint font-mono mt-2 tabular">
                <span className="text-fg-dim">← </span>{truncate(d.sourceTitle, 30)}<br />
                {new Date(d.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 bg-bg overflow-y-auto">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-fg-faint gap-4">
              <div className="font-mono text-7xl text-edge-bright opacity-50">▢</div>
              <div className="font-mono text-xs uppercase tracking-widest2">NO DRAFT SELECTED</div>
            </div>
          ) : (
            <>
              <div className="bg-bg-panel/50 backdrop-blur-sm px-10 py-7 border-b border-edge sticky top-0 z-10">
                <h1 className="font-zh font-bold text-3xl text-fg mb-2 leading-tight tracking-tightish">
                  {selected.rewrittenTitle}
                </h1>
                <div className="text-xs text-fg-faint font-mono leading-relaxed uppercase tracking-wider">
                  改写自 <a href={selected.sourceLink} target="_blank" rel="noreferrer" className="text-cyan hover:glow-cyan normal-case">
                    {selected.sourceTitle}
                  </a> · @<span className="text-fg">{selected.sourceAuthor}</span><br />
                  CREATED <span className="tabular text-fg">{new Date(selected.createdAt).toLocaleString('zh-CN')}</span>
                  {selected.publishedAt && (
                    <> · PUBLISHED <span className="tabular text-fg">{new Date(selected.publishedAt).toLocaleString('zh-CN')}</span></>
                  )}
                </div>
                <div className="mt-5 flex gap-2">
                  {onPublish && (
                    <Btn variant="primary" onClick={() => onPublish(selected.id)}>📤 PUBLISH</Btn>
                  )}
                  <Btn variant="ghost" onClick={() => {
                    navigator.clipboard.writeText(`# ${selected.rewrittenTitle}\n\n${selected.rewrittenContent}`);
                    alert('已复制 Markdown');
                  }}>📋 COPY MD</Btn>
                  <Btn variant="danger" onClick={() => onDelete(selected.id)}>✕ DELETE</Btn>
                </div>
              </div>
              <div
                className="px-10 py-8 pb-16 max-w-3xl text-fg-muted preview-body"
                dangerouslySetInnerHTML={{ __html: mdToHtml(selected.rewrittenContent) }}
              />
              {selected.promptUsed && (
                <div className="px-10 pb-10">
                  <details className="text-xs text-fg-muted bg-bg-panel border border-edge p-3 font-mono">
                    <summary className="cursor-pointer text-fg font-medium uppercase tracking-widest2">[PROMPT]</summary>
                    <pre className="mt-2 whitespace-pre-wrap text-[11px] text-fg-muted">{selected.promptUsed || '(default)'}</pre>
                  </details>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ============== SettingsView ==============
function SettingsView({ llmInfo }: { llmInfo: { model: string; name: string } | null }) {
  return (
    <>
      <Toolbar title="设置" code="CONFIG" crumb="WORK / CONFIG" />
      <div className="flex-1 overflow-y-auto p-10 bg-bg">
        <div className="max-w-2xl space-y-5">
          <Card title="LLM BACKEND" zh="模型后端">
            <div className="text-sm text-fg-muted font-zh">
              当前激活配置:<strong className="text-fg">{llmInfo?.name || '加载中'}</strong>
              {' '}<span className="font-mono text-fg-faint">({llmInfo?.model || '?'})</span>
            </div>
            <div className="text-xs text-fg-faint mt-3 font-mono uppercase tracking-wider">
              ~/.gos-agent/model.json · 改 active_id 切换 · 后端自动 reload
            </div>
          </Card>
          <Card title="PUBLISH CHANNEL" zh="发布渠道">
            <div className="text-sm text-fg-muted leading-relaxed font-zh">
              当前「PUBLISH」是<strong className="text-amber">占位</strong>,仅切换本地状态。<br />
              真发布需要任选一种:
              <ul className="list-none pl-0 mt-3 space-y-1.5">
                <li><span className="text-cyan">→</span> 认证公众号 · 调微信 <code>draft/add</code> API</li>
                <li><span className="text-cyan">→</span> 个人订阅号 · CDP 自动化(baoyu-post-to-wechat)</li>
              </ul>
            </div>
          </Card>
          <Card title="DATA SOURCE" zh="数据源">
            <div className="text-sm text-fg-muted font-zh">
              当前订阅源在 <code className="text-cyan">src/pages/Workbench.tsx</code> 里硬编码。<br />
              后续接入 <code className="text-cyan">GET /api/v1/wx/mps</code> 动态拉取。
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Card({ title, zh, children }: { title: string; zh: string; children: React.ReactNode }) {
  return (
    <div className="relative bg-bg-panel/60 backdrop-blur-sm border border-edge p-6">
      <div className="absolute inset-0 grid-bg-fine opacity-30 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <span className="status-dot" />
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-cyan glow-cyan">[{title}]</span>
          <span className="font-zh text-sm text-fg-muted">{zh}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

/* Tailwind helper to ensure `code` style inside Cards looks tech */
declare global {
  interface HTMLElementEventMap {}
}
