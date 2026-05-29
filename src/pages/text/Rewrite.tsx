import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Save, ChevronLeft, AlertTriangle, Sparkles, ChevronDown, X, CheckCircle2, ExternalLink, StopCircle } from 'lucide-react';
import PageTitle from '../../components/PageTitle';
import { MODULES } from '../../lib/module-meta';
import { classNames } from '../../lib/picsum';
import { streamRewriteArticle, createDraft, type RewriteResult } from '../../lib/studio';
import { useAppStore } from '../../store/useAppStore';

interface StylePreset {
  id: string;
  label: string;
  /** Prompt fragment appended to the default rewrite instruction. */
  promptHint: string;
}

const STYLES: StylePreset[] = [
  { id: 'minimal', label: '极简', promptHint: '风格要求：极简、克制、句子短，去掉所有冗余修饰。' },
  { id: 'humor', label: '幽默', promptHint: '风格要求：幽默、口语化、可以适度自嘲，但保留内容核心。' },
  { id: 'pro', label: '职场', promptHint: '风格要求：专业、严谨、有条理，适合职场内容平台的语气。' },
  { id: 'literary', label: '文艺', promptHint: '风格要求：文艺、节制、有画面感，注意意境与节奏。' },
];

type Stage = 'idle' | 'running' | 'done' | 'error';

export default function TextRewrite() {
  const m = MODULES.text;
  const navigate = useNavigate();
  const article = useAppStore((s) => s.rewriteArticle);
  const setRewriteArticle = useAppStore((s) => s.setRewriteArticle);

  const [style, setStyle] = useState<StylePreset>(STYLES[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [streamedText, setStreamedText] = useState('');
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<(() => void) | null>(null);

  const sourceText = useMemo(() => {
    if (!article) return '';
    // Convert HTML to plaintext for the source preview pane
    if (article.content && article.content.includes('<')) {
      const div = document.createElement('div');
      div.innerHTML = article.content;
      return div.textContent || div.innerText || '';
    }
    return article.content || article.summary || '';
  }, [article]);

  // Auto-clear "saved" indicator after a few seconds
  useEffect(() => {
    if (!savedAt) return;
    const t = window.setTimeout(() => setSavedAt(null), 3000);
    return () => window.clearTimeout(t);
  }, [savedAt]);

  if (!article) {
    return <EmptyState />;
  }

  const buildPrompt = () => {
    const base =
      `请将下面这篇文章改写一遍，保留事实和数据，换一种表达。${style.promptHint}` +
      `\n注意：原文中的图片(![](url) 语法)必须原样保留、不要删改，按合适位置放进改写后的正文。`;
    const extra = customPrompt.trim();
    return extra ? `${base}\n\n额外要求：${extra}` : base;
  };

  const run = () => {
    // Abort any in-flight stream
    abortRef.current?.();
    setStage('running');
    setError(null);
    setResult(null);
    setStreamedText('');
    abortRef.current = streamRewriteArticle(article, buildPrompt(), {
      onDelta: (chunk) => {
        setStreamedText((s) => s + chunk);
      },
      onDone: (res) => {
        setResult(res);
        setStage('done');
        abortRef.current = null;
      },
      onError: (msg) => {
        setError(msg);
        setStage('error');
        abortRef.current = null;
      },
    });
  };

  const stop = () => {
    abortRef.current?.();
    abortRef.current = null;
    setStage('idle');
  };

  // Cleanup if user navigates away mid-stream
  useEffect(() => {
    return () => {
      abortRef.current?.();
    };
  }, []);

  const save = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await createDraft({
        sourceArticleId: article.id,
        sourceTitle: article.title,
        sourceAuthor: article.author,
        sourceLink: article.link,
        promptUsed: buildPrompt(),
        rewrittenTitle: result.rewrittenTitle,
        rewrittenContent: result.rewrittenContent,
      });
      setSavedAt(new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const clear = () => {
    setRewriteArticle(null);
    navigate('/library/weixin');
  };

  return (
    <div>
      <PageTitle
        title="文本改写"
        subtitle="把公众号文章按你的风格重写一遍"
        actions={
          <div className="flex gap-2">
            <button onClick={clear} className="btn-ghost text-xs"><X className="w-3.5 h-3.5" /> 换一篇</button>
            {stage === 'running' ? (
              <button onClick={stop} className="btn-outline text-xs">
                <StopCircle className="w-3.5 h-3.5" /> 停止
              </button>
            ) : (
              <button onClick={run} className="btn-outline text-xs">
                <RefreshCw className="w-3.5 h-3.5" />
                {stage === 'idle' ? '开始改写' : '重新生成'}
              </button>
            )}
            <button
              onClick={save}
              disabled={!result || saving}
              className={classNames('btn-primary text-xs hover:opacity-90 disabled:opacity-50', m.bg)}
            >
              {savedAt ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {savedAt ? '已存草稿' : saving ? '保存中…' : '存草稿'}
            </button>
          </div>
        }
      />

      {/* Style picker + custom prompt */}
      <div className="card p-4 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">风格</span>
          {STYLES.map((s) => {
            const active = s.id === style.id;
            return (
              <button
                key={s.id}
                onClick={() => setStyle(s)}
                disabled={stage === 'running'}
                className={classNames(
                  'chip border transition disabled:opacity-50',
                  active ? `${m.tint} ${m.text} border-current font-semibold` : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50',
                )}
              >
                {s.label}
              </button>
            );
          })}
          <details className="ml-auto group">
            <summary className="chip bg-zinc-100 text-zinc-500 cursor-pointer inline-flex items-center gap-1 list-none">
              额外要求 <ChevronDown className="w-3 h-3 transition group-open:rotate-180" />
            </summary>
          </details>
        </div>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="可选：例如「不要列点，写成连贯段落」「3 段以内」「面向小红书读者」"
          rows={2}
          className="w-full text-sm px-3 py-2 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 resize-none"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Source */}
        <section className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-zinc-900">原文</h3>
            <span className={classNames('chip ml-auto', m.tint, m.text)}>来自 微信公众号</span>
          </div>
          <p className="text-[11px] text-zinc-500 mb-1 flex items-center gap-1.5">
            <span className="truncate">{article.title}</span>
          </p>
          <p className="text-[11px] text-zinc-400 mb-3 flex items-center gap-1.5">
            <span>{article.author || '公众号'}</span>
            {article.link && (
              <a
                href={article.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 hover:text-zinc-900"
              >
                原文 <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </p>
          <article className="text-sm text-zinc-700 leading-7 max-h-[60vh] overflow-y-auto whitespace-pre-wrap scrollbar-thin">
            {sourceText || <span className="text-zinc-400">(暂无正文，请到 we-mp-rss 主项目点"刷新"补抓内容)</span>}
          </article>
        </section>

        {/* Rewrite */}
        <section className="card p-5 bg-gradient-to-br from-white to-orange-50/30">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-zinc-900">改写</h3>
            <span className={classNames('chip', m.tint, m.text)}>{style.label}</span>
            {stage === 'done' && result?.model && (
              <span className="text-[10px] text-zinc-400 ml-auto">{result.model}</span>
            )}
          </div>

          {stage === 'idle' && (
            <div className="text-center py-10">
              <div className={classNames('w-12 h-12 rounded-full mx-auto flex items-center justify-center', m.tint)}>
                <Sparkles className={classNames('w-5 h-5', m.text)} />
              </div>
              <p className="mt-3 text-sm font-semibold text-zinc-900">挑好风格，点"开始改写"</p>
              <p className="text-xs text-zinc-500 mt-1">边出边显——真流式输出</p>
              <button
                onClick={run}
                className={classNames('mt-4 btn-primary text-xs hover:opacity-90', m.bg)}
              >
                <Sparkles className="w-3.5 h-3.5" /> 开始改写
              </button>
            </div>
          )}

          {stage === 'error' && (
            <div className="card border-rose-300 bg-rose-50 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-rose-800">改写失败</p>
                <p className="text-rose-700 mt-1 break-all">{error}</p>
                <button onClick={run} className="btn-outline text-xs mt-3">
                  <RefreshCw className="w-3.5 h-3.5" /> 重试
                </button>
              </div>
            </div>
          )}

          {(stage === 'running' || stage === 'done') && (
            <>
              {stage === 'running' && !streamedText && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <RefreshCw className={classNames('w-3.5 h-3.5 animate-spin', m.text)} />
                  等待首个 token…
                </div>
              )}
              <article className="text-sm text-zinc-800 leading-7 max-h-[60vh] overflow-y-auto whitespace-pre-wrap scrollbar-thin font-mono-fallback">
                {/* During streaming we show the raw text as it lands. After "done"
                    we prefer the parsed body (title stripped). */}
                {stage === 'done' && result ? (
                  <>
                    {result.rewrittenTitle && (
                      <p className="font-bold text-base text-zinc-900 mb-3 font-sans">
                        {result.rewrittenTitle}
                      </p>
                    )}
                    <span className="font-sans">{result.rewrittenContent}</span>
                  </>
                ) : (
                  <span className="font-sans">{streamedText}</span>
                )}
                {stage === 'running' && (
                  <span
                    className={classNames(
                      'inline-block w-[2px] h-[1em] align-[-0.15em] ml-0.5 animate-blink',
                      m.bg,
                    )}
                  />
                )}
              </article>
              {stage === 'done' && result?.usage && (
                <div className="mt-3 pt-3 border-t border-zinc-200 text-[10px] text-zinc-400 flex gap-3 tabular">
                  <span>输入 {result.usage.input_tokens ?? '?'} tokens</span>
                  <span>输出 {result.usage.output_tokens ?? '?'} tokens</span>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyState() {
  const m = MODULES.text;
  return (
    <div className="card p-10 sm:p-14 text-center max-w-2xl mx-auto">
      <div className={classNames('w-14 h-14 rounded-full mx-auto flex items-center justify-center', m.tint)}>
        <Sparkles className={classNames('w-6 h-6', m.text)} />
      </div>
      <h2 className="mt-4 text-lg font-bold text-zinc-900">还没有要改写的文章</h2>
      <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
        到 <b>微信公众号</b> 数据源里挑一篇，点"送去改写"就过来了。
      </p>
      <a
        href="/library/weixin"
        className={classNames('inline-flex items-center gap-1.5 mt-5 btn-primary hover:opacity-90', m.bg)}
      >
        <ChevronLeft className="w-3.5 h-3.5" /> 去挑一篇
      </a>
    </div>
  );
}
