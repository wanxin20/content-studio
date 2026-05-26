import { useMemo, useState } from 'react';
import { Heart, Bookmark, MessageCircle, ArrowRight, Plus, Settings2 } from 'lucide-react';
import { XHS_NOTES } from '../../data/mock/platformFeeds';
import { BRANDS } from '../../lib/brand';
import { classNames } from '../../lib/picsum';

function formatK(n: number) {
  if (n >= 10000) return (n / 1000).toFixed(1) + 'k';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

export default function LibraryXhs() {
  const b = BRANDS.xhs;
  const BrandIcon = b.Icon;
  const topics = useMemo(() => {
    const set = new Set(XHS_NOTES.map((n) => n.topic));
    return ['全部', ...Array.from(set)];
  }, []);
  const [topic, setTopic] = useState('全部');
  const notes = XHS_NOTES.filter((n) => topic === '全部' || n.topic === topic);

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className={classNames('w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0', b.bg)}>
          <BrandIcon className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">小红书</h1>
          <p className="text-sm text-zinc-500 mt-0.5">目标账号 / 话题的笔记抓取 — 封面 + 文案 + 互动数据</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="btn-outline text-xs"><Settings2 className="w-3.5 h-3.5" /> 采集配置</button>
          <button className={classNames('btn-primary text-xs hover:opacity-90', b.bg)}>
            <Plus className="w-3.5 h-3.5" /> 添加来源
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 mt-5">
        <KpiCard label="入库笔记" value={XHS_NOTES.length.toString()} accent={b.text} />
        <KpiCard label="本周爆款" value="3" delta="+1" accent={b.text} />
        <KpiCard label="跟踪话题" value={topics.length - 1 + ''} accent={b.text} />
        <KpiCard label="平均收藏" value="2.1k" accent={b.text} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={classNames(
              'chip border',
              t === topic ? `${b.tint} ${b.text} border-current font-semibold` : 'bg-white text-zinc-600 border-zinc-200',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {notes.map((n) => (
          <article key={n.id} className="card overflow-hidden group flex flex-col">
            <div className="aspect-[4/5] bg-zinc-100 overflow-hidden">
              <img src={n.cover} alt={n.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" loading="lazy" />
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <span className={classNames('chip self-start text-[10px]', b.tint, b.text)}>{n.topic}</span>
              <h3 className="mt-1.5 text-sm font-semibold text-zinc-900 line-clamp-2 leading-snug">{n.title}</h3>
              <p className="mt-1 text-xs text-zinc-500 line-clamp-2 leading-relaxed flex-1">{n.excerpt}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <img src={n.authorAvatar} alt={n.author} className="w-4 h-4 rounded-full" />
                <span className="text-xs text-zinc-500 truncate flex-1">{n.author}</span>
                <span className="text-[10px] text-zinc-400">{n.publishedAgo}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="flex items-center gap-0.5 tabular"><Heart className="w-3 h-3" />{formatK(n.likes)}</span>
                <span className="flex items-center gap-0.5 tabular"><Bookmark className={classNames('w-3 h-3', b.text)} /><b className={b.text}>{formatK(n.saves)}</b></span>
                <span className="flex items-center gap-0.5 tabular"><MessageCircle className="w-3 h-3" />{formatK(n.comments)}</span>
              </div>
              <button className={classNames('mt-3 btn-primary text-xs !py-1.5 hover:opacity-90', b.bg)}>
                送去改写 <ArrowRight className="w-3 h-3" />
              </button>
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
      <div className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 tabular">{value}</div>
      {delta && <div className={classNames('mt-1 text-xs font-semibold tabular', accent)}>{delta}</div>}
    </div>
  );
}
