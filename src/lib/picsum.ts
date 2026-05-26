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
