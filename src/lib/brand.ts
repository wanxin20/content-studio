import { SiWechat, SiXiaohongshu, SiTiktok, SiSinaweibo } from 'react-icons/si';
import type { IconType } from 'react-icons';

export type BrandKey = 'weixin' | 'xhs' | 'douyin' | 'weibo';

export interface BrandMeta {
  name: string;
  Icon: IconType;
  hex: string;
  /** Tailwind text color */
  text: string;
  /** Tailwind bg color (solid, for icon squares / buttons) */
  bg: string;
  /** Light tint background (for chips / kpi background) */
  tint: string;
  /** Border color */
  border: string;
  /** Ring color */
  ring: string;
}

export const BRANDS: Record<BrandKey, BrandMeta> = {
  weixin: {
    name: '微信公众号',
    Icon: SiWechat,
    hex: '#07C160',
    text: 'text-[#07C160]',
    bg: 'bg-[#07C160]',
    tint: 'bg-emerald-50',
    border: 'border-[#07C160]',
    ring: 'ring-[#07C160]',
  },
  xhs: {
    name: '小红书',
    Icon: SiXiaohongshu,
    hex: '#FF2741',
    text: 'text-[#FF2741]',
    bg: 'bg-[#FF2741]',
    tint: 'bg-rose-50',
    border: 'border-[#FF2741]',
    ring: 'ring-[#FF2741]',
  },
  douyin: {
    name: '抖音',
    Icon: SiTiktok,
    hex: '#000000',
    text: 'text-zinc-900',
    bg: 'bg-zinc-900',
    tint: 'bg-zinc-100',
    border: 'border-zinc-900',
    ring: 'ring-zinc-900',
  },
  weibo: {
    name: '微博',
    Icon: SiSinaweibo,
    hex: '#E6162D',
    text: 'text-[#E6162D]',
    bg: 'bg-[#E6162D]',
    tint: 'bg-red-50',
    border: 'border-[#E6162D]',
    ring: 'ring-[#E6162D]',
  },
};
