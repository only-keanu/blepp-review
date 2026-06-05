import React, { useCallback, useRef, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { KeyboardShortcuts, ShortcutDefinition } from '../shortcuts/KeyboardShortcuts';
interface AppLayoutProps {
  children: React.ReactNode;
  pageShortcuts?: ShortcutDefinition[];
}
export function AppLayout({ children, pageShortcuts }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const focusHeaderSearch = useCallback(() => {
    const input = searchInputRef.current;
    if (!input || input.offsetParent === null) {
      return false;
    }
    input.focus();
    input.select();
    return true;
  }, []);

  return (
    <KeyboardShortcuts focusHeaderSearch={focusHeaderSearch} pageShortcuts={pageShortcuts}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            searchInputRef={searchInputRef}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </KeyboardShortcuts>);

}
