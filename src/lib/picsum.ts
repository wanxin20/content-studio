/**
 * Stable placeholder image URLs from picsum.photos (Lorem Picsum).
 * Seed-based so each call gives the same image — good for prototypes.
 */
export function picsum(seed: string | number, w: number, h: number = w): string {
  return `https://picsum.photos/seed/${encodeURIComponent(String(seed))}/${w}/${h}`;
}

/** Faces from a curated set (still picsum, but seeds known to be portraits). */
export function avatar(seed: string | number, size = 80): string {
  return `https://i.pravatar.cc/${size}?u=${encodeURIComponent(String(seed))}`;
}

export function classNames(...xs: (string | false | null | undefined)[]): string {
  return xs.filter(Boolean).join(' ');
}

/** Compact count formatting for engagement numbers: 12345 → "1.2w", 3400 → "3.4k". */
export function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}
