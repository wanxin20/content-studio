import { useState } from 'react';
import { Plus, Layers } from 'lucide-react';
import PageTitle from '../../components/PageTitle';
import { ASSETS, ASSET_KIND_LABEL, type AssetKind } from '../../data/mock/assets';
import { MODULES } from '../../lib/module-meta';
import { classNames } from '../../lib/picsum';

const KINDS: ({ value: AssetKind | 'all'; label: string })[] = [
  { value: 'all', label: '全部' },
  { value: 'avatar', label: '数字人' },
  { value: 'voice', label: '音频' },
  { value: 'template', label: '模板' },
];

export default function MgAssets() {
  const m = MODULES.manage;
  const [kind, setKind] = useState<AssetKind | 'all'>('all');
  const list = ASSETS.filter((a) => kind === 'all' || a.kind === kind);

  return (
    <div>
      <PageTitle
        title="资产"
        subtitle="可复用的数字人 / 音频 / 模板"
        actions={<button className={classNames('btn-primary text-xs', m.bg)}><Plus className="w-3.5 h-3.5" /> 添加资产</button>}
      />

      <div className="flex flex-wrap gap-1.5 mb-4">
        {KINDS.map((k) => (
          <button
            key={k.value}
            onClick={() => setKind(k.value)}
            className={classNames(
              'chip border',
              kind === k.value ? `${m.tint} ${m.text} border-current font-semibold` : 'bg-white text-zinc-600 border-zinc-200',
            )}
          >{k.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {list.map((a) => (
          <article key={a.id} className="card overflow-hidden flex flex-col group">
            <div className="aspect-square bg-zinc-100 relative">
              <img src={a.cover} alt={a.name} className="w-full h-full object-cover" />
              <span className={classNames('absolute top-2 left-2 chip', m.tint, m.text)}>
                {ASSET_KIND_LABEL[a.kind]}
              </span>
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <p className="text-sm font-semibold text-zinc-900 truncate">{a.name}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{a.meta}</p>
              <div className="mt-2 flex items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1 text-zinc-500">
                  <Layers className="w-3 h-3" />
                  <span className="tabular">{a.usedCount}</span> 次复用
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {a.tags.map((t) => (
                  <span key={t} className="chip bg-zinc-100 text-zinc-500 text-[10px]">#{t}</span>
                ))}
              </div>
              <button className={classNames('mt-3 btn-primary text-xs', m.bg, 'hover:opacity-90')}>
                复用
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
