import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, ClipboardList, TrendingUp, Settings, X } from 'lucide-react';
import { Button } from '../ui/Button';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
export function Sidebar({
  isOpen,
  onClose
}: SidebarProps) {
  const location = useLocation();
  const navigation = [{
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  }, {
    name: 'Study Plan',
    href: '/dashboard/study',
    icon: BookOpen
  }, {
    name: 'Questions',
    href: '/dashboard/questions',
    icon: FileText
  }, {
    name: 'Mock Exams',
    href: '/dashboard/mocks',
    icon: ClipboardList
  }, {
    name: 'Progress',
    href: '/dashboard/progress',
    icon: TrendingUp
  }, {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  }];
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  return <>
      {/* Mobile backdrop */}
      {isOpen && <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      {/* Sidebar container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo area */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-teal-600 p-1.5 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              BLEPP Review
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 text-slate-500 hover:bg-slate-100 rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map(item => {
          const active = isActive(item.href);
          return <Link key={item.name} to={item.href} className={`
                  flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                  ${active ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}>
                <item.icon className={`h-5 w-5 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>;
        })}
        </nav>

        {/* Footer area */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Exam Date
            </h4>
            <p className="text-sm font-medium text-slate-900">Aug 15, 2024</p>
            <p className="text-xs text-slate-500 mt-1">124 days remaining</p>
          </div>
        </div>
      </div>
    </>;
}