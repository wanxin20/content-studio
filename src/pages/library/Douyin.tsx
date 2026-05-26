import { useMemo, useState } from 'react';
import { Play, Heart, MessageCircle, ArrowRight, Plus, Settings2 } from 'lucide-react';
import { DOUYIN_VIDEOS, formatPlays } from '../../data/mock/platformFeeds';
import { BRANDS } from '../../lib/brand';
import { classNames } from '../../lib/picsum';

export default function LibraryDouyin() {
  const b = BRANDS.douyin;
  const BrandIcon = b.Icon;
  const topics = useMemo(() => ['全部', ...Array.from(new Set(DOUYIN_VIDEOS.map((v) => v.topic)))], []);
  const [topic, setTopic] = useState('全部');
  const videos = DOUYIN_VIDEOS.filter((v) => topic === '全部' || v.topic === topic);

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className={classNames('w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0', b.bg)}>
          <BrandIcon className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">抖音</h1>
          <p className="text-sm text-zinc-500 mt-0.5">账号 / 话题视频抓取 — 含播放量 / 点赞数据</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="btn-outline text-xs"><Settings2 className="w-3.5 h-3.5" /> 采集配置</button>
          <button className={classNames('btn-primary text-xs hover:opacity-90', b.bg)}>
            <Plus className="w-3.5 h-3.5" /> 添加来源
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 mt-5">
        <KpiCard label="入库视频" value={DOUYIN_VIDEOS.length.toString()} accent={b.text} />
        <KpiCard label="本周新增" value="14" delta="+5" accent={b.text} />
        <KpiCard label="跟踪话题" value={topics.length - 1 + ''} accent={b.text} />
        <KpiCard label="平均播放" value="980k" accent={b.text} />
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
        {videos.map((v) => (
          <article key={v.id} className="card overflow-hidden group flex flex-col">
            <div className="aspect-[9/16] bg-zinc-900 overflow-hidden relative">
              <img src={v.cover} alt={v.title} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
              <div className="absolute top-2 left-2 bg-white/95 rounded-md p-1 flex items-center gap-1">
                <BrandIcon className="w-3 h-3" />
              </div>
              <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">{v.duration}</div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <div className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center text-zinc-900">
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <p className="text-xs font-semibold line-clamp-2 leading-snug">{v.title}</p>
              </div>
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <div className="flex items-center gap-2">
                <img src={v.authorAvatar} alt={v.author} className="w-5 h-5 rounded-full" />
                <span className="text-xs text-zinc-700 truncate flex-1 font-medium">{v.author}</span>
                <span className={classNames('chip text-[9px]', b.tint, b.text)}>{v.topic}</span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
                <span className="flex items-center gap-0.5 tabular"><Play className="w-3 h-3" />{formatPlays(v.plays)}</span>
                <span className="flex items-center gap-0.5 tabular"><Heart className={classNames('w-3 h-3', b.text)} /><b className={b.text}>{formatPlays(v.likes)}</b></span>
                <span className="flex items-center gap-0.5 tabular"><MessageCircle className="w-3 h-3" />{formatPlays(v.comments)}</span>
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
