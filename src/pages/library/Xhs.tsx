import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Bookmark, MessageCircle, ArrowRight, Search, AlertTriangle, Play,
  ExternalLink, X, ChevronLeft, ChevronRight, Plus, ZoomIn,
} from 'lucide-react';
import { BRANDS } from '../../lib/brand';
import { classNames, formatCount } from '../../lib/picsum';
import { searchXhsNotes, type XhsNote, type XhsNoteType, type XhsSearchResult } from '../../lib/studio';
import { useAppStore } from '../../store/useAppStore';
import type { Article } from '../../types';

const b = BRANDS.xhs;
const BrandIcon = b.Icon;

// 纯前端排序(不发请求)。'general' = 保留接口返回的相关性顺序。
type SortKey = 'general' | 'liked' | 'time' | 'collected' | 'comments';
const SORTS: { value: SortKey; label: string }[] = [
  { value: 'general', label: '综合' },
  { value: 'liked', label: '最多点赞' },
  { value: 'time', label: '最新' },
  { value: 'collected', label: '最多收藏' },
  { value: 'comments', label: '最多评论' },
];

function sortNotes(pool: XhsNote[], key: SortKey): XhsNote[] {
  if (key === 'general') return pool;
  const by: Record<Exclude<SortKey, 'general'>, (n: XhsNote) => number> = {
    liked: (n) => n.liked,
    time: (n) => n.timestamp,
    collected: (n) => n.collected,
    comments: (n) => n.comments,
  };
  const f = by[key];
  return [...pool].sort((a, b2) => f(b2) - f(a));
}

const NOTE_TYPES: { value: XhsNoteType; label: string }[] = [
  { value: '不限', label: '不限' },
  { value: '普通笔记', label: '图文' },
  { value: '视频笔记', label: '视频' },
];

// 把整篇笔记打包给改写流程:标题 + 完整正文 + 全部配图(markdown,改写时会被保留) + 原文链接
function noteToArticle(n: XhsNote): Article {
  const imagesMd = n.images.map((u) => `![](${u})`).join('\n');
  const content = [
    n.title ? `# ${n.title}` : '',
    n.desc,
    imagesMd,
    n.link ? `> 原文: ${n.link}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
  return {
    id: n.id,
    title: n.title || n.desc.slice(0, 30),
    summary: n.desc,
    author: n.author,
    updated: n.timestamp ? new Date(n.timestamp).toISOString() : '',
    link: n.link,
    thumb: n.cover,
    content,
    status: 'todo',
  };
}

export default function LibraryXhs() {
  const navigate = useNavigate();
  const setRewriteArticle = useAppStore((s) => s.setRewriteArticle);

  // 搜索条件(发请求才生效)
  const [keyword, setKeyword] = useState('');
  const [noteType, setNoteType] = useState<XhsNoteType>('不限');
  // 上次实际搜索用的条件(用于判断"条件已改")
  const [submitted, setSubmitted] = useState('');
  const [submittedType, setSubmittedType] = useState<XhsNoteType>('不限');
  // 结果池(接口返回顺序)+ 纯前端排序键
  const [pool, setPool] = useState<XhsNote[]>([]);
  const [sort, setSort] = useState<SortKey>('general');

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [page, setPage] = useState(1);
  const [pager, setPager] = useState<{ searchId: string | null; sessionId: string | null }>({ searchId: null, sessionId: null });
  const [detail, setDetail] = useState<XhsNote | null>(null);

  // 显示用的列表 = 池子按当前排序键即时重排(不发请求)
  const notes = useMemo(() => sortNotes(pool, sort), [pool, sort]);
  // 条件改了但还没重新搜
  const dirty = !!submitted && (keyword.trim() !== submitted || noteType !== submittedType);

  const applyResult = (res: XhsSearchResult, append: boolean) => {
    if (res.ok && res.notes) {
      setPool((prev) => (append ? [...prev, ...res.notes!] : res.notes!));
      setCached(!!res.cached);
      setPager({ searchId: res.search_id ?? null, sessionId: res.search_session_id ?? null });
    } else {
      if (!append) setPool([]);
      setError(res.error || '搜索失败');
      setHint(res.hint || null);
    }
  };

  const doSearch = async () => {
    const q = keyword.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setHint(null);
    setSubmitted(q);
    setSubmittedType(noteType);
    setPage(1);
    // 始终拿相关性最高的一页;排序在前端做,不影响计费
    const res = await searchXhsNotes(q, { page: 1, noteType });
    applyResult(res, false);
    setLoading(false);
  };

  const loadMore = async () => {
    if (!submitted || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    const next = page + 1;
    const res = await searchXhsNotes(submitted, {
      page: next,
      noteType: submittedType,
      searchId: pager.searchId,
      searchSessionId: pager.sessionId,
    });
    applyResult(res, true);
    setPage(next);
    setLoadingMore(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch();
  };

  const sendToRewrite = (n: XhsNote) => {
    setRewriteArticle(noteToArticle(n));
    navigate('/text/rewrite');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className={classNames('w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0', b.bg)}>
          <BrandIcon className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">小红书</h1>
          <p className="text-sm text-zinc-500 mt-0.5">按关键词搜索笔记 — 点卡片看详情 / 大图 / 原文，可一键送去改写</p>
        </div>
      </div>

      {/* 搜索条件:关键词 + 类型(改了要重新搜) */}
      <form onSubmit={onSubmit} className="card p-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 rounded-md border border-zinc-200 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="输入关键词，如 秋日穿搭 / 美食推荐 / 露营"
              className="flex-1 py-2 text-sm focus:outline-none bg-transparent"
            />
          </div>
          <button type="submit" disabled={loading || !keyword.trim()} className={classNames('btn-primary text-sm hover:opacity-90 disabled:opacity-50 shrink-0', b.bg)}>
            <Search className="w-4 h-4" /> {loading ? '搜索中…' : '搜索'}
          </button>
        </div>
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          <span className="text-xs text-zinc-400">类型</span>
          {NOTE_TYPES.map((n) => (
            <button type="button" key={n.value} onClick={() => setNoteType(n.value)}
              className={classNames('chip border', noteType === n.value ? `${b.tint} ${b.text} border-current font-semibold` : 'bg-white text-zinc-600 border-zinc-200')}>
              {n.label}
            </button>
          ))}
          <span className="text-[10px] text-zinc-300 ml-1">搜索条件，改后需重新搜索</span>
        </div>
      </form>

      {/* 条件改了的提示 */}
      {dirty && (
        <div className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          搜索条件已修改，点「搜索」用新条件重新抓取（会产生一次调用）。
        </div>
      )}

      {/* 排序:纯前端,即时,不发请求 */}
      {pool.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-zinc-400">排序</span>
            {SORTS.map((s) => (
              <button key={s.value} onClick={() => setSort(s.value)}
                className={classNames('chip border', sort === s.value ? `${b.tint} ${b.text} border-current font-semibold` : 'bg-white text-zinc-600 border-zinc-200')}>
                {s.label}
              </button>
            ))}
            <span className="text-[10px] text-zinc-300 ml-1">即时重排，免费</span>
          </div>
          <span className="text-[10px] text-zinc-400 ml-auto">
            共 {pool.length} 条{cached ? ' · 已缓存(不计费)' : ''}
          </span>
        </div>
      )}

      {error && (
        <div className="card border-amber-300 bg-amber-50 p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-800">搜索失败</p>
            <p className="text-amber-700 mt-1">{error}</p>
            {hint && <p className="text-xs text-amber-700/80 mt-1">{hint}</p>}
          </div>
        </div>
      )}

      {!submitted && !loading && (
        <div className="card p-12 text-center">
          <BrandIcon className={classNames('w-10 h-10 mx-auto', b.text, 'opacity-40')} />
          <p className="mt-3 text-sm font-semibold text-zinc-900">搜点什么吧</p>
          <p className="text-xs text-zinc-500 mt-1">每次搜索约 ¥0.07 / 20 条，10 分钟内同词不重复计费。点笔记看详情、看大图都不额外花钱。</p>
        </div>
      )}
      {submitted && !loading && !error && notes.length === 0 && (
        <div className="card p-12 text-center text-sm text-zinc-500">没搜到「{submitted}」相关笔记，换个词试试。</div>
      )}
      {loading && <div className="card p-12 text-center text-sm text-zinc-400">搜索中…</div>}

      {notes.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {notes.map((n, i) => (
              <article key={`${n.id}-${i}`} className="card overflow-hidden group flex flex-col">
                <button onClick={() => setDetail(n)} className="block aspect-[3/4] bg-zinc-100 overflow-hidden relative text-left">
                  {n.cover ? (
                    <img src={n.cover} alt={n.title} referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><BrandIcon className={classNames('w-8 h-8', b.text, 'opacity-30')} /></div>
                  )}
                  {n.type === 'video' && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"><Play className="w-3 h-3 text-white" fill="currentColor" /></div>
                  )}
                  {n.images.length > 1 && (
                    <div className="absolute top-2 left-2 px-1.5 h-5 rounded bg-black/50 text-white text-[10px] flex items-center font-medium">{n.images.length} 图</div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="px-2 py-1 rounded-md bg-white/90 text-zinc-900 text-xs font-medium flex items-center gap-1"><ZoomIn className="w-3 h-3" /> 详情</span>
                  </div>
                </button>
                <div className="p-3 flex-1 flex flex-col">
                  <button onClick={() => setDetail(n)} className="text-left">
                    <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 leading-snug hover:text-rose-600 transition">{n.title || n.desc.slice(0, 30)}</h3>
                  </button>
                  {n.desc && <p className="mt-1 text-xs text-zinc-500 line-clamp-2 leading-relaxed flex-1">{n.desc}</p>}
                  <div className="mt-2.5 flex items-center gap-2">
                    {n.authorAvatar ? (
                      <img src={n.authorAvatar} alt={n.author} referrerPolicy="no-referrer" className="w-4 h-4 rounded-full" />
                    ) : (
                      <span className={classNames('w-4 h-4 rounded-full flex items-center justify-center text-white', b.bg)}><BrandIcon className="w-2.5 h-2.5" /></span>
                    )}
                    <span className="text-xs text-zinc-500 truncate flex-1">{n.author || '小红书用户'}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-0.5 tabular"><Heart className={classNames('w-3 h-3', b.text)} /><b className={b.text}>{formatCount(n.liked)}</b></span>
                    <span className="flex items-center gap-0.5 tabular"><Bookmark className="w-3 h-3" />{formatCount(n.collected)}</span>
                    <span className="flex items-center gap-0.5 tabular"><MessageCircle className="w-3 h-3" />{formatCount(n.comments)}</span>
                  </div>
                  <button onClick={() => sendToRewrite(n)} className={classNames('mt-3 btn-primary text-xs !py-1.5 hover:opacity-90', b.bg)}>
                    送去改写 <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col items-center gap-1.5 mt-5">
            <button onClick={loadMore} disabled={loadingMore} className="btn-outline text-sm disabled:opacity-50">
              {loadingMore ? <>加载中…</> : <><Plus className="w-4 h-4" /> 加载更多（第 {page + 1} 页 · +¥0.07）</>}
            </button>
            <span className="text-[10px] text-zinc-400">已加载 {notes.length} 条</span>
          </div>
        </>
      )}

      {detail && (
        <NoteDetail note={detail} onClose={() => setDetail(null)} onRewrite={(n) => { setDetail(null); sendToRewrite(n); }} />
      )}
    </div>
  );
}

/* ============ 详情弹窗（复用搜索已返回的数据，零额外花费）============ */
function NoteDetail({ note, onClose, onRewrite }: { note: XhsNote; onClose: () => void; onRewrite: (n: XhsNote) => void }) {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const imgs = note.images.length ? note.images : note.cover ? [note.cover] : [];
  const has = imgs.length > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { zoom ? setZoom(false) : onClose(); }
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + imgs.length) % imgs.length);
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % imgs.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [imgs.length, zoom, onClose]);

  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);
  const next = () => setIdx((i) => (i + 1) % imgs.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* 图片区 */}
        <div className="md:w-1/2 bg-zinc-950 relative flex items-center justify-center shrink-0 aspect-square md:aspect-auto md:min-h-[420px]">
          {has ? (
            <>
              <img src={imgs[idx]} alt="" referrerPolicy="no-referrer" className="w-full h-full object-contain cursor-zoom-in" onClick={() => setZoom(true)} />
              {imgs.length > 1 && (
                <>
                  <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"><ChevronRight className="w-5 h-5" /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {imgs.map((_, i) => (
                      <button key={i} onClick={() => setIdx(i)} className={classNames('w-1.5 h-1.5 rounded-full', i === idx ? 'bg-white' : 'bg-white/40')} />
                    ))}
                  </div>
                  <div className="absolute top-3 left-3 px-2 h-6 rounded bg-black/50 text-white text-xs flex items-center tabular">{idx + 1}/{imgs.length}</div>
                </>
              )}
              <div className="absolute bottom-3 right-3 px-2 h-6 rounded bg-black/40 text-white/80 text-[10px] flex items-center gap-1"><ZoomIn className="w-3 h-3" /> 点图放大</div>
            </>
          ) : (
            <BrandIcon className="w-16 h-16 text-white/20" />
          )}
        </div>

        {/* 文本区 */}
        <div className="md:w-1/2 flex flex-col min-h-0">
          <div className="flex items-center gap-2 p-4 border-b border-zinc-100">
            {note.authorAvatar ? (
              <img src={note.authorAvatar} alt={note.author} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full" />
            ) : (
              <span className={classNames('w-8 h-8 rounded-full flex items-center justify-center text-white', b.bg)}><BrandIcon className="w-4 h-4" /></span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate">{note.author || '小红书用户'}</p>
              <p className="text-[11px] text-zinc-400">{note.timestamp ? new Date(note.timestamp).toLocaleDateString() : ''}{note.type === 'video' ? ' · 视频' : ''}</p>
            </div>
            <button onClick={onClose} className="btn-ghost !p-2"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-4 overflow-y-auto scrollbar-thin flex-1">
            <h2 className="text-base font-bold text-zinc-900 leading-snug">{note.title || '(无标题)'}</h2>
            <p className="mt-2 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{note.desc || '(此笔记无正文)'}</p>
          </div>

          <div className="border-t border-zinc-100 p-4 space-y-3">
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1 tabular"><Heart className={classNames('w-3.5 h-3.5', b.text)} /><b className={b.text}>{note.liked.toLocaleString()}</b></span>
              <span className="flex items-center gap-1 tabular"><Bookmark className="w-3.5 h-3.5" />{note.collected.toLocaleString()}</span>
              <span className="flex items-center gap-1 tabular"><MessageCircle className="w-3.5 h-3.5" />{note.comments.toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              {note.link && (
                <a href={note.link} target="_blank" rel="noreferrer" className="btn-outline text-sm flex-1 justify-center">
                  <ExternalLink className="w-3.5 h-3.5" /> 打开原笔记
                </a>
              )}
              <button onClick={() => onRewrite(note)} className={classNames('btn-primary text-sm flex-1 justify-center hover:opacity-90', b.bg)}>
                送去改写 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 大图 lightbox */}
      {zoom && has && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={(e) => { e.stopPropagation(); setZoom(false); }}>
          <img src={imgs[idx]} alt="" referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
          <button onClick={(e) => { e.stopPropagation(); setZoom(false); }} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><X className="w-6 h-6" /></button>
          {imgs.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><ChevronLeft className="w-6 h-6" /></button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><ChevronRight className="w-6 h-6" /></button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 h-7 rounded-full bg-white/10 text-white text-sm flex items-center tabular">{idx + 1} / {imgs.length}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
