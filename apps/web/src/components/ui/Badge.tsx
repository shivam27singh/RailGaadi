import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger' | 'outline';
  dot?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  dot = false,
  pulse = false,
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border select-none transition-colors';

  const variants = {
    default: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/10',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-sm shadow-amber-500/10',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-sm shadow-blue-500/10',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-sm shadow-rose-500/10',
    outline: 'bg-transparent text-slate-300 border-white/10'
  };

  const dotColors = {
    default: 'bg-zinc-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    info: 'bg-blue-400',
    danger: 'bg-rose-400',
    outline: 'bg-slate-300'
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], className))} {...props}>
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={clsx(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColors[variant]
              )}
            />
          )}
          <span className={clsx('relative inline-flex rounded-full h-2 w-2', dotColors[variant])} />
        </span>
      )}
      {children}
    </span>
  );
};
