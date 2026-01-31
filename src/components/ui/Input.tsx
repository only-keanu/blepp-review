import React, { forwardRef } from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label &&
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        }
        <div className="relative">
          {icon &&
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {icon}
            </div>
          }
          <input
            ref={ref}
            className={`
              block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm
              focus:border-teal-500 focus:ring-teal-500 sm:text-sm
              disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400
              ${icon ? 'pl-10' : 'pl-3'}
              ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'}
              ${className}
            `}
            {...props} />

        </div>
        {error &&
        <p className="mt-1 text-sm text-red-600 animate-in slide-in-from-top-1">
            {error}
          </p>
        }
        {helperText && !error &&
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
        }
      </div>);

  }
);
Input.displayName = 'Input';
