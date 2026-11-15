import React from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'amber' | 'emerald' | 'blue' | 'purple' | 'zinc' | 'red';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'zinc',
  size = 'sm',
  className,
  ...props
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border',
        size === 'sm' && 'px-2 py-0.5 text-[11px]',
        size === 'md' && 'px-2.5 py-1 text-xs',
        variant === 'amber' && 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        variant === 'emerald' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        variant === 'blue' && 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        variant === 'purple' && 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        variant === 'zinc' && 'bg-zinc-800/80 text-zinc-300 border-white/10',
        variant === 'red' && 'bg-red-500/10 text-red-400 border-red-500/30',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
