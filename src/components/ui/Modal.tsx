import React, { useEffect } from 'react';
import { X } from 'lucide-react';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  if (!isOpen) return null;
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true" />


      <div
        className={`relative w-full ${sizes[size]} bg-white rounded-xl shadow-xl transform transition-all flex flex-col max-h-[90vh]`}
        role="dialog"
        aria-modal="true">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-500 hover:bg-slate-100 p-1 rounded-md transition-colors">

            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">{children}</div>

        {footer &&
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-end gap-3">
            {footer}
          </div>
        }
      </div>
    </div>);

}