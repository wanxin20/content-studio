import { useEffect, useState } from 'react';
import { Image as ImageIcon, Sparkles, Plus, Upload, Download } from 'lucide-react';
import PageTitle from '../../components/PageTitle';
import { MODULES } from '../../lib/module-meta';
import { picsum, classNames } from '../../lib/picsum';

const RATIOS = ['1:1', '4:5', '3:4', '16:9'];
const MODELS = ['SDXL', 'Flux', 'DALL·E 3'];

export default function MmImage() {
  const m = MODULES.multimodal;
  const [ratio, setRatio] = useState('4:5');
  const [model, setModel] = useState('SDXL');
  const [count, setCount] = useState(4);
  const [generating, setGenerating] = useState(false);
  const [generation, setGeneration] = useState(0);

  const start = () => {
    setGenerating(true);
    setGeneration((g) => g + 1);
  };

  // Stagger reveal of generated tiles
  const [revealed, setRevealed] = useState<number[]>([]);
  useEffect(() => {
    if (!generating) return;
    setRevealed([]);
    const timers: number[] = [];
    for (let i = 0; i < count; i++) {
      const t = window.setTimeout(() => {
        setRevealed((arr) => [...arr, i]);
        if (i === count - 1) setGenerating(false);
      }, 700 + i * 600);
      timers.push(t);
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation, count]);

  const tiles = Array.from({ length: count }, (_, i) => i);
  const ratioClass = ratio === '1:1' ? 'aspect-square' : ratio === '4:5' ? 'aspect-[4/5]' : ratio === '3:4' ? 'aspect-[3/4]' : 'aspect-video';

  return (
    <div>
      <PageTitle title="图片生成" subtitle="文生图 / 参考图，挑参数 → 一键 4 张" />

      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        <aside className="space-y-4">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">参考图</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square rounded-md overflow-hidden border border-zinc-200">
                <img src={picsum('ref-1', 200)} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-md overflow-hidden border border-zinc-200">
                <img src={picsum('ref-2', 200)} alt="" className="w-full h-full object-cover" />
              </div>
              <button className="aspect-square rounded-md border border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 hover:bg-zinc-50">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button className="mt-3 btn-outline w-full text-xs"><Upload className="w-3.5 h-3.5" /> 上传更多</button>
          </div>

          <div className="card p-4 space-y-4">
            <ParamGroup label="提示词">
              <textarea
                rows={3}
                defaultValue="极简通勤穿搭，秋日晨光，软调，干净背景"
                className="w-full text-sm px-3 py-2 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
              />
            </ParamGroup>
            <ParamGroup label="比例">
              <div className="grid grid-cols-4 gap-1">
                {RATIOS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatio(r)}
                    className={classNames(
                      'py-1.5 text-xs rounded-md border transition',
                      r === ratio ? `${m.tint} ${m.text} border-current font-semibold` : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50',
                    )}
                  >{r}</button>
                ))}
              </div>
            </ParamGroup>
            <ParamGroup label="模型">
              <div className="flex flex-wrap gap-1.5">
                {MODELS.map((mo) => (
                  <button
                    key={mo}
                    onClick={() => setModel(mo)}
                    className={classNames(
                      'chip border',
                      mo === model ? `${m.tint} ${m.text} border-current font-semibold` : 'bg-white text-zinc-600 border-zinc-200',
                    )}
                  >{mo}</button>
                ))}
              </div>
            </ParamGroup>
            <ParamGroup label="数量">
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 4, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={classNames(
                      'py-1.5 text-xs rounded-md border',
                      n === count ? `${m.tint} ${m.text} border-current font-semibold` : 'bg-white border-zinc-200 text-zinc-600',
                    )}
                  >{n}</button>
                ))}
              </div>
            </ParamGroup>
            <button onClick={start} className={classNames('w-full btn-primary', m.bg)}>
              <Sparkles className="w-3.5 h-3.5" />
              {generating ? '生成中…' : `生成 ${count} 张`}
            </button>
          </div>
        </aside>

        <section>
          <div className={classNames(
            'grid gap-3',
            count <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-2',
          )}>
            {tiles.map((i) => {
              const ready = revealed.includes(i);
              return (
                <div key={`${generation}-${i}`} className={classNames('card overflow-hidden group', ratioClass)}>
                  {ready ? (
                    <div className="relative h-full">
                      <img
                        src={picsum(`gen-${generation}-${i}`, 600, 750)}
                        alt={`生成结果 ${i + 1}`}
                        className="w-full h-full object-cover animate-fadeIn"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-end p-2">
                        <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/90 text-zinc-900 text-xs font-medium">
                          <Download className="w-3 h-3" /> 保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full bg-zinc-100 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[linear-gradient(110deg,#f4f4f5_8%,#e4e4e7_18%,#f4f4f5_33%)] bg-[length:200%_100%] animate-[shimmer_1.6s_infinite]" style={{ animationName: 'shimmer' }} />
                      <div className="relative text-center">
                        <ImageIcon className={classNames('w-6 h-6 mx-auto', m.text)} />
                        <p className={classNames('mt-2 text-xs font-medium', m.text)}>生成中…</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
        </section>
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
