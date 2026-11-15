import React from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  options: SelectOption[];
  icon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  helperText,
  options,
  icon,
  className,
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          id={selectId}
          className={clsx(
            'w-full appearance-none rounded-xl bg-[#0c0c10] border text-zinc-100 text-sm transition-all duration-150 cursor-pointer',
            'focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20',
            'border-white/10 hover:border-white/20',
            icon ? 'pl-10 pr-10 py-2.5' : 'pl-3.5 pr-10 py-2.5',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-[#111115] text-zinc-100 py-1"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 text-zinc-500 pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {helperText && <p className="text-xs text-zinc-500">{helperText}</p>}
    </div>
  );
};
