import { useState } from 'react';
import { Heart, Bookmark, MessageCircle, ArrowRight } from 'lucide-react';
import PageTitle from '../../components/PageTitle';
import FilterChips from '../../components/FilterChips';
import { PLATFORM_LABELS, type Platform } from '../../data/mock/hotTopics';
import { VIRAL_POSTS } from '../../data/mock/viralPosts';
import { MODULES } from '../../lib/module-meta';
import { classNames } from '../../lib/picsum';

const platformOptions = (['all', 'xhs', 'weixin', 'douyin', 'weibo'] as Platform[]).map((p) => ({
  value: p,
  label: PLATFORM_LABELS[p],
}));

export default function LibraryViral() {
  const m = MODULES.library;
  const [platform, setPlatform] = useState<Platform>('all');
  const filtered = VIRAL_POSTS.filter((p) => platform === 'all' || p.platform === platform);

  return (
    <div>
      <PageTitle title="爆款" subtitle="跨平台爆款笔记，可一键送去文本创作改写" />

      <div className="mb-4">
        <FilterChips options={platformOptions} value={platform} onChange={(v) => setPlatform(v as Platform)} accent={m.text} accentBg={m.tint} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <article key={p.id} className="card overflow-hidden group flex flex-col">
            <div className="aspect-[4/5] bg-zinc-100 overflow-hidden">
              <img
                src={p.cover}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-[10px]">
                <span className={classNames('chip', m.tint, m.text)}>{PLATFORM_LABELS[p.platform]}</span>
                <span className="chip bg-zinc-100 text-zinc-500">{p.tag}</span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-zinc-900 line-clamp-2 leading-snug">{p.title}</h3>
              <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed flex-1">{p.excerpt}</p>
              <div className="mt-3 flex items-center gap-2">
                <img src={p.authorAvatar} alt={p.author} className="w-5 h-5 rounded-full" />
                <span className="text-xs text-zinc-600 truncate flex-1">{p.author}</span>
                <span className="text-[10px] text-zinc-400">{p.publishedAgo}</span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1 tabular"><Heart className="w-3.5 h-3.5" />{formatK(p.likes)}</span>
                <span className="flex items-center gap-1 tabular"><Bookmark className={classNames('w-3.5 h-3.5', m.text)} /><b className={m.text}>{formatK(p.saves)}</b></span>
                <span className="flex items-center gap-1 tabular"><MessageCircle className="w-3.5 h-3.5" />{formatK(p.comments)}</span>
              </div>
              <button className={classNames('mt-3.5 btn-primary text-xs', m.bg, 'hover:opacity-90')}>
                送去改写 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function formatK(n: number) {
  if (n >= 10000) return (n / 1000).toFixed(1) + 'k';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}
