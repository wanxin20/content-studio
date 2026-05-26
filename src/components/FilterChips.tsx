import { classNames } from '../lib/picsum';

interface Option {
  value: string;
  label: string;
}

interface FilterChipsProps {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  accent: string; // tailwind text-* class
  accentBg: string; // tailwind bg-*-50
}

export default function FilterChips({ options, value, onChange, accent, accentBg }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={classNames(
              'chip transition border',
              active
                ? `${accentBg} ${accent} border-current font-semibold`
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
