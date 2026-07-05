import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 animate-pulse flex flex-col gap-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-250 dark:bg-slate-800" />
          <div className="h-4 w-28 bg-slate-250 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-4 w-10 bg-slate-250 dark:bg-slate-800 rounded" />
      </div>
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
    </div>
  );
};

export const TableRowSkeleton = () => {
  return (
    <tr className="animate-pulse">
      <td className="py-4 pr-4"><div className="h-4 w-6 bg-slate-250 dark:bg-slate-800 rounded" /></td>
      <td className="py-4"><div className="h-4 w-32 bg-slate-250 dark:bg-slate-800 rounded" /></td>
      <td className="py-4"><div className="h-4 w-20 bg-slate-250 dark:bg-slate-800 rounded" /></td>
      <td className="py-4"><div className="h-4 w-24 bg-slate-250 dark:bg-slate-800 rounded" /></td>
      <td className="py-4 text-right"><div className="h-8 w-16 bg-slate-250 dark:bg-slate-800 rounded-lg inline-block" /></td>
    </tr>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 text-left animate-pulse">
      <div className="h-8 w-48 bg-slate-250 dark:bg-slate-800 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 h-24 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-16 bg-slate-250 dark:bg-slate-800 rounded" />
              <div className="h-6 w-10 bg-slate-250 dark:bg-slate-800 rounded" />
            </div>
            <div className="w-12 h-12 bg-slate-250 dark:bg-slate-800 rounded-xl" />
          </div>
        ))}
      </div>
      <div className="h-64 w-full bg-slate-200 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 rounded-3xl" />
    </div>
  );
};
