import React, { useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import {
  helpShortcutDefinition,
  navigationShortcutDefinitions,
  pageShortcutGuideDefinitions,
  ShortcutDefinition
} from '../../components/shortcuts/KeyboardShortcuts';
import { SettingsLayout } from './SettingsLayout';

export function KeyboardShortcutsPage() {
  const { user } = useAuth();
  const shortcuts = useMemo(() => {
    const pageShortcuts = pageShortcutGuideDefinitions.filter(
      (shortcut) => shortcut.keys !== 'a' || user?.hasAiAccess
    );
    return [
      helpShortcutDefinition,
      ...navigationShortcutDefinitions(user?.admin),
      ...pageShortcuts
    ];
  }, [user?.admin, user?.hasAiAccess]);

  const groups = shortcuts.reduce<Record<string, ShortcutDefinition[]>>((acc, shortcut) => {
    if (!acc[shortcut.group]) {
      acc[shortcut.group] = [];
    }
    acc[shortcut.group].push(shortcut);
    return acc;
  }, {});

  return (
    <SettingsLayout maxWidthClassName="max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Keyboard Shortcuts
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {Object.entries(groups).map(([group, items]) => (
            <Card key={group} title={group} className="h-full">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((shortcut) => (
                  <div
                    key={`${shortcut.group}-${shortcut.keys}-${shortcut.label}`}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {shortcut.label}
                    </span>
                    <ShortcutKeys keys={shortcut.keys} />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </SettingsLayout>
  );
}

function ShortcutKeys({ keys }: { keys: string }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {keys.split(' ').map((key, index) => (
        <React.Fragment key={`${key}-${index}`}>
          {index > 0 && <span className="text-xs text-slate-400">then</span>}
          <kbd className="min-w-7 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </span>
  );
}
