import { useState } from 'react';
import { Plus, Lightbulb } from 'lucide-react';
import PageTitle from '../../components/PageTitle';
import { INSPIRATIONS } from '../../data/mock/inspirations';
import { MODULES } from '../../lib/module-meta';
import { classNames } from '../../lib/picsum';

export default function LibraryInspiration() {
  const m = MODULES.library;
  const [drafting, setDrafting] = useState(false);

  return (
    <div>
      <PageTitle
        title="灵感"
        subtitle="你的私人灵感簿，随手记下选题/比喻/观点"
        actions={
          <button onClick={() => setDrafting(true)} className={classNames('btn-primary', m.bg)}>
            <Plus className="w-3.5 h-3.5" /> 记一个
          </button>
        }
      />

      {drafting && (
        <div className="card p-4 mb-4 animate-fadeIn">
          <input
            placeholder="标题（一句话）"
            className="w-full text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none"
            autoFocus
          />
          <textarea
            placeholder="展开说说…"
            className="w-full mt-2 text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-wrap gap-1.5">
              <span className="chip bg-zinc-100 text-zinc-500">+ 标签</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDrafting(false)} className="btn-ghost text-xs">取消</button>
              <button onClick={() => setDrafting(false)} className={classNames('btn-primary text-xs', m.bg)}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {INSPIRATIONS.map((i) => (
          <article key={i.id} className="card p-4 hover:shadow-sm transition">
            <div className="flex items-start gap-3">
              <span className={classNames('w-7 h-7 rounded-md flex items-center justify-center shrink-0', m.tint)}>
                <Lightbulb className={classNames('w-3.5 h-3.5', m.text)} />
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-900 leading-snug">{i.title}</h3>
                <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">{i.body}</p>
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  {i.tags.map((t) => (
                    <span key={t} className={classNames('chip', m.tint, m.text)}>#{t}</span>
                  ))}
                  <span className="text-[10px] text-zinc-400 ml-auto">{i.createdAgo}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
