import { useState } from 'react';
import { Sparkles, RefreshCw, Save } from 'lucide-react';
import PageTitle from '../../components/PageTitle';
import StreamingText from '../../components/StreamingText';
import { MODULES } from '../../lib/module-meta';
import { classNames } from '../../lib/picsum';

const TEMPLATES = [
  { id: 't1', name: '小红书六段式', tag: '小红书', desc: '勾子 → 痛点 → 干货 × 3 → 收尾' },
  { id: 't2', name: '微信深度文·三幕', tag: '微信', desc: '现象 → 拆解 → 结论' },
  { id: 't3', name: '抖音脚本·30s', tag: '抖音', desc: '反转开头 + 三段干货' },
  { id: 't4', name: '空白', tag: '通用', desc: '自由发挥' },
];

const SAMPLE_OUTPUT = `你试过早上 9 点站在地铁口，对着北风发抖五分钟吗？

如果你的答案是"经常"，那这篇你必须看完。

秋天通勤其实只有三件事要解决：
1. 温差大——内搭决定一切，长袖打底永远不会错；
2. 风很凉——一件软挺的西装外套，既能挡风又不显臃肿；
3. 走路多——一双能走 10000 步的鞋，比任何高跟都重要。

照这三件买，10 月份的衣柜就齐了。`;

export default function TextCreate() {
  const m = MODULES.text;
  const [selectedTpl, setSelectedTpl] = useState('t1');
  const [topic, setTopic] = useState('打工人的极简通勤穿搭');
  const [running, setRunning] = useState(false);
  const [streamId, setStreamId] = useState(0);

  const start = () => {
    setRunning(true);
    setStreamId((s) => s + 1);
  };

  return (
    <div>
      <PageTitle
        title="热点创作"
        subtitle="挑模板、定主题，AI 帮你出第一稿"
        actions={
          running ? (
            <button onClick={start} className="btn-outline text-xs"><RefreshCw className="w-3.5 h-3.5" />重新生成</button>
          ) : null
        }
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        {/* 左：模板 + 参数 */}
        <aside className="space-y-4">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">模板</h3>
            <div className="space-y-1.5">
              {TEMPLATES.map((t) => {
                const active = selectedTpl === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTpl(t.id)}
                    className={classNames(
                      'w-full text-left px-3 py-2.5 rounded-md border text-sm transition',
                      active ? `${m.tint} ${m.border} ring-1 ${m.ring}/40` : 'border-zinc-200 hover:bg-zinc-50',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={classNames('font-medium', active ? m.text : 'text-zinc-900')}>{t.name}</span>
                      <span className="chip bg-zinc-100 text-zinc-500 text-[10px]">{t.tag}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">主题</h3>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="一句话讲清你想写什么"
              className="w-full px-3 py-2 rounded-md border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            />
            <div className="mt-3">
              <label className="text-xs text-zinc-500">字数</label>
              <input type="range" min={300} max={2000} defaultValue={1000} className="w-full mt-1 accent-orange-600" />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5"><span>300</span><span>1000</span><span>2000</span></div>
            </div>
            <button onClick={start} className={classNames('mt-4 w-full btn-primary', m.bg, 'hover:opacity-90')}>
              <Sparkles className="w-3.5 h-3.5" /> {running ? '生成中…' : '开始生成'}
            </button>
          </div>
        </aside>

        {/* 右：输出 */}
        <section className="card p-5 sm:p-6 min-h-[480px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-900">草稿</h3>
            {running && (
              <button className="btn-ghost text-xs"><Save className="w-3.5 h-3.5" />存到生成物</button>
            )}
          </div>
          {!running ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center">
              <div className={classNames('w-12 h-12 rounded-full flex items-center justify-center mb-3', m.tint)}>
                <Sparkles className={classNames('w-5 h-5', m.text)} />
              </div>
              <p className="text-sm font-semibold text-zinc-900">挑好模板，按"开始生成"</p>
              <p className="text-xs text-zinc-500 mt-1">AI 会按模板结构帮你出第一稿（可改）</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-zinc-800 leading-relaxed">
              <StreamingText
                text={SAMPLE_OUTPUT}
                streamKey={streamId}
                cursorColor={m.bg}
                speed={18}
                className="text-sm leading-7"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
