import { TrendingUp, TrendingDown } from 'lucide-react';
import PageTitle from '../../components/PageTitle';
import { KPIS, PUBLISH_PER_DAY, PLATFORM_SHARE, RECENT_OUTPUTS } from '../../data/mock/dashboard';
import { MODULES } from '../../lib/module-meta';
import { classNames } from '../../lib/picsum';

export default function MgDashboard() {
  const m = MODULES.manage;
  const max = Math.max(...PUBLISH_PER_DAY.map((d) => d.value));

  return (
    <div>
      <PageTitle title="数据看板" subtitle="发布、曝光、互动汇总" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {KPIS.map((k) => (
          <div key={k.label} className="card p-4">
            <p className="text-xs text-zinc-500">{k.label}</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-zinc-900 tabular">{k.value}</p>
            <p className={classNames('mt-1 text-xs font-semibold flex items-center gap-1 tabular',
              k.trend === 'up' ? m.text : 'text-zinc-400')}>
              {k.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {k.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-5">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">近 7 天发布数</h3>
              <p className="text-xs text-zinc-500 mt-0.5">按日聚合 · 含所有平台</p>
            </div>
            <span className={classNames('chip', m.tint, m.text)}>本周</span>
          </div>
          <div className="flex items-end gap-2 sm:gap-3 h-40 sm:h-48">
            {PUBLISH_PER_DAY.map((d) => {
              const h = (d.value / max) * 100;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className={classNames('w-full rounded-t-md transition-all', m.bg)}
                      style={{ height: `${h}%`, minHeight: '4px' }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 tabular">{d.value}</span>
                  <span className="text-[10px] text-zinc-400">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-zinc-900">平台分布</h3>
            <p className="text-xs text-zinc-500 mt-0.5">按发布次数计</p>
          </div>
          <DonutChart />
          <div className="mt-4 space-y-2">
            {PLATFORM_SHARE.map((p) => (
              <div key={p.platform} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
                <span className="text-zinc-700 flex-1">{p.platform}</span>
                <span className="text-zinc-500 tabular font-medium">{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-200">
          <h3 className="text-sm font-semibold text-zinc-900">表现最佳</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-zinc-500 bg-zinc-50">
            <tr>
              <th className="text-left px-4 sm:px-5 py-2.5 font-medium">作品</th>
              <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">平台</th>
              <th className="text-right px-4 py-2.5 font-medium">曝光</th>
              <th className="text-right px-4 sm:px-5 py-2.5 font-medium">互动</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {RECENT_OUTPUTS.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-50/60">
                <td className="px-4 sm:px-5 py-3 text-zinc-900 font-medium">{r.title}</td>
                <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">{r.platform}</td>
                <td className="px-4 py-3 text-right tabular text-zinc-700">{r.impressions.toLocaleString()}</td>
                <td className="px-4 sm:px-5 py-3 text-right tabular">
                  <span className={classNames('font-semibold', m.text)}>{r.interactions.toLocaleString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DonutChart() {
  const r = 36;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto -rotate-90">
      <circle cx="50" cy="50" r={r} stroke="#f4f4f5" strokeWidth="14" fill="none" />
      {PLATFORM_SHARE.map((p) => {
        const len = (p.pct / 100) * c;
        const dash = `${len} ${c - len}`;
        const offset = -acc;
        acc += len;
        return (
          <circle
            key={p.platform}
            cx="50" cy="50" r={r}
            stroke={p.color} strokeWidth="14"
            fill="none"
            strokeDasharray={dash}
            strokeDashoffset={offset}
          />
        );
      })}
    </svg>
  );
}
