import { Link, useLocation } from 'react-router-dom';
import BackgroundFX from '../components/BackgroundFX';

type Tone = 'magenta' | 'acid';

interface MapEntry {
  title: string;
  zhName: string;
  desc: string;
  tone: Tone;
  index: string;
  back: string;
  plan: string[];
}

const MAP: Record<string, MapEntry> = {
  '/xhs/feeds': {
    title: '数据获取',
    zhName: 'XIAOHONGSHU',
    desc: '抓取目标账号 / 话题的笔记内容、配图、互动数据。',
    tone: 'magenta',
    index: '02·A',
    back: '/',
    plan: [
      '接入小红书 web 端登录态(CDP),按账号 / 话题抓取',
      '保存正文 + 9 张图 + 互动数据(点赞 / 收藏 / 评论)',
      '存入本地数据源,可在「图文改写」中选用',
    ],
  },
  '/xhs/rewrite': {
    title: '图文改写',
    zhName: 'XIAOHONGSHU',
    desc: '重写文案、重排图序、自动套用爆款标题模板。',
    tone: 'magenta',
    index: '02·B',
    back: '/',
    plan: [
      '保留原图,只重写文字部分(emoji、短句、爆款标题)',
      '可选「保留同序 / 自动重排 / 删几张」',
      '一键导出为可粘贴小红书 App 的格式',
    ],
  },
  '/xhs/generate': {
    title: '图文生成',
    zhName: 'XIAOHONGSHU',
    desc: '从一个选题,自动生成 6–9 张小红书风格笔记图。',
    tone: 'magenta',
    index: '02·C',
    back: '/',
    plan: [
      '输入选题 → AI 拆解 6–9 个分镜',
      '调用图像生成 API 出图(走 baoyu-xhs-images 风格)',
      '配文字 + 自动加封面,打包为可发布素材',
    ],
  },
  '/douyin/feeds': {
    title: '视频获取',
    zhName: 'DOUYIN',
    desc: '下载短视频原文件,保留封面与互动数据快照。',
    tone: 'acid',
    index: '03·A',
    back: '/',
    plan: [
      '解析抖音分享链接,无水印拉取原视频',
      '提取封面、点赞、评论数,作元数据存档',
      '可批量从用户主页拉取',
    ],
  },
  '/douyin/script': {
    title: '文案提取',
    zhName: 'DOUYIN',
    desc: 'ASR 提取字幕脚本,自动分段与人物标记。',
    tone: 'acid',
    index: '03·B',
    back: '/',
    plan: [
      '调用 Whisper / 通义听悟 之类做 ASR',
      '自动分段、标点、人物标记',
      '导出为 SRT / markdown / 拆条脚本',
    ],
  },
  '/douyin/avatar': {
    title: '数字人生成',
    zhName: 'DOUYIN',
    desc: '用提取出的脚本驱动数字人,生成新短视频。',
    tone: 'acid',
    index: '03·C',
    back: '/',
    plan: [
      '接入数字人 API(HeyGen / 腾讯智影 / 火山等)',
      '上传脚本 + 选数字人 → 自动渲染',
      '生成完毕通知,可一键导出',
    ],
  },
};

const ACCENT: Record<Tone, { hex: string; cls: string; dot: string }> = {
  magenta: { hex: '#FF2D55', cls: 'glow-mag', dot: 'mag' },
  acid: { hex: '#A3FF12', cls: 'glow-acid', dot: 'acid' },
};

export default function Placeholder() {
  const { pathname } = useLocation();
  const entry = MAP[pathname] || {
    title: '未知功能',
    zhName: '?',
    desc: '路径不在预设功能列表里。',
    tone: 'acid' as Tone,
    index: '—',
    back: '/',
    plan: [],
  };

  const a = ACCENT[entry.tone];

  return (
    <div className="relative min-h-screen bg-bg text-fg font-sans overflow-hidden">
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none animate-drift z-0" aria-hidden />
      <BackgroundFX palette={entry.tone === 'magenta' ? 'magenta' : 'acid'} />

      <div className="relative z-10">
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
            <Link
              to={entry.back}
              className="font-mono text-[11px] uppercase tracking-widest2 text-fg-muted hover:text-cyan transition-colors"
            >
              ← RETURN HOME
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-8 py-20">
          {/* Section label strip */}
          <div className="flex items-center gap-4 mb-12">
            <span className={`status-dot ${a.dot}`} />
            <span className="font-mono text-sm tracking-widest2" style={{ color: a.hex }}>
              [{entry.index}]
            </span>
            <span className="font-mono text-xs tracking-widest2 text-fg-muted">
              {entry.zhName} · ROADMAP
            </span>
            <div className="flex-1 h-px ml-3"
                 style={{ background: `linear-gradient(to right, ${a.hex}40, transparent)` }} />
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Left */}
            <div className="col-span-12 lg:col-span-5 animate-fade-up">
              <h1
                className="font-zh font-black text-7xl text-fg leading-[0.9] tracking-tightish mb-6"
                style={{ textShadow: `0 0 32px ${a.hex}50` }}
              >
                {entry.title}
              </h1>
              <div className="h-px w-16 mb-6"
                   style={{ background: a.hex, boxShadow: `0 0 8px ${a.hex}` }} />
              <p className="font-zh text-fg-muted text-lg leading-relaxed max-w-md">
                {entry.desc}
              </p>

              <div className="mt-10 flex items-center gap-3">
                <span className="status-dot amber" />
                <span className="font-mono text-[11px] tracking-widest2 text-amber">
                  STATUS · STANDBY
                </span>
              </div>
            </div>

            {/* Right: roadmap */}
            <div className="col-span-12 lg:col-span-7 animate-fade-up [animation-delay:120ms]">
              <div className="relative bg-bg-panel/70 border border-edge backdrop-blur-sm">
                <div className="absolute inset-0 grid-bg-fine opacity-30 pointer-events-none" />

                <div className="relative px-8 py-5 border-b border-edge flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-widest2" style={{ color: a.hex }}>
                    /ROADMAP · TARGET
                  </span>
                  <span className="font-mono text-[10px] text-fg-faint">v0.X</span>
                </div>

                <div className="relative p-8 md:p-10">
                  <h2 className="font-zh font-bold text-2xl text-fg mb-8 tracking-tightish">
                    上线后,会做这些事
                  </h2>

                  <ol className="space-y-6">
                    {entry.plan.map((step, i) => (
                      <li key={i} className="grid grid-cols-[auto_1fr] gap-6 items-start">
                        <div className="flex flex-col items-center pt-1">
                          <span
                            className="font-mono tabular text-3xl font-medium leading-none"
                            style={{ color: a.hex, textShadow: `0 0 12px ${a.hex}` }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div className="w-px h-8 mt-2"
                               style={{ background: i < entry.plan.length - 1 ? `${a.hex}30` : 'transparent' }} />
                        </div>
                        <p className="font-zh text-fg leading-relaxed text-base pt-1">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-10 pt-6 border-t border-edge flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-widest2 text-fg-faint">
                      AWAITING&nbsp;&nbsp;DEPLOYMENT
                    </span>
                    <Link
                      to="/"
                      className="font-mono text-[11px] uppercase tracking-widest2 hover:text-cyan transition-colors flex items-center gap-2"
                      style={{ color: a.hex }}
                    >
                      RETURN HOME
                      <span style={{ textShadow: `0 0 12px ${a.hex}` }}>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
