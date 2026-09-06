import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = true, hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'rounded-2xl transition-all duration-200 overflow-hidden',
            glass
              ? 'glass-panel text-slate-100 shadow-panel'
              : 'bg-surface border border-border text-slate-100',
            hoverable && 'hover:border-border-hover hover:bg-surface-hover/80 hover:-translate-y-0.5 cursor-pointer',
            className
          )
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
