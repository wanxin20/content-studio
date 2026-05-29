/**
 * 生图 provider 注册表。
 * 目前实现 DashScope(阿里通义万象 Qwen-Image)，逻辑拆解自 baoyu-imagine。
 * 架构上每个 provider 一个 entry，以后加 OpenRouter / Jimeng / Seedream 只需补一项。
 */

export type ImageProviderId = 'dashscope';

export interface ImageModelOption {
  id: string;
  label: string;
}

export interface ImageProviderInfo {
  id: ImageProviderId;
  name: string;
  configured: boolean; // 是否配了 key
  models: ImageModelOption[];
  defaultModel: string;
  aspectRatios: string[];
}

export interface GenerateImageInput {
  provider: ImageProviderId;
  prompt: string;
  model?: string;
  ar?: string; // 如 "3:4"
  quality?: 'normal' | '2k';
}

export interface GenerateImageOutput {
  url?: string; // 远端图片 URL(优先)
  dataUrl?: string; // base64 data URL(兜底)
  model: string;
  size: string;
}

/* ============ DashScope (通义万象 Qwen-Image) ============ */

const DASHSCOPE_DEFAULT_MODEL = 'qwen-image-2.0-pro';
const DASHSCOPE_MODELS: ImageModelOption[] = [
  { id: 'qwen-image-2.0-pro', label: 'Qwen-Image 2.0 Pro（推荐·自由比例·中文强）' },
  { id: 'qwen-image-2.0', label: 'Qwen-Image 2.0' },
  { id: 'qwen-image-max', label: 'Qwen-Image Max（固定尺寸）' },
  { id: 'qwen-image-plus', label: 'Qwen-Image Plus（固定尺寸）' },
];
const DASHSCOPE_ARS = ['3:4', '1:1', '4:3', '9:16', '16:9', '2:3', '3:2'];

const QWEN_NEGATIVE_PROMPT =
  '低分辨率，低画质，肢体畸形，手指畸形，画面过饱和，蜡像感，人脸无细节，过度光滑，画面具有AI感，构图混乱，文字模糊，扭曲';

// qwen-image-2.0* 推荐尺寸(摘自 baoyu-imagine)
const QWEN2_SIZE: Record<string, { normal: string; '2k': string }> = {
  '1:1': { normal: '1024*1024', '2k': '1536*1536' },
  '2:3': { normal: '768*1152', '2k': '1024*1536' },
  '3:2': { normal: '1152*768', '2k': '1536*1024' },
  '3:4': { normal: '960*1280', '2k': '1080*1440' },
  '4:3': { normal: '1280*960', '2k': '1440*1080' },
  '9:16': { normal: '720*1280', '2k': '1080*1920' },
  '16:9': { normal: '1280*720', '2k': '1920*1080' },
};
// qwen-image-max/plus 仅支持固定尺寸
const QWEN_FIXED_SIZE: Record<string, string> = {
  '16:9': '1664*928',
  '4:3': '1472*1104',
  '1:1': '1328*1328',
  '3:4': '1104*1472',
  '9:16': '928*1664',
};

function dashscopeKey(): string {
  return process.env.DASHSCOPE_API_KEY || '';
}
function dashscopeBase(): string {
  return (process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com').replace(/\/+$/g, '');
}

function resolveDashscopeSize(model: string, ar: string, quality: 'normal' | '2k'): string {
  const isFixed = model.includes('max') || model.includes('plus') || model === 'qwen-image';
  if (isFixed) {
    return QWEN_FIXED_SIZE[ar] || QWEN_FIXED_SIZE['3:4'];
  }
  const row = QWEN2_SIZE[ar] || QWEN2_SIZE['3:4'];
  return row[quality];
}

async function dashscopeGenerate(input: GenerateImageInput): Promise<GenerateImageOutput> {
  const apiKey = dashscopeKey();
  if (!apiKey) throw new Error('DASHSCOPE_API_KEY 未配置');
  const model = input.model || process.env.DASHSCOPE_IMAGE_MODEL || DASHSCOPE_DEFAULT_MODEL;
  const ar = input.ar || '3:4';
  const quality = input.quality || '2k';
  const size = resolveDashscopeSize(model, ar, quality);

  const url = `${dashscopeBase()}/api/v1/services/aigc/multimodal-generation/generation`;
  const body = {
    model,
    input: { messages: [{ role: 'user', content: [{ text: input.prompt }] }] },
    parameters: {
      prompt_extend: false,
      size,
      watermark: false,
      negative_prompt: QWEN_NEGATIVE_PROMPT,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`DashScope ${res.status}: ${err.slice(0, 300)}`);
  }
  const result: any = await res.json();
  let imageData: string | null = null;
  if (result?.output?.result_image) {
    imageData = result.output.result_image;
  } else if (result?.output?.choices?.[0]?.message?.content) {
    for (const item of result.output.choices[0].message.content) {
      if (item?.image) { imageData = item.image; break; }
    }
  }
  if (!imageData) throw new Error('DashScope 返回里没有图片: ' + JSON.stringify(result).slice(0, 200));

  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return { url: imageData, model, size };
  }
  return { dataUrl: `data:image/png;base64,${imageData}`, model, size };
}

/* ============ 注册表 ============ */

export function listImageProviders(): ImageProviderInfo[] {
  return [
    {
      id: 'dashscope',
      name: 'DashScope 通义万象',
      configured: !!dashscopeKey(),
      models: DASHSCOPE_MODELS,
      defaultModel: DASHSCOPE_DEFAULT_MODEL,
      aspectRatios: DASHSCOPE_ARS,
    },
  ];
}

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  switch (input.provider) {
    case 'dashscope':
      return dashscopeGenerate(input);
    default:
      throw new Error(`未知生图 provider: ${input.provider}`);
  }
}
