import React from 'react';
import clsx from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div
      className={clsx(
        'flex items-center gap-1 p-1 bg-[#0c0c10] border border-white/8 rounded-xl overflow-x-auto scrollbar-none',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer',
              isActive
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={clsx(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-semibold',
                  isActive
                    ? 'bg-amber-400 text-black'
                    : 'bg-zinc-800 text-zinc-400'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
