import { useEffect, useState } from 'react';
import { Sparkles, Wand2, ImageIcon, Download, AlertTriangle, RefreshCw, ChevronRight, X } from 'lucide-react';
import PageTitle from '../../components/PageTitle';
import { MODULES } from '../../lib/module-meta';
import { classNames } from '../../lib/picsum';
import {
  listImageOptions, genImagePrompts, generateImage,
  type ImageProviderInfo, type ImagePrompt, type KeyLabel,
} from '../../lib/studio';

const m = MODULES.multimodal;

const ROLE_LABEL: Record<string, string> = { cover: '封面', content: '内容', ending: '结尾' };

/** 图片槽位:统一处理 已生成/生成中/出错/待生成 四态 + 缩放/下载,供两个 Tab 复用。 */
function ImageSlot({
  url, dataUrl, generating, error, onZoom, downloadName, className,
}: {
  url?: string; dataUrl?: string; generating?: boolean; error?: string;
  onZoom: (u: string) => void; downloadName: string; className?: string;
}) {
  const src = url || dataUrl;
  return (
    <div className={classNames('w-full h-full relative flex items-center justify-center', className)}>
      {src ? (
        <>
          <img src={src} alt="" className="w-full h-full object-cover cursor-zoom-in" onClick={() => onZoom(src)} />
          <a href={src} download={downloadName} target="_blank" rel="noreferrer"
            className="absolute top-2 right-2 w-7 h-7 rounded-md bg-white/90 hover:bg-white flex items-center justify-center text-zinc-700" title="下载">
            <Download className="w-3.5 h-3.5" />
          </a>
        </>
      ) : error ? (
        <div className="flex flex-col items-center justify-center text-center px-2 text-rose-600">
          <AlertTriangle className="w-5 h-5" /><p className="mt-1 text-[10px] leading-tight">{error}</p>
        </div>
      ) : generating ? (
        <div className="text-center text-zinc-400">
          <RefreshCw className={classNames('w-5 h-5 mx-auto animate-spin', m.text)} /><p className="mt-1.5 text-xs">生成中…</p>
        </div>
      ) : (
        <div className="text-center text-zinc-400"><ImageIcon className="w-7 h-7 mx-auto" /><p className="mt-1 text-xs">待生成</p></div>
      )}
    </div>
  );
}

type TabKey = 't2i' | 'xhs' | 'ref';
const TABS: { key: TabKey; label: string; soon?: boolean }[] = [
  { key: 't2i', label: '文生图' },
  { key: 'xhs', label: '小红书图文' },
  { key: 'ref', label: '参考图', soon: true },
];

export default function MmImage() {
  const [tab, setTab] = useState<TabKey>('t2i');
  const [providers, setProviders] = useState<ImageProviderInfo[]>([]);
  const [styles, setStyles] = useState<KeyLabel[]>([]);
  const [layouts, setLayouts] = useState<KeyLabel[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    listImageOptions().then((o) => { setProviders(o.providers); setStyles(o.styles); setLayouts(o.layouts); });
  }, []);

  return (
    <div>
      <PageTitle title="图片生成" subtitle="通义万象（Qwen-Image）· 模型可选 · 按张计费" />

      {/* 内部 Tab */}
      <div className="flex gap-1 border-b border-zinc-200 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => !t.soon && setTab(t.key)}
            disabled={t.soon}
            className={classNames(
              'px-4 py-2.5 text-sm -mb-px border-b-2 transition inline-flex items-center gap-1.5',
              t.key === tab
                ? `${m.text} border-current font-semibold`
                : t.soon
                ? 'text-zinc-300 border-transparent cursor-not-allowed'
                : 'text-zinc-500 border-transparent hover:text-zinc-900',
            )}
          >
            {t.label}
            {t.soon && <span className="text-[9px] font-bold tracking-wider">SOON</span>}
          </button>
        ))}
      </div>

      {tab === 't2i' && <TextToImage providers={providers} onZoom={setLightbox} />}
      {tab === 'xhs' && <XhsInfographic providers={providers} styles={styles} layouts={layouts} onZoom={setLightbox} />}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" />
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><X className="w-6 h-6" /></button>
        </div>
      )}
    </div>
  );
}

/* ============ 共用:模型选择条 ============ */
function useProviderModel(providers: ImageProviderInfo[]) {
  const [providerId, setProviderId] = useState('dashscope');
  const [model, setModel] = useState('');
  const [ar, setAr] = useState('3:4');
  useEffect(() => {
    const first = providers.find((p) => p.configured) || providers[0];
    if (first) { setProviderId(first.id); setModel(first.defaultModel); }
  }, [providers]);
  const active = providers.find((p) => p.id === providerId);
  return { providerId, setProviderId, model, setModel, ar, setAr, active };
}

function ModelBar({
  providers, providerId, setProviderId, model, setModel, ar, setAr, active,
}: ReturnType<typeof useProviderModel> & { providers: ImageProviderInfo[] }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={providerId}
        onChange={(v) => { setProviderId(v); const p = providers.find((x) => x.id === v); if (p) setModel(p.defaultModel); }}
        options={providers.map((p) => ({ value: p.id, label: p.name + (p.configured ? '' : '（未配 key）') }))}
      />
      {active && <Select value={model} onChange={setModel} options={active.models.map((mm) => ({ value: mm.id, label: mm.label }))} />}
      <Select value={ar} onChange={setAr} options={(active?.aspectRatios || ['3:4']).map((r) => ({ value: r, label: r }))} />
    </div>
  );
}

function NoKeyBanner({ active }: { active?: ImageProviderInfo }) {
  if (!active || active.configured) return null;
  return (
    <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-center gap-2">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {active.name} 未配置 API key，请在后端 .env 设置 DASHSCOPE_API_KEY 后重启。
    </div>
  );
}

/* ============ Tab 1: 文生图 ============ */
interface ResultImg { key: number; url?: string; dataUrl?: string; generating?: boolean; error?: string }

function TextToImage({ providers, onZoom }: { providers: ImageProviderInfo[]; onZoom: (u: string) => void }) {
  const pm = useProviderModel(providers);
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<ResultImg[]>([]);
  const [running, setRunning] = useState(false);
  const noKey = pm.active && !pm.active.configured;

  const run = async () => {
    if (!prompt.trim() || running) return;
    setRunning(true);
    const slots: ResultImg[] = Array.from({ length: count }, (_, i) => ({ key: Date.now() + i, generating: true }));
    setResults(slots);
    for (const slot of slots) {
      const res = await generateImage({ prompt, provider: pm.providerId, model: pm.model, ar: pm.ar, quality: '2k' });
      setResults((rs) => rs.map((r) => r.key === slot.key
        ? (res.ok ? { ...r, generating: false, url: res.url, dataUrl: res.dataUrl } : { ...r, generating: false, error: res.error || '生成失败' })
        : r));
    }
    setRunning(false);
  };

  const arClass = pm.ar === '1:1' ? 'aspect-square' : pm.ar === '16:9' ? 'aspect-video' : pm.ar === '4:3' ? 'aspect-[4/3]' : 'aspect-[3/4]';

  return (
    <div>
      <section className="card p-4 sm:p-5 mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="描述你想要的画面，越具体越好。如「极简风格的咖啡品牌海报，米色背景，居中大字标题『慢一点』，柔和光影」"
          className="w-full text-sm px-3 py-2.5 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
        />
        <div className="flex flex-wrap items-end gap-3 mt-3">
          <ModelBar providers={providers} {...pm} />
          <Field label={`张数：${count}`}>
            <input type="range" min={1} max={4} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-28 accent-emerald-600" />
          </Field>
          <button onClick={run} disabled={running || !prompt.trim() || !!noKey} className={classNames('btn-primary text-sm hover:opacity-90 disabled:opacity-50 ml-auto', m.bg)}>
            <Sparkles className="w-4 h-4" /> {running ? '生成中…' : `生成 ${count} 张`}
          </button>
        </div>
        <NoKeyBanner active={pm.active} />
      </section>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {results.map((r) => (
            <div key={r.key} className={classNames('card overflow-hidden bg-zinc-100', arClass)}>
              <ImageSlot url={r.url} dataUrl={r.dataUrl} generating={r.generating} error={r.error} onZoom={onZoom} downloadName="image.png" />
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <ImageIcon className={classNames('w-10 h-10 mx-auto', m.text, 'opacity-40')} />
          <p className="mt-3 text-sm font-semibold text-zinc-900">输入描述，直接生成图片</p>
          <p className="text-xs text-zinc-500 mt-1">通义万象擅长中文文字排版，适合带标题的海报/封面。</p>
        </div>
      )}
    </div>
  );
}

/* ============ Tab 2: 小红书图文（两步式）============ */
interface PromptCard extends ImagePrompt { key: number; image?: { url?: string; dataUrl?: string }; generating?: boolean; error?: string }

function XhsInfographic({ providers, styles, layouts, onZoom }: { providers: ImageProviderInfo[]; styles: KeyLabel[]; layouts: KeyLabel[]; onZoom: (u: string) => void }) {
  const pm = useProviderModel(providers);
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('notion');
  const [layout, setLayout] = useState('balanced');
  const [count, setCount] = useState(4);
  const [extra, setExtra] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [cards, setCards] = useState<PromptCard[]>([]);
  const noKey = pm.active && !pm.active.configured;

  const doPrompts = async () => {
    if (!topic.trim()) return;
    setPromptLoading(true);
    setPromptError(null);
    const res = await genImagePrompts({ topic, style, layout, count, extra });
    if (res.ok && res.prompts) setCards(res.prompts.map((p, i) => ({ ...p, key: i })));
    else setPromptError(res.error || '生成提示词失败');
    setPromptLoading(false);
  };

  const genOne = async (key: number) => {
    const card = cards.find((c) => c.key === key);
    if (!card) return;
    setCards((cs) => cs.map((c) => (c.key === key ? { ...c, generating: true, error: undefined } : c)));
    const res = await generateImage({ prompt: card.prompt, provider: pm.providerId, model: pm.model, ar: pm.ar, quality: '2k' });
    setCards((cs) => cs.map((c) => c.key === key
      ? (res.ok ? { ...c, generating: false, image: { url: res.url, dataUrl: res.dataUrl } } : { ...c, generating: false, error: res.error || '生成失败' })
      : c));
  };
  const genAll = async () => { for (const c of cards) if (!c.image) await genOne(c.key); };
  const editPrompt = (key: number, val: string) => setCards((cs) => cs.map((c) => (c.key === key ? { ...c, prompt: val } : c)));
  const generatedCount = cards.filter((c) => c.image).length;

  return (
    <div>
      <section className="card p-4 sm:p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className={classNames('w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold', m.bg)}>1</span>
          <h2 className="text-sm font-semibold text-zinc-900">生成图片提示词（一组：封面 + 内容 + 结尾）</h2>
        </div>
        <textarea
          value={topic} onChange={(e) => setTopic(e.target.value)} rows={2}
          placeholder="输入主题/选题，如「新手如何挑选第一支口红」「3 个被低估的 AI 写作技巧」"
          className="w-full text-sm px-3 py-2.5 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
        />
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <Field label="风格"><Select value={style} onChange={setStyle} options={styles.map((s) => ({ value: s.key, label: s.label }))} /></Field>
          <Field label="布局"><Select value={layout} onChange={setLayout} options={layouts.map((l) => ({ value: l.key, label: l.label }))} /></Field>
        </div>
        <div className="flex flex-wrap items-end gap-3 mt-3">
          <Field label={`张数：${count}`}>
            <input type="range" min={2} max={10} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-40 accent-emerald-600" />
          </Field>
          <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="额外要求（可选）：配色 / 受众 / 卖点…"
            className="flex-1 min-w-[180px] text-sm px-3 py-2 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
          <button onClick={doPrompts} disabled={promptLoading || !topic.trim()} className={classNames('btn-primary text-sm hover:opacity-90 disabled:opacity-50', m.bg)}>
            <Wand2 className="w-4 h-4" /> {promptLoading ? '生成中…' : cards.length ? '重新生成提示词' : '生成提示词'}
          </button>
        </div>
        {promptError && (
          <div className="mt-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {promptError}
          </div>
        )}
      </section>

      {cards.length > 0 && (
        <section className="card p-4 sm:p-5 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={classNames('w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold', m.bg)}>2</span>
              <h2 className="text-sm font-semibold text-zinc-900">生成图片</h2>
            </div>
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              <ModelBar providers={providers} {...pm} />
              <button onClick={genAll} disabled={!!noKey} className={classNames('btn-primary text-sm hover:opacity-90 disabled:opacity-50', m.bg)}>
                <Sparkles className="w-4 h-4" /> 全部生成（{cards.length} 张）
              </button>
            </div>
          </div>
          <NoKeyBanner active={pm.active} />
          <p className="mt-2 text-[11px] text-zinc-400">已生成 {generatedCount}/{cards.length} · 顺序生成避免限流</p>
        </section>
      )}

      {cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.key} className="card overflow-hidden flex flex-col">
              <div className="aspect-[3/4] bg-zinc-100 relative">
                <ImageSlot url={c.image?.url} dataUrl={c.image?.dataUrl} generating={c.generating} error={c.error} onZoom={onZoom} downloadName={`xhs-${c.key + 1}.png`} />
                <span className={classNames('absolute top-2 left-2 chip text-[10px] z-10', m.tint, m.text)}>{ROLE_LABEL[c.role] || c.role}</span>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <p className="text-sm font-semibold text-zinc-900 mb-1.5">{c.title}</p>
                <textarea value={c.prompt} onChange={(e) => editPrompt(c.key, e.target.value)} rows={4}
                  className="w-full text-xs text-zinc-600 leading-relaxed px-2.5 py-2 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none flex-1" />
                {c.error && <p className="mt-1.5 text-[11px] text-rose-600">{c.error}</p>}
                <button onClick={() => genOne(c.key)} disabled={c.generating || !!noKey} className="mt-2 btn-outline text-xs disabled:opacity-50">
                  {c.generating ? '生成中…' : c.image ? '重新生成这张' : '生成这张'} <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : !promptLoading && (
        <div className="card p-12 text-center">
          <Wand2 className={classNames('w-10 h-10 mx-auto', m.text, 'opacity-40')} />
          <p className="mt-3 text-sm font-semibold text-zinc-900">先写主题，生成一组小红书图文提示词</p>
          <p className="text-xs text-zinc-500 mt-1">提示词可逐条编辑后再生成图片。第一步用 LLM 基本免费，第二步按图计费。</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-zinc-500 mb-1">{label}</label>{children}</div>;
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="text-sm px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
