import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'emerald' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer',
        // Sizes
        size === 'sm' && 'px-3 py-1.5 text-xs gap-1.5',
        size === 'md' && 'px-4 py-2 text-sm gap-2',
        size === 'lg' && 'px-5 py-2.5 text-base gap-2.5',
        // Variants
        variant === 'primary' &&
          'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20 active:scale-[0.98]',
        variant === 'secondary' &&
          'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-white/10 active:scale-[0.98]',
        variant === 'emerald' &&
          'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-400 hover:to-emerald-500 shadow-md shadow-emerald-500/20 active:scale-[0.98]',
        variant === 'ghost' &&
          'bg-transparent hover:bg-white/5 text-zinc-400 hover:text-zinc-100',
        variant === 'danger' &&
          'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
