import { useState } from 'react';
import { FileText, ImageIcon as ImgIcon, Video, User, Send, MoreHorizontal } from 'lucide-react';
import PageTitle from '../../components/PageTitle';
import { OUTPUT_ITEMS, type OutputStatus, type OutputKind } from '../../data/mock/outputs';
import { MODULES } from '../../lib/module-meta';
import { classNames } from '../../lib/picsum';

const STATUS_LABEL: Record<OutputStatus | 'all', string> = { all: '全部', draft: '草稿', ready: '待发', published: '已发布' };
const STATUS_BG: Record<OutputStatus, string> = {
  draft: 'bg-zinc-100 text-zinc-600',
  ready: 'bg-amber-50 text-amber-700',
  published: 'bg-emerald-50 text-emerald-700',
};
const KIND_ICONS: Record<OutputKind, React.ComponentType<{ className?: string }>> = {
  text: FileText,
  image: ImgIcon,
  video: Video,
  avatar: User,
};
const KIND_LABEL: Record<OutputKind, string> = { text: '文本', image: '图片', video: '视频', avatar: '数字人' };

export default function MgOutputs() {
  const m = MODULES.manage;
  const [filter, setFilter] = useState<OutputStatus | 'all'>('all');
  const list = OUTPUT_ITEMS.filter((o) => filter === 'all' || o.status === filter);

  return (
    <div>
      <PageTitle
        title="生成物"
        subtitle="所有由 AI 产出的内容，从草稿到已发布"
      />

      <div className="flex flex-wrap gap-1.5 mb-4">
        {(['all', 'draft', 'ready', 'published'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={classNames(
              'chip border',
              filter === s ? `${m.tint} ${m.text} border-current font-semibold` : 'bg-white text-zinc-600 border-zinc-200',
            )}
          >{STATUS_LABEL[s]}</button>
        ))}
      </div>

      <div className="card divide-y divide-zinc-100">
        {list.map((o) => {
          const Icon = KIND_ICONS[o.kind];
          return (
            <div key={o.id} className="px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3 sm:gap-4 hover:bg-zinc-50/60">
              {o.cover ? (
                <img src={o.cover} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-md object-cover shrink-0" />
              ) : (
                <div className={classNames('w-14 h-14 sm:w-16 sm:h-16 rounded-md flex items-center justify-center shrink-0', m.tint)}>
                  <Icon className={classNames('w-6 h-6', m.text)} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={classNames('chip', m.tint, m.text, 'text-[10px]')}>{KIND_LABEL[o.kind]}</span>
                  <span className={classNames('chip text-[10px]', STATUS_BG[o.status])}>{STATUS_LABEL[o.status]}</span>
                  <span className="text-[10px] text-zinc-400">· {o.updatedAgo}</span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-zinc-900 truncate">{o.title}</p>
                {o.platforms.length > 0 && (
                  <p className="mt-0.5 text-xs text-zinc-500">→ {o.platforms.join(' · ')}</p>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2">
                {o.status !== 'published' && (
                  <button className={classNames('btn-primary text-xs', m.bg, 'hover:opacity-90')}>
                    <Send className="w-3.5 h-3.5" /> 发布
                  </button>
                )}
                <button className="btn-ghost !p-2"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
