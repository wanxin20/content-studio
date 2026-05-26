import { useState } from 'react';
import { Mic, Sparkles, FileText, Check } from 'lucide-react';
import PageTitle from '../../components/PageTitle';
import { MODULES } from '../../lib/module-meta';
import { avatar, picsum, classNames } from '../../lib/picsum';

const AVATARS = [
  { id: 'a1', name: '林若秋', tag: '女 · 知性', cover: avatar('Lin', 200) },
  { id: 'a2', name: '张子默', tag: '男 · 沉稳', cover: avatar('Zhang', 200) },
  { id: 'a3', name: '苏小满', tag: '女 · 活泼', cover: avatar('Su', 200) },
  { id: 'a4', name: '陈一川', tag: '男 · 学院', cover: avatar('Chen', 200) },
];

const VOICES = [
  { id: 'v1', name: '少年系 · 清亮' },
  { id: 'v2', name: '解说系 · 沉稳' },
  { id: 'v3', name: '女声 · 知性' },
];

export default function MmAvatar() {
  const m = MODULES.multimodal;
  const [pickedAvatar, setPickedAvatar] = useState('a1');
  const [pickedVoice, setPickedVoice] = useState('v3');

  return (
    <div>
      <PageTitle title="数字人合成" subtitle="选数字人 · 配音 · 文案 → 一键成片" />

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <section className="space-y-4">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">选数字人</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AVATARS.map((a) => {
                const active = a.id === pickedAvatar;
                return (
                  <button
                    key={a.id}
                    onClick={() => setPickedAvatar(a.id)}
                    className={classNames(
                      'card overflow-hidden text-left transition relative',
                      active && `ring-2 ${m.ring}`,
                    )}
                  >
                    <div className="aspect-square bg-zinc-100">
                      <img src={a.cover} alt={a.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2.5">
                      <p className="text-sm font-medium text-zinc-900">{a.name}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{a.tag}</p>
                    </div>
                    {active && (
                      <div className={classNames('absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white', m.bg)}>
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> 口播文案
            </h3>
            <textarea
              rows={6}
              defaultValue={`大家好，今天给大家分享一下我自己秋天通勤的穿搭思路。
温差大 + 风又凉，怎么穿才能既得体又不冷？
其实只看三件：长袖打底、软挺西装、一条围巾——
照这三件买，10 月的衣柜就齐了。`}
              className="w-full text-sm px-3 py-2.5 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none leading-relaxed"
            />
            <p className="mt-2 text-[11px] text-zinc-500">约 96 字 · 估算时长 28s</p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" /> 音色
            </h3>
            <div className="space-y-1.5">
              {VOICES.map((v) => {
                const active = v.id === pickedVoice;
                return (
                  <button
                    key={v.id}
                    onClick={() => setPickedVoice(v.id)}
                    className={classNames(
                      'w-full flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm transition',
                      active ? `${m.tint} ${m.border} ${m.text} font-semibold` : 'border-zinc-200 hover:bg-zinc-50',
                    )}
                  >
                    <span className={classNames('w-2 h-2 rounded-full', active ? m.bg : 'bg-zinc-300')} />
                    <span className="flex-1 text-left">{v.name}</span>
                    <span className="text-xs text-zinc-400">试听 ▸</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="aspect-[3/4] bg-zinc-100 relative">
              <img src={picsum('digital-preview', 600, 800)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />
              <div className="absolute bottom-3 left-3 right-3 bg-white/80 backdrop-blur rounded-md p-2 text-xs">
                <p className="font-semibold text-zinc-900">预览</p>
                <p className="text-zinc-500 mt-0.5">{AVATARS.find((a) => a.id === pickedAvatar)?.name} · {VOICES.find((v) => v.id === pickedVoice)?.name}</p>
              </div>
            </div>
            <div className="p-3">
              <button className={classNames('w-full btn-primary', m.bg)}>
                <Sparkles className="w-3.5 h-3.5" /> 合成视频
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
