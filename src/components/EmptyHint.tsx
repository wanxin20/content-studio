import { type ReactNode } from 'react';
import { classNames } from '../lib/picsum';

interface EmptyHintProps {
  icon?: ReactNode;
  title: string;
  hint?: string;
  className?: string;
}

export default function EmptyHint({ icon, title, hint, className }: EmptyHintProps) {
  return (
    <div className={classNames('card flex flex-col items-center justify-center text-center py-12 px-6', className)}>
      {icon && <div className="mb-3 text-zinc-400">{icon}</div>}
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      {hint && <p className="text-xs text-zinc-500 mt-1">{hint}</p>}
    </div>
  );
}
