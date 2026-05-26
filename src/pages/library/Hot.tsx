import { useState } from 'react';
import { Flame, TrendingUp, ArrowRight, Globe } from 'lucide-react';
import PageTitle from '../../components/PageTitle';
import { HOT_TOPICS, PLATFORM_LABELS, type Platform } from '../../data/mock/hotTopics';
import { MODULES } from '../../lib/module-meta';
import { BRANDS, type BrandKey } from '../../lib/brand';
import { classNames } from '../../lib/picsum';

const PLATFORM_BRAND: Record<Exclude<Platform, 'all'>, BrandKey> = {
  xhs: 'xhs',
  weixin: 'weixin',
  douyin: 'douyin',
  weibo: 'weibo',
};

export default function LibraryHot() {
  const m = MODULES.library;
  const [platform, setPlatform] = useState<Platform>('all');
  const [range, setRange] = useState('today');

  const filtered = HOT_TOPICS.filter((t) => platform === 'all' || t.platform === platform).sort(
    (a, b) => b.heat - a.heat,
  );

  return (
    <div>
      <PageTitle
        title="热点榜"
        subtitle="跨平台热门话题聚合，按热度排序"
        actions={
          <div className="hidden sm:flex gap-2">
            {[
              { v: 'today', l: '今日' },
              { v: 'week', l: '本周' },
              { v: 'month', l: '本月' },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setRange(o.v)}
                className={classNames(
                  'chip border',
                  range === o.v ? `${m.tint} ${m.text} border-current font-semibold` : 'bg-white text-zinc-600 border-zinc-200',
                )}
              >
                {o.l}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex flex-wrap gap-1.5 mb-4">
        <PlatformChip value="all" current={platform} onClick={setPlatform} />
        <PlatformChip value="xhs" current={platform} onClick={setPlatform} />
        <PlatformChip value="weixin" current={platform} onClick={setPlatform} />
        <PlatformChip value="douyin" current={platform} onClick={setPlatform} />
        <PlatformChip value="weibo" current={platform} onClick={setPlatform} />
      </div>

      <div className="card divide-y divide-zinc-100">
        {filtered.map((t, i) => {
          const tBrand = t.platform !== 'all' ? BRANDS[PLATFORM_BRAND[t.platform]] : null;
          const TBrandIcon = tBrand?.Icon;
          return (
            <div key={t.id} className="px-4 sm:px-5 py-3 sm:py-3.5 flex items-center gap-3 sm:gap-4 hover:bg-zinc-50/60 transition">
              <div className={classNames(
                'shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold tabular',
                i < 3 ? `${m.bg} text-white` : 'bg-zinc-100 text-zinc-500',
              )}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-zinc-900 truncate">{t.title}</p>
                  <span className="chip bg-zinc-100 text-zinc-500 text-[10px]">{t.category}</span>
                  <span className="text-[10px] text-zinc-400 inline-flex items-center gap-1">·
                    {TBrandIcon && <TBrandIcon className={classNames('w-2.5 h-2.5', tBrand!.text)} />}
                    {PLATFORM_LABELS[t.platform]} · {t.hours}h 前
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Flame className={classNames('w-3 h-3', m.text)} />
                    <span className={classNames('font-semibold tabular', m.text)}>{t.heat.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold tabular">+{t.growth}%</span>
                  </span>
                </div>
              </div>
              <button className={classNames('btn-ghost !text-xs hidden sm:inline-flex hover:bg-blue-50', m.text)}>
                送去改写 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlatformChip({
  value,
  current,
  onClick,
}: {
  value: Platform;
  current: Platform;
  onClick: (p: Platform) => void;
}) {
  const active = value === current;
  const brand = value !== 'all' ? BRANDS[PLATFORM_BRAND[value]] : null;
  const BrandIcon = brand?.Icon;
  return (
    <button
      onClick={() => onClick(value)}
      className={classNames(
        'chip border transition inline-flex items-center gap-1.5',
        active && brand
          ? `${brand.tint} ${brand.text} ${brand.border} font-semibold`
          : active
          ? 'bg-blue-50 text-blue-600 border-blue-600 font-semibold'
          : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50',
      )}
    >
      {BrandIcon ? <BrandIcon className={classNames('w-3 h-3', active ? brand!.text : 'text-zinc-400')} /> : <Globe className="w-3 h-3" />}
      {PLATFORM_LABELS[value]}
    </button>
  );
}
