import { useState } from 'react';
import { Play, Upload, Sparkles, Plus } from 'lucide-react';
import PageTitle from '../../components/PageTitle';
import { MODULES } from '../../lib/module-meta';
import { picsum, classNames } from '../../lib/picsum';

const DURATIONS = ['4s', '6s', '10s', '20s'];
const STYLES = ['真实', '动漫', '电影感', '水彩'];

export default function MmVideo() {
  const m = MODULES.multimodal;
  const [duration, setDuration] = useState('6s');
  const [style, setStyle] = useState('电影感');

  return (
    <div>
      <PageTitle title="视频生成" subtitle="首尾帧 + 文字提示 → 动起来" />

      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        <aside className="space-y-4">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">关键帧</h3>
            <div className="grid grid-cols-2 gap-2">
              <FrameSlot label="首帧" seed="frame-start" />
              <FrameSlot label="尾帧" seed="frame-end" />
            </div>
            <button className="mt-3 btn-outline w-full text-xs"><Upload className="w-3.5 h-3.5" /> 从本地上传</button>
          </div>

          <div className="card p-4 space-y-4">
            <ParamGroup label="动作描述">
              <textarea
                rows={3}
                defaultValue="人物缓慢转身，光线由冷转暖"
                className="w-full text-sm px-3 py-2 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
              />
            </ParamGroup>
            <ParamGroup label="时长">
              <div className="grid grid-cols-4 gap-1">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={classNames('py-1.5 text-xs rounded-md border', d === duration ? `${m.tint} ${m.text} border-current font-semibold` : 'bg-white border-zinc-200 text-zinc-600')}
                  >{d}</button>
                ))}
              </div>
            </ParamGroup>
            <ParamGroup label="风格">
              <div className="flex flex-wrap gap-1.5">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={classNames('chip border', s === style ? `${m.tint} ${m.text} border-current font-semibold` : 'bg-white text-zinc-600 border-zinc-200')}
                  >{s}</button>
                ))}
              </div>
            </ParamGroup>
            <button className={classNames('w-full btn-primary', m.bg)}>
              <Sparkles className="w-3.5 h-3.5" /> 生成视频
            </button>
          </div>
        </aside>

        <section className="card overflow-hidden">
          <div className="aspect-video bg-zinc-900 relative flex items-center justify-center">
            <img
              src={picsum('video-preview', 1200, 675)}
              alt="预览"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <button className="relative w-16 h-16 rounded-full bg-white/95 hover:bg-white text-zinc-900 flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
            </button>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
              <span className={classNames('chip', m.tint, m.text)}>已生成 · {duration}</span>
              <span className="text-white/80">{style}</span>
            </div>
          </div>
          <div className="p-4 border-t border-zinc-200 flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm font-semibold text-zinc-900">短片 · 极简通勤</p>
              <p className="text-xs text-zinc-500 mt-0.5">基于首尾帧 + 描述生成</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-outline text-xs">下载</button>
              <button className={classNames('btn-primary text-xs', m.bg)}>存到生成物</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function FrameSlot({ label, seed }: { label: string; seed: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-zinc-500">{label}</p>
      <div className="aspect-video rounded-md overflow-hidden border border-zinc-200 relative group">
        <img src={picsum(seed, 400, 225)} alt={label} className="w-full h-full object-cover" />
        <button className="absolute inset-0 bg-zinc-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ParamGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}
