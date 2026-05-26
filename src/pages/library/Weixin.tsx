import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ArrowRight, Plus, Settings2, AlertTriangle, RefreshCw } from 'lucide-react';
import { BRANDS } from '../../lib/brand';
import { classNames } from '../../lib/picsum';
import { listSources, type SourceInfo } from '../../lib/studio';
import { fetchFeed } from '../../lib/feed';
import { useAppStore } from '../../store/useAppStore';
import type { Article } from '../../types';

const b = BRANDS.weixin;
const BrandIcon = b.Icon;

export default function LibraryWeixin() {
  const navigate = useNavigate();
  const setRewriteArticle = useAppStore((s) => s.setRewriteArticle);

  const [sources, setSources] = useState<SourceInfo[] | null>(null);
  const [sourcesError, setSourcesError] = useState<string | null>(null);
  const [sourcesHint, setSourcesHint] = useState<string | null>(null);

  const [accountId, setAccountId] = useState<string>('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);

  // Load source list
  const loadSources = () => {
    setSourcesError(null);
    setSourcesHint(null);
    setSources(null);
    listSources().then((res) => {
      if (res.ok && res.sources) {
        setSources(res.sources);
      } else {
        setSources([]);
        setSourcesError(res.error || '未能加载公众号列表');
        setSourcesHint(res.hint || '请确认 we-mp-rss 在 :8001 端口运行，且后端配置了 WEMPRSS_AK/SK');
      }
    });
  };

  useEffect(() => {
    loadSources();
  }, []);

  // Load articles for selected account(s)
  useEffect(() => {
    if (!sources || sources.length === 0) {
      setArticles([]);
      return;
    }
    setFeedLoading(true);
    setFeedError(null);
    const targets = accountId === 'all' ? sources.slice(0, 3) : sources.filter((s) => s.id === accountId);
    Promise.all(targets.map((s) => fetchFeed(s.id, 15).catch(() => [] as Article[])))
      .then((batches) => {
        const merged = batches.flat();
        // updated 字段是 RFC 2822（"Tue, 26 May 2026 12:13:35 +0800"），
        // 字符串排序会按周名首字母乱序，需解析成时间戳后再比。
        merged.sort((a, b) => parseDate(b.updated) - parseDate(a.updated));
        setArticles(merged);
        setFeedLoading(false);
      })
      .catch((e) => {
        setFeedError(e instanceof Error ? e.message : String(e));
        setFeedLoading(false);
      });
  }, [accountId, sources]);

  const accountById = useMemo(() => {
    const map = new Map<string, SourceInfo>();
    sources?.forEach((s) => map.set(s.id, s));
    return map;
  }, [sources]);

  const handleSendToRewrite = (a: Article) => {
    setRewriteArticle(a);
    navigate('/text/rewrite');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className={classNames('w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0', b.bg)}>
          <BrandIcon className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">微信公众号</h1>
          <p className="text-sm text-zinc-500 mt-0.5">订阅的公众号文章流 — 通过 we-mp-rss 实时采集，可一键送去改写</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="btn-outline text-xs" onClick={loadSources}>
            <RefreshCw className="w-3.5 h-3.5" /> 刷新
          </button>
          <button className="btn-outline text-xs" title="请到 we-mp-rss 主项目配置">
            <Settings2 className="w-3.5 h-3.5" /> 采集配置
          </button>
          <button className={classNames('btn-primary text-xs hover:opacity-90', b.bg)} title="请到 we-mp-rss 主项目添加">
            <Plus className="w-3.5 h-3.5" /> 添加公众号
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 mt-5">
        <KpiCard label="订阅公众号" value={sources ? sources.length.toString() : '—'} accent={b.text} />
        <KpiCard label="最近文章" value={articles.length.toString()} accent={b.text} />
        <KpiCard label="当前选择" value={accountId === 'all' ? '全部' : accountById.get(accountId)?.name ?? '—'} accent={b.text} />
        <KpiCard label="状态" value={feedLoading ? '采集中…' : feedError ? '出错' : '正常'} accent={b.text} />
      </div>

      {/* Sources error banner */}
      {sourcesError && (
        <div className="card border-amber-300 bg-amber-50 p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-800">无法读取公众号列表</p>
            <p className="text-amber-700 mt-1">{sourcesError}</p>
            {sourcesHint && <p className="text-xs text-amber-700/80 mt-1">{sourcesHint}</p>}
          </div>
          <button onClick={loadSources} className="btn-outline text-xs"><RefreshCw className="w-3.5 h-3.5" /> 重试</button>
        </div>
      )}

      {/* Account chips */}
      {sources && sources.length > 0 && (
        <div className="mb-4 -mx-1 px-1 flex gap-2 overflow-x-auto no-scrollbar">
          <AccountChip active={accountId === 'all'} onClick={() => setAccountId('all')}>
            <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-700">全</div>
            <div>
              <div className="text-xs font-semibold">全部公众号</div>
              <div className="text-[10px] text-zinc-400">共 {sources.length} 个</div>
            </div>
          </AccountChip>
          {sources.map((s) => (
            <AccountChip key={s.id} active={accountId === s.id} onClick={() => setAccountId(s.id)}>
              {s.cover ? (
                <img src={s.cover} alt={s.name} referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className={classNames('w-7 h-7 rounded-full flex items-center justify-center text-white', b.bg)}>
                  <BrandIcon className="w-3.5 h-3.5" />
                </div>
              )}
              <div>
                <div className="text-xs font-semibold whitespace-nowrap max-w-[7rem] truncate">{s.name}</div>
                {s.intro && <div className="text-[10px] text-zinc-400 whitespace-nowrap max-w-[8rem] truncate">{s.intro}</div>}
              </div>
            </AccountChip>
          ))}
        </div>
      )}

      {/* Article list */}
      {feedError && (
        <div className="card border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">读取文章失败：{feedError}</p>
          <p className="text-xs text-rose-600/80 mt-1">检查 /feed/&lt;sourceId&gt;.md 是否可访问</p>
        </div>
      )}
      {!feedError && articles.length === 0 && !feedLoading && sources && sources.length > 0 && (
        <div className="card p-8 text-center text-sm text-zinc-500">
          没有文章。请到 <a className={classNames('font-semibold', b.text)} href="http://localhost:8001" target="_blank" rel="noreferrer">we-mp-rss</a> 主项目点"刷新"补抓内容。
        </div>
      )}
      {feedLoading && articles.length === 0 && (
        <div className="card p-8 text-center text-sm text-zinc-400">采集中…</div>
      )}

      <div className="space-y-3">
        {articles.map((a) => (
          <article key={a.id} className="card overflow-hidden flex flex-col md:flex-row hover:shadow-sm hover:border-zinc-300 transition group">
            <div className="md:w-72 md:shrink-0 aspect-[16/9] md:aspect-auto bg-zinc-100 overflow-hidden">
              {a.thumb ? (
                <img
                  src={a.thumb}
                  alt={a.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BrandIcon className={classNames('w-8 h-8', b.text, 'opacity-30')} />
                </div>
              )}
            </div>
            <div className="p-4 sm:p-5 flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <BrandIcon className={classNames('w-3 h-3', b.text)} />
                <span className="font-medium text-zinc-700 truncate">{a.author || '公众号'}</span>
                <span className="text-zinc-300">·</span>
                <span>{formatTime(a.updated)}</span>
              </div>
              <h3 className="mt-2 text-base sm:text-lg font-semibold text-zinc-900 leading-snug line-clamp-2">{a.title}</h3>
              {a.summary && (
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed line-clamp-2 flex-1">{a.summary}</p>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                {a.link && (
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-zinc-900 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> 原文
                  </a>
                )}
                <button
                  onClick={() => handleSendToRewrite(a)}
                  className={classNames('ml-auto btn-primary text-xs hover:opacity-90', b.bg)}
                >
                  送去改写 <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta, accent }: { label: string; value: string; delta?: string; accent: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 tabular truncate">{value}</div>
      {delta && <div className={classNames('mt-1 text-xs font-semibold tabular', accent)}>{delta}</div>}
    </div>
  );
}

function AccountChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        'shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition',
        active ? `${b.tint} ${b.border} ring-1 ${b.ring}/40` : 'bg-white border-zinc-200 hover:border-zinc-300',
      )}
    >
      {children}
    </button>
  );
}

function parseDate(s: string): number {
  if (!s) return 0;
  const t = Date.parse(s);
  return Number.isNaN(t) ? 0 : t;
}

function formatTime(iso: string): string {
  if (!iso) return '';
  const t = parseDate(iso);
  if (!t) return iso;
  const d = new Date(t);
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} 天前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
