import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';

interface SettingsLayoutProps {
  children: React.ReactNode;
  maxWidthClassName?: string;
}

const settingsTabs = [
  { name: 'Profile', href: '/dashboard/settings' },
  { name: 'Study Priorities', href: '/dashboard/settings/topics' },
  { name: 'Access', href: '/dashboard/settings/access' }
];

export function SettingsLayout({ children, maxWidthClassName = 'max-w-2xl' }: SettingsLayoutProps) {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/dashboard/settings') {
      return location.pathname === href;
    }
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <AppLayout>
      <div className={`mx-auto space-y-6 ${maxWidthClassName}`}>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your profile, study priorities, and account access.
            </p>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
            {settingsTabs.map((tab) => {
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.href}
                  to={tab.href}
                  className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'border-teal-600 text-teal-700 dark:border-teal-300 dark:text-teal-200'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>
        {children}
      </div>
    </AppLayout>
  );
}
