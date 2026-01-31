import React from 'react';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  noPadding?: boolean;
}
export function Card({
  children,
  className = '',
  title,
  description,
  footer,
  noPadding = false
}: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}>

      {(title || description) &&
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          {title &&
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        }
          {description &&
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        }
        </div>
      }
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
      {footer &&
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800">
          {footer}
        </div>
      }
    </div>);

}
