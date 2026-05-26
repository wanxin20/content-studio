import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Clock, FileText } from 'lucide-react';
import { MODULES, MODULE_ORDER, MODULE_LIVE, HOME_CARDS, type ModuleKey, type HomeCard } from '../lib/module-meta';
import { BRANDS } from '../lib/brand';
import { listDrafts } from '../lib/studio';
import type { Draft } from '../types';
import { classNames } from '../lib/picsum';

const SECTIONS: Exclude<ModuleKey, 'home'>[] = ['library', 'text', 'multimodal', 'manage'];

export default function Home() {
  return (
    <div className="space-y-7 sm:space-y-8">
      <Hero />
      <EnterWorkbench />
      <AllFeatures />
      <RecentDrafts />
    </div>
  );
}

/* === 1. Hero === */
function Hero() {
  return (
    <section className="card p-5 sm:p-7 bg-gradient-to-br from-white to-zinc-50">
      <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Atelier · 内容创作工作台</p>
      <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
        今天想创作什么？
      </h1>
      <p className="mt-2 text-sm sm:text-base text-zinc-500 max-w-xl">
        当前已上线：<b className="text-zinc-900">微信公众号数据源</b> + <b className="text-zinc-900">文本改写</b>。其他模块陆续开放。
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link to="/library/weixin" className="btn-primary bg-zinc-900 hover:bg-zinc-800">
          去看公众号文章 <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link to="/text/rewrite" className="btn-outline">
          直接改写一篇
        </Link>
      </div>
    </section>
  );
}

/* === 2. 进入工作台（5 个大入口卡）=== */
function EnterWorkbench() {
  const modules = MODULE_ORDER.filter((k) => k !== 'home').map((k) => MODULES[k]);

  return (
    <section>
      <SectionHeader title="进入工作台" subtitle="挑一个模块开工——灰色卡片表示模块尚未开放" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {modules.map((m) => {
          const Icon = m.icon;
          const live = MODULE_LIVE[m.key as Exclude<ModuleKey, 'home'>];

          if (live) {
            return (
              <Link
                key={m.key}
                to={m.path}
                className="card p-4 hover:shadow-sm hover:-translate-y-0.5 transition group flex flex-col"
              >
                <div className={classNames('w-9 h-9 rounded-lg flex items-center justify-center text-white', m.bg)}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="mt-3 text-sm font-semibold text-zinc-900">{m.name}</div>
                <div className="text-xs text-zinc-500 mt-1 leading-relaxed flex-1">{m.description}</div>
                <div className={classNames('mt-3 text-xs font-medium flex items-center gap-1', m.text)}>
                  进入 <ArrowRight className="w-3 h-3 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          }
          return (
            <div
              key={m.key}
              className="card p-4 border-dashed flex flex-col cursor-not-allowed grayscale opacity-60 select-none"
              aria-disabled
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-200 text-zinc-400">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="mt-3 text-sm font-semibold text-zinc-400">{m.name}</div>
              <div className="text-xs text-zinc-400 mt-1 leading-relaxed flex-1">{m.description}</div>
              <div className="mt-3 text-[10px] font-bold tracking-widest text-zinc-300">SOON</div>
            </div>
          );
        })}
        <div className="card p-4 border-dashed text-zinc-400 flex flex-col items-start cursor-not-allowed opacity-60" aria-disabled>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-200 text-zinc-400">
            <Plus className="w-4.5 h-4.5" />
          </div>
          <div className="mt-3 text-sm font-semibold text-zinc-400">新建空白</div>
          <div className="text-xs text-zinc-400 mt-1 leading-relaxed">不依赖素材，直接动手</div>
          <div className="mt-3 text-[10px] font-bold tracking-widest text-zinc-300">SOON</div>
        </div>
      </div>
    </section>
  );
}

/* === 3. 所有能力 === */
function AllFeatures() {
  return (
    <section>
      <SectionHeader title="所有能力" subtitle="灰色虚框 = 尚未开放，仅展示在路线上" />
      <div className="space-y-5 sm:space-y-6">
        {SECTIONS.map((key) => (
          <ModuleFeatureGrid key={key} mKey={key} />
        ))}
      </div>
    </section>
  );
}

function ModuleFeatureGrid({ mKey }: { mKey: Exclude<ModuleKey, 'home'> }) {
  const m = MODULES[mKey];
  const cards = HOME_CARDS[mKey];
  const moduleLive = MODULE_LIVE[mKey];
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2.5 px-0.5">
        <span className={classNames('w-1 h-3.5 rounded-sm', moduleLive ? m.bg : 'bg-zinc-300')} />
        <h3 className={classNames('text-sm font-bold tracking-tight', moduleLive ? m.text : 'text-zinc-400')}>{m.name}</h3>
        <span className="text-xs text-zinc-500">· {m.description}</span>
        {moduleLive ? (
          <Link to={m.path} className="ml-auto text-xs text-zinc-500 hover:text-zinc-900">
            打开 {m.name} →
          </Link>
        ) : (
          <span className="ml-auto text-[10px] font-bold tracking-widest text-zinc-300">SOON</span>
        )}
      </div>
      <div className="grid gap-2.5 sm:gap-3 grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {cards.map((c, i) => (
          <FeatureCard key={i} card={c} module={mKey} />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ card, module: mKey }: { card: HomeCard; module: Exclude<ModuleKey, 'home'> }) {
  const m = MODULES[mKey];
  const brand = card.brand ? BRANDS[card.brand] : null;
  const isPlaceholder = card.char === '+';
  const isLive = card.status === 'live' && !!card.to;
  const BrandIcon = brand?.Icon;

  if (isLive) {
    const iconBg = brand ? brand.bg : m.bg;
    return (
      <Link
        to={card.to!}
        className="card p-3 sm:p-3.5 min-h-[92px] flex flex-col transition group hover:-translate-y-0.5 hover:shadow-sm hover:border-zinc-300"
      >
        <div className="flex items-start gap-2.5 relative">
          <div
            className={classNames(
              'w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm shrink-0',
              iconBg,
            )}
          >
            {BrandIcon ? <BrandIcon className="w-4 h-4" /> : card.char}
          </div>
          <h4 className="text-sm font-bold leading-snug pt-1 text-zinc-900">{card.title}</h4>
          <span className="absolute top-0 right-0 px-1.5 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold tracking-wider flex items-center">
            LIVE
          </span>
        </div>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed line-clamp-2">{card.desc}</p>
      </Link>
    );
  }

  // SOON / disabled
  return (
    <div
      className="card p-3 sm:p-3.5 min-h-[92px] flex flex-col border-dashed cursor-not-allowed opacity-60 grayscale select-none"
      aria-disabled
    >
      <div className="flex items-start gap-2.5 relative">
        <div className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-500 font-bold text-sm shrink-0 bg-zinc-200">
          {BrandIcon ? <BrandIcon className="w-4 h-4" /> : isPlaceholder ? '+' : card.char}
        </div>
        <h4 className="text-sm font-bold leading-snug pt-1 text-zinc-400">{card.title}</h4>
        <span className="absolute top-0 right-0 text-[9px] text-zinc-300 font-bold tracking-wider">SOON</span>
      </div>
      <p className="mt-2 text-xs text-zinc-400 leading-relaxed line-clamp-2">{card.desc}</p>
    </div>
  );
}

/* === 4. 最近草稿（真实接口） === */
function RecentDrafts() {
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listDrafts()
      .then((d) => {
        if (alive) setDrafts(d);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section>
      <SectionHeader title="最近改写" subtitle="本地保存的草稿（来自 /studio/drafts）" />
      <div className="card">
        <div className="px-4 sm:px-5 py-3 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-zinc-400" />
            草稿箱
          </h2>
          <span className="text-xs text-zinc-500 tabular">
            共 {drafts?.length ?? '...'} 条
          </span>
        </div>
        {error && (
          <div className="px-4 sm:px-5 py-6 text-sm text-rose-600">
            读取草稿失败：{error}
            <div className="text-xs text-zinc-500 mt-1">检查后端 /studio 是否在 5174 端口运行</div>
          </div>
        )}
        {!error && drafts === null && (
          <div className="px-4 sm:px-5 py-6 text-sm text-zinc-400">读取中…</div>
        )}
        {!error && drafts && drafts.length === 0 && (
          <div className="px-4 sm:px-5 py-6 text-sm text-zinc-400 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            还没有草稿。去公众号挑一篇改写一下吧。
          </div>
        )}
        {!error && drafts && drafts.length > 0 && (
          <ul className="divide-y divide-zinc-100">
            {drafts.slice(0, 8).map((d) => (
              <li key={d.id} className="px-4 sm:px-5 py-3 flex items-center gap-3 hover:bg-zinc-50/60 transition">
                <span
                  className={classNames(
                    'chip text-[10px]',
                    d.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700',
                  )}
                >
                  {d.status === 'published' ? '已发布' : '草稿'}
                </span>
                <span className="flex-1 text-sm text-zinc-800 truncate">
                  {d.rewrittenTitle || d.sourceTitle}
                </span>
                <span className="text-xs text-zinc-400 shrink-0">{d.sourceAuthor}</span>
                <span className="text-xs text-zinc-400 shrink-0 tabular">{formatDate(d.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 px-0.5">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}
