import React from 'react';
import clsx from 'clsx';

interface BentoTileProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: 'none' | 'amber' | 'emerald';
  interactive?: boolean;
}

export const BentoTile: React.FC<BentoTileProps> = ({
  children,
  className,
  glow = 'none',
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'relative rounded-2xl bg-[#111115] border border-white/8 transition-all duration-200',
        'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)]',
        glow === 'amber' && 'border-amber-500/30 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]',
        glow === 'emerald' && 'border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]',
        interactive && 'hover:border-amber-500/40 hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
