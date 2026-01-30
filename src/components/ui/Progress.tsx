import React from 'react';
interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}
export function Progress({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  className = ''
}: ProgressProps) {
  const percentage = Math.min(Math.max(value / max * 100, 0), 100);
  const variants = {
    default: 'bg-teal-600',
    success: 'bg-green-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600'
  };
  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };
  return (
    <div className={`w-full ${className}`}>
      {showLabel &&
      <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-slate-700">
            {percentage.toFixed(0)}%
          </span>
        </div>
      }
      <div
        className={`w-full bg-slate-200 rounded-full overflow-hidden ${sizes[size]}`}>

        <div
          className={`${variants[variant]} h-full rounded-full transition-all duration-500 ease-out`}
          style={{
            width: `${percentage}%`
          }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max} />

      </div>
    </div>);

}