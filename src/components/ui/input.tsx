import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  icon,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-zinc-300 tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full rounded-xl bg-[#0c0c10] border text-zinc-100 text-sm placeholder:text-zinc-600 transition-all duration-150',
            'focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20',
            icon ? 'pl-10 pr-3.5 py-2.5' : 'px-3.5 py-2.5',
            error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
              : 'border-white/10 hover:border-white/20',
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-red-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-zinc-500">{helperText}</p>
      ) : null}
    </div>
  );
};
