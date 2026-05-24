import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listDrafts, studioHealth } from '../lib/studio';
import BackgroundFX from '../components/BackgroundFX';

type CardStatus = 'live' | 'beta' | 'soon';
type Accent = 'cyan' | 'magenta' | 'acid';

interface Feature {
  code: string;
  zh: string;
  desc: string;
  to: string;
  status: CardStatus;
}

interface Section {
  index: string;
  name: string;
  ascii: string;
  english: string;
  tagline: string;
  accent: Accent;
  features: Feature[];
}

const SECTIONS: Section[] = [
  {
    index: '01',
    name: '微信公众号',
    ascii: 'WEIXIN',
    english: 'Public Account · Network',
    tagline: '接入 RSS / 改写 / 一键发到草稿箱。',
    accent: 'cyan',
    features: [
      {
        code: 'SUBSCRIBE',
        zh: '订阅采集',
        desc: '接入 we-mp-rss,实时跟踪公众号文章流。',
        to: '/wechat/feeds',
        status: 'live',
      },
      {
        code: 'REWRITE',
        zh: 'AI 改写',
        desc: '一键改写文章,保留事实,换风格、换语气、换标题。',
        to: '/wechat/drafts',
        status: 'live',
      },
      {
        code: 'PUBLISH',
        zh: '草稿发布',
        desc: '审稿后发到微信公众号后台草稿箱。',
        to: '/wechat/published',
        status: 'beta',
      },
    ],
  },
  {
    index: '02',
    name: '小红书',
    ascii: 'XIAOHONGSHU',
    english: 'RedNote · Visual Stack',
    tagline: '抓取笔记 / 重写文案 / 生成图文。',
    accent: 'magenta',
    features: [
      {
        code: 'COLLECT',
        zh: '数据获取',
        desc: '抓取目标账号 / 话题的笔记内容、配图、互动数据。',
        to: '/xhs/feeds',
        status: 'soon',
      },
      {
        code: 'REWRITE',
        zh: '图文改写',
        desc: '重写文案、重排图序、套用爆款标题模板。',
        to: '/xhs/rewrite',
        status: 'soon',
      },
      {
        code: 'GENERATE',
        zh: '图文生成',
        desc: '从选题自动生成 6–9 张小红书风格笔记图。',
        to: '/xhs/generate',
        status: 'soon',
      },
    ],
  },
  {
    index: '03',
    name: '抖音',
    ascii: 'DOUYIN',
    english: 'Short Video · Pipeline',
    tagline: '下载视频 / 提脚本 / 数字人复述。',
    accent: 'acid',
    features: [
      {
        code: 'INGEST',
        zh: '视频获取',
        desc: '下载短视频原文件,保留封面与互动快照。',
        to: '/douyin/feeds',
        status: 'soon',
      },
      {
        code: 'TRANSCRIBE',
        zh: '文案提取',
        desc: 'ASR 提取字幕脚本,自动分段与人物标记。',
        to: '/douyin/script',
        status: 'soon',
      },
      {
        code: 'AVATAR',
        zh: '数字人生成',
        desc: '用提取出的脚本驱动数字人,生成新短视频。',
        to: '/douyin/avatar',
        status: 'soon',
      },
    ],
  },
];

const ACCENT_HEX: Record<Accent, string> = {
  cyan: '#00E5FF',
  magenta: '#FF2D55',
  acid: '#A3FF12',
};

export default function Home() {
  const [stats, setStats] = useState({ sources: 2, drafts: 0, published: 0 });
  const [model, setModel] = useState<string>('—');
  const [clock, setClock] = useState<string>('');

  useEffect(() => {
    listDrafts()
      .then((ds) => {
        setStats({
          sources: 2,
          drafts: ds.filter((d) => d.status === 'draft').length,
          published: ds.filter((d) => d.status === 'published').length,
        });
      })
      .catch(() => {});
    studioHealth().then((h) => h && setModel(h.llm.model));

    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      setClock(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen bg-bg text-fg font-sans overflow-hidden">
      <div className="fixed inset-0 grid-bg opacity-50 pointer-events-none animate-drift z-0" aria-hidden />
      <BackgroundFX palette="home" />

      <div className="relative z-10">
        <TopNav clock={clock} />

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-8 pt-20 pb-24 relative">
          <div className="grid grid-cols-12 gap-8 items-start">
            <div className="col-span-12 lg:col-span-7 animate-fade-up [animation-delay:60ms]">
              <div className="flex items-center gap-3 mb-8">
                <span className="status-dot" />
                <span className="bracket text-cyan glow-cyan">SYS · LIVE</span>
                <span className="font-mono text-[10px] uppercase tracking-widest2 text-fg-faint">
                  RUNTIME ·
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest2 text-amber tabular">
                  {clock}
                </span>
              </div>

              <h1 className="font-sans font-bold leading-[0.92] tracking-tightish text-balance">
                <span className="block text-[clamp(36px,6vw,80px)] text-fg">
                  <span className="font-mono text-fg-faint mr-3">&lt;</span>
                  STUDIO
                  <span className="font-mono text-fg-faint ml-3">/&gt;</span>
                </span>
                <span className="block text-[clamp(48px,8vw,120px)] font-zh font-black text-fg mt-2 glow-cyan">
                  内容工坊
                </span>
              </h1>

              <p className="font-zh text-lg text-fg-muted mt-10 max-w-xl leading-relaxed">
                端到端内容生产流水线 ——
                从 <span className="text-cyan glow-cyan">抓取</span>,
                到 <span className="text-magenta glow-mag">改写</span>,
                再到 <span className="text-acid glow-acid">分发</span>。
                <br />
                <span className="font-mono text-sm text-fg-faint tracking-wider">
                  &nbsp;&nbsp;&nbsp;&nbsp;// 不是一堆零碎工具,而是一台连贯的机器。
                </span>
              </p>
            </div>

            {/* Right: HUD readout panel */}
            <div className="col-span-12 lg:col-span-5 animate-fade-up [animation-delay:200ms]">
              <div className="relative bg-bg-panel/80 border border-edge backdrop-blur-sm">
                <div className="absolute inset-0 grid-bg-fine opacity-40 pointer-events-none" />

                {/* Corner ticks for the panel itself */}
                <span className="absolute top-0 left-0 w-3 h-px bg-cyan/60" />
                <span className="absolute top-0 left-0 w-px h-3 bg-cyan/60" />
                <span className="absolute top-0 right-0 w-3 h-px bg-cyan/60" />
                <span className="absolute top-0 right-0 w-px h-3 bg-cyan/60" />
                <span className="absolute bottom-0 left-0 w-3 h-px bg-cyan/60" />
                <span className="absolute bottom-0 left-0 w-px h-3 bg-cyan/60" />
                <span className="absolute bottom-0 right-0 w-3 h-px bg-cyan/60" />
                <span className="absolute bottom-0 right-0 w-px h-3 bg-cyan/60" />

                {/* Header */}
                <div className="relative px-5 py-3 border-b border-edge flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-cyan glow-cyan tracking-widest2">
                      SYS · STATS
                    </span>
                    <span className="font-mono text-[9px] text-fg-dim">REV 003</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="status-dot amber" />
                    <span className="font-mono text-[10px] text-amber tracking-widest2">REC</span>
                  </div>
                </div>

                {/* 3-column HUD readout */}
                <div className="relative grid grid-cols-3 divide-x divide-edge">
                  <StatCol label="SOURCES"   value={stats.sources}   unit="个" accent="cyan"  />
                  <StatCol label="DRAFTS"    value={stats.drafts}    unit="篇" accent="amber" />
                  <StatCol label="PUBLISHED" value={stats.published} unit="篇" accent="acid"  />
                </div>

                {/* Footer */}
                <div className="relative px-5 py-3 border-t border-edge flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider">
                    <span className="text-fg-dim">LLM</span>
                    <span className="text-fg-dim">·</span>
                    <span className="text-fg">{model}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="status-dot" />
                    <span className="font-mono text-[10px] text-cyan glow-cyan tracking-widest2">READY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* SECTIONS */}
        <div className="max-w-7xl mx-auto px-8">
          {SECTIONS.map((s, i) => (
            <SectionBlock key={s.index} section={s} animDelay={300 + i * 120} />
          ))}
        </div>

        {/* FOOTER */}
        <footer className="max-w-7xl mx-auto px-8 pt-16 pb-12">
          {/* Amber accent rule above footer */}
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-12 bg-amber/60" style={{ boxShadow: '0 0 8px rgba(255,184,0,0.4)' }} />
            <span className="font-mono text-[10px] tracking-widest2 text-amber">SIGNAL OK</span>
            <span className="flex-1 hairline" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-4 gap-x-8 font-mono text-[10px] uppercase tracking-widest2 text-fg-faint">
            <Cell label="NODE" value="LOCALHOST" />
            <Cell label="DATA" value=":8001" />
            <Cell label="MODEL" value={model} />
            <Cell label="UPTIME" value={clock} accent="amber" />
            <Cell label="REV" value="v0.3" />
          </div>
          <div className="mt-8 font-zh italic text-fg-faint text-sm tracking-wider">
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber/70">&gt;</span> 故事才是人类传递知识的母语。
          </div>
        </footer>
      </div>
    </div>
  );
}

// ============== StatCol ==============
type StatAccent = 'cyan' | 'magenta' | 'acid' | 'amber';
function StatCol({ label, value, unit, accent }: { label: string; value: number; unit: string; accent: StatAccent }) {
  const colors = {
    cyan:    { text: 'text-cyan',    glow: 'glow-cyan', bar: '#00E5FF', glowOn: true  },
    magenta: { text: 'text-magenta', glow: 'glow-mag',  bar: '#FF2D55', glowOn: true  },
    acid:    { text: 'text-acid',    glow: 'glow-acid', bar: '#A3FF12', glowOn: true  },
    amber:   { text: 'text-amber',   glow: '',          bar: '#FFB800', glowOn: false },
  } as const;
  const c = colors[accent];
  return (
    <div className="relative px-5 py-5 flex flex-col items-start gap-2 group">
      {/* Label */}
      <div className="font-mono text-[10px] uppercase tracking-widest2 text-fg-faint">
        {label}
      </div>

      {/* Big number + unit pinned right next to it */}
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className={`font-mono tabular text-[44px] ${c.text} ${c.glow} font-medium leading-none`}>
          {String(value).padStart(2, '0')}
        </span>
        <span className="font-zh text-fg-muted text-[11px]">{unit}</span>
      </div>

      {/* Accent bar */}
      <div
        className="h-px w-8 mt-2"
        style={{
          background: c.bar,
          boxShadow: c.glowOn ? `0 0 6px ${c.bar}` : 'none',
        }}
      />

      {/* Tiny status under bar */}
      <div className="font-mono text-[9px] tracking-widest2 text-fg-dim mt-0.5">
        {value === 0 ? '— —' : 'OK'}
      </div>
    </div>
  );
}

// ============== Cell ==============
function Cell({ label, value, accent }: { label: string; value: string; accent?: 'amber' }) {
  const cls = accent === 'amber' ? 'text-amber' : 'text-fg';
  return (
    <div>
      <div className="text-fg-dim text-[9px] mb-1">{label}</div>
      <div className={`text-[11px] tabular ${cls}`}>{value}</div>
    </div>
  );
}

// ============== Section Block ==============
function SectionBlock({ section, animDelay }: { section: Section; animDelay: number }) {
  const accentHex = ACCENT_HEX[section.accent];
  const dotCls = section.accent === 'cyan' ? '' : section.accent === 'magenta' ? 'mag' : 'acid';
  const glowCls = section.accent === 'cyan' ? 'glow-cyan' : section.accent === 'magenta' ? 'glow-mag' : 'glow-acid';

  return (
    <section
      className="py-16 md:py-24 border-t border-edge animate-fade-up relative"
      style={{ animationDelay: `${animDelay}ms` }}
    >
      {/* Section label strip */}
      <div className="flex items-center gap-4 mb-12">
        <span
          className={`font-mono text-sm font-medium tracking-widest2 ${glowCls}`}
          style={{ color: accentHex }}
        >
          [{section.index}]
        </span>
        <span className="font-mono text-xs tracking-widest2 text-fg-muted">
          {section.ascii}
        </span>
        <span className="text-fg-dim font-mono text-xs">·</span>
        <span className="font-mono text-xs text-fg-faint italic">{section.english}</span>
        <div className="flex-1 h-px ml-3" style={{ background: `linear-gradient(to right, ${accentHex}40, transparent)` }} />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: chapter heading */}
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-8 space-y-6">
            <div className="flex items-baseline gap-4">
              <span className={`status-dot ${dotCls}`} />
              <span className="bracket text-fg-muted">CHAPTER</span>
            </div>
            <h2
              className="font-zh font-black text-6xl text-fg leading-[0.9] tracking-tightish"
              style={{ textShadow: `0 0 24px ${accentHex}40` }}
            >
              {section.name}
            </h2>
            <div className="space-y-3">
              <div className="h-px w-16" style={{ background: accentHex, boxShadow: `0 0 8px ${accentHex}` }} />
              <p className="font-zh text-fg-muted leading-relaxed max-w-sm">
                {section.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Right: feature cards */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {section.features.map((f, i) => (
            <FeatureCard key={f.code} feature={f} accent={section.accent} delay={animDelay + 200 + i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============== Feature Card ==============
function FeatureCard({ feature, accent, delay }: { feature: Feature; accent: Accent; delay: number }) {
  const accentHex = ACCENT_HEX[accent];
  const isClickable = feature.status !== 'soon';
  const dotCls =
    feature.status === 'live'
      ? accent === 'cyan' ? '' : accent === 'magenta' ? 'mag' : 'acid'
      : feature.status === 'beta'
      ? 'amber'
      : 'gray';
  const glowCls = accent === 'cyan' ? 'glow-cyan' : accent === 'magenta' ? 'glow-mag' : 'glow-acid';

  const inner = (
    <div
      className={`group relative h-full bg-bg-panel/70 border border-edge backdrop-blur-sm p-6 flex flex-col transition-all duration-300 animate-fade-up ${
        isClickable
          ? 'cursor-pointer hover:-translate-y-1 hover:border-edge-bright'
          : 'opacity-60'
      }`}
      style={{
        animationDelay: `${delay}ms`,
        minHeight: '240px',
        ...(isClickable ? {} : {}),
      }}
    >
      {/* Hover glow ring */}
      {isClickable && (
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            boxShadow: `inset 0 0 0 1px ${accentHex}80, 0 0 32px -6px ${accentHex}60`,
          }}
        />
      )}

      {/* Corner ticks */}
      <CornerTicks color={accentHex} active={isClickable} />

      {/* Top row */}
      <div className="flex items-center justify-between mb-7 relative">
        <div className="flex items-center gap-2">
          <span className={`status-dot ${dotCls}`} />
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-fg-muted">
            {feature.status === 'live' ? 'LIVE' : feature.status === 'beta' ? 'BETA' : 'SOON'}
          </span>
        </div>
        <span className="tagged text-fg-faint">
          &lt;{feature.code}/&gt;
        </span>
      </div>

      {/* Title */}
      <h3 className="font-zh font-bold text-3xl text-fg leading-tight mb-3 tracking-tightish">
        {feature.zh}
      </h3>

      <p className="text-sm text-fg-muted leading-relaxed">{feature.desc}</p>

      {/* Bottom */}
      <div className="mt-auto pt-6 flex items-center justify-between">
        {isClickable ? (
          <>
            <span
              className={`font-mono text-[11px] uppercase tracking-widest2 transition-colors ${glowCls}`}
              style={{ color: accentHex }}
            >
              ENGAGE
            </span>
            <span
              className="font-mono text-xl transition-transform duration-300 group-hover:translate-x-1"
              style={{ color: accentHex, textShadow: `0 0 12px ${accentHex}` }}
            >
              →
            </span>
          </>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-fg-dim">
            STANDBY
          </span>
        )}
      </div>
    </div>
  );

  if (isClickable) {
    return <Link to={feature.to}>{inner}</Link>;
  }
  return inner;
}

// ============== CornerTicks ==============
function CornerTicks({ color, active }: { color: string; active: boolean }) {
  const c = active ? color : '#2D3A56';
  const Tick = ({ pos }: { pos: string }) => (
    <span
      className="absolute pointer-events-none"
      style={{ ...positionMap[pos], color: c }}
    >
      <span className="block w-2 h-px" style={{ background: c }} />
      <span className="block w-px h-2 -mt-px" style={{ background: c, marginLeft: pos.includes('r') ? 'calc(100% - 1px)' : 0 }} />
    </span>
  );
  return (
    <>
      <Tick pos="tl" />
      <Tick pos="tr" />
      <Tick pos="bl" />
      <Tick pos="br" />
    </>
  );
}
const positionMap: Record<string, React.CSSProperties> = {
  tl: { top: 0, left: 0 },
  tr: { top: 0, right: 0, transform: 'scaleX(-1)' },
  bl: { bottom: 0, left: 0, transform: 'scaleY(-1)' },
  br: { bottom: 0, right: 0, transform: 'scale(-1)' },
};

// ============== TopNav ==============
function TopNav({ clock }: { clock: string }) {
  return (
    <header className="border-b border-edge bg-bg/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-3 group">
          <span className="font-mono text-fg-faint group-hover:text-cyan transition-colors text-sm">&lt;</span>
          <span className="font-sans font-bold text-lg tracking-tightish text-fg group-hover:glow-cyan transition-all">
            STUDIO
          </span>
          <span className="font-mono text-fg-faint group-hover:text-cyan transition-colors text-sm">/&gt;</span>
          <span className="font-zh text-fg-muted text-xs ml-2">内容工坊</span>
        </Link>

        <nav className="flex items-center gap-7 font-mono text-[11px] uppercase tracking-widest2">
          <Link to="/" className="text-cyan glow-cyan">HOME</Link>
          <Link to="/wechat/feeds" className="text-fg-muted hover:text-cyan transition-colors">WORKBENCH</Link>
          <Link to="/settings" className="text-fg-muted hover:text-cyan transition-colors">SETTINGS</Link>
          <div className="flex items-center gap-2 ml-3 pl-3 border-l border-edge text-fg-faint">
            <span className="status-dot" />
            <span className="tabular">{clock}</span>
          </div>
        </nav>
      </div>
    </header>
  );
}

// ============== Divider ==============
function Divider() {
  return (
    <div className="max-w-7xl mx-auto px-8">
      <div className="hairline" />
    </div>
  );
}
