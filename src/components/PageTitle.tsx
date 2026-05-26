import { type ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageTitle({ title, subtitle, actions }: PageTitleProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
