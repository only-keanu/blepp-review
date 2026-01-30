import React from 'react';
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    outline: 'bg-transparent border border-slate-200 text-slate-600'
  };
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm'
  };
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>

      {children}
    </span>);

}