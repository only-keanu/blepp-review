import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export type ShortcutDefinition = {
  keys: string;
  label: string;
  group: string;
  enabled?: boolean;
  action?: () => void;
};

type ShortcutContextValue = {
  setPageShortcuts: (shortcuts: ShortcutDefinition[]) => void;
};

const ShortcutContext = createContext<ShortcutContextValue | null>(null);

export const routeShortcutDefinitions = [
  { keys: 'g d', label: 'Dashboard', path: '/dashboard' },
  { keys: 'g t', label: 'Study Topics', path: '/dashboard/study/topics' },
  { keys: 'g f', label: 'Manage Flashcards', path: '/dashboard/flashcards' },
  { keys: 'g r', label: 'Flashcard Review', path: '/dashboard/study/flashcards' },
  { keys: 'g q', label: 'Question Bank', path: '/dashboard/questions/bank' },
  { keys: 'g e', label: 'Mock Exams', path: '/dashboard/exams/list' },
  { keys: 'g p', label: 'Progress', path: '/dashboard/progress' },
  { keys: 'g o', label: 'Settings', path: '/dashboard/settings' },
  { keys: 'g a', label: 'Admin Users', path: '/dashboard/admin/users', adminOnly: true }
];

export const helpShortcutDefinition: ShortcutDefinition = {
  keys: '?',
  label: 'Show keyboard shortcuts',
  group: 'Help'
};

export const headerSearchShortcutDefinition: ShortcutDefinition = {
  keys: 'g /',
  label: 'Focus header search',
  group: 'Navigation'
};

export const flashcardReviewShortcutDefinitions: ShortcutDefinition[] = [
  { keys: 'Enter', label: 'Flip card', group: 'Flashcard Review' },
  { keys: '1', label: 'Forgot', group: 'Flashcard Review' },
  { keys: '2', label: 'Unsure', group: 'Flashcard Review' },
  { keys: '3', label: 'Knew it', group: 'Flashcard Review' }
];

export const examShortcutDefinitions: ShortcutDefinition[] = [
  { keys: 'ArrowLeft', label: 'Previous question', group: 'Exam' },
  { keys: 'ArrowRight', label: 'Next question', group: 'Exam' },
  { keys: '1', label: 'Answer choice 1', group: 'Exam' },
  { keys: '2', label: 'Answer choice 2', group: 'Exam' },
  { keys: '3', label: 'Answer choice 3', group: 'Exam' },
  { keys: '4', label: 'Answer choice 4', group: 'Exam' },
  { keys: 'f', label: 'Flag or unflag question', group: 'Exam' },
  { keys: 's', label: 'Open submit confirmation', group: 'Exam' }
];

export const pageShortcutGuideDefinitions: ShortcutDefinition[] = [
  { keys: 'n', label: 'Create flashcard', group: 'Manage Flashcards' },
  { keys: 'n', label: 'Add question manually', group: 'Question Bank' },
  { keys: 'r', label: 'Review questions', group: 'Question Bank' },
  { keys: 'a', label: 'Generate questions with AI', group: 'Question Bank' },
  { keys: 'n', label: 'Add topic', group: 'Study Topics' },
  ...flashcardReviewShortcutDefinitions,
  ...examShortcutDefinitions
];

export function navigationShortcutDefinitions(isAdmin?: boolean): ShortcutDefinition[] {
  return [
    ...routeShortcutDefinitions
      .filter((shortcut) => !shortcut.adminOnly || isAdmin)
      .map((shortcut) => ({
        keys: shortcut.keys,
        label: shortcut.label,
        group: 'Navigation'
      })),
    headerSearchShortcutDefinition
  ];
}

interface KeyboardShortcutsProps {
  children: ReactNode;
  focusHeaderSearch?: () => boolean;
  includeGlobal?: boolean;
  pageShortcuts?: ShortcutDefinition[];
}

export function KeyboardShortcuts({
  children,
  focusHeaderSearch,
  includeGlobal = true,
  pageShortcuts
}: KeyboardShortcutsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [registeredShortcuts, setRegisteredShortcuts] = useState<ShortcutDefinition[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isGPrefixActive, setIsGPrefixActive] = useState(false);
  const gPrefixTimer = useRef<number | null>(null);

  const clearGPrefix = useCallback(() => {
    setIsGPrefixActive(false);
    if (gPrefixTimer.current !== null) {
      window.clearTimeout(gPrefixTimer.current);
      gPrefixTimer.current = null;
    }
  }, []);

  const globalShortcuts = useMemo<ShortcutDefinition[]>(() => {
    if (!includeGlobal) {
      return [];
    }

    const shortcuts: ShortcutDefinition[] = routeShortcutDefinitions
      .filter((shortcut) => !shortcut.adminOnly || user?.admin)
      .map((shortcut) => ({
        keys: shortcut.keys,
        label: shortcut.label,
        group: 'Navigation',
        action: () => navigate(shortcut.path)
      }));

    shortcuts.push({
      ...headerSearchShortcutDefinition,
      enabled: Boolean(focusHeaderSearch),
      action: () => {
        focusHeaderSearch?.();
      }
    });

    return shortcuts;
  }, [focusHeaderSearch, includeGlobal, navigate, user?.admin]);

  const helpShortcut = useMemo<ShortcutDefinition>(
    () => ({
      ...helpShortcutDefinition,
      action: () => setIsHelpOpen(true)
    }),
    []
  );

  const activePageShortcuts = pageShortcuts ?? registeredShortcuts;
  const visibleShortcuts = useMemo(
    () =>
      [helpShortcut, ...globalShortcuts, ...activePageShortcuts].filter(
        (shortcut) => shortcut.enabled !== false
      ),
    [activePageShortcuts, globalShortcuts, helpShortcut]
  );

  useEffect(() => clearGPrefix, [clearGPrefix]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === 'Escape' && isHelpOpen) {
        event.preventDefault();
        setIsHelpOpen(false);
        clearGPrefix();
        return;
      }

      if (shouldIgnoreShortcut(event)) {
        clearGPrefix();
        return;
      }

      const hasModifier = event.altKey || event.ctrlKey || event.metaKey;
      if (hasModifier) {
        clearGPrefix();
        return;
      }

      const key = normalizeKey(event);
      if (!key) {
        clearGPrefix();
        return;
      }

      if (key === '?' && !hasOpenExternalDialog()) {
        event.preventDefault();
        setIsHelpOpen(true);
        clearGPrefix();
        return;
      }

      if (hasOpenExternalDialog() || isHelpOpen) {
        clearGPrefix();
        return;
      }

      if (includeGlobal) {
        if (isGPrefixActive) {
          const sequence = `g ${key}`;
          const shortcut = globalShortcuts.find((item) => item.keys === sequence);
          if (shortcut?.enabled !== false && shortcut?.action) {
            event.preventDefault();
            shortcut.action();
          }
          clearGPrefix();
          return;
        }

        if (key === 'g') {
          event.preventDefault();
          setIsGPrefixActive(true);
          if (gPrefixTimer.current !== null) {
            window.clearTimeout(gPrefixTimer.current);
          }
          gPrefixTimer.current = window.setTimeout(clearGPrefix, 1200);
          return;
        }
      }

      const pageShortcut = activePageShortcuts.find(
        (shortcut) => shortcut.keys.toLowerCase() === key.toLowerCase()
      );
      if (pageShortcut?.enabled !== false && pageShortcut?.action) {
        event.preventDefault();
        pageShortcut.action();
        clearGPrefix();
      } else if (isGPrefixActive) {
        clearGPrefix();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activePageShortcuts,
    clearGPrefix,
    globalShortcuts,
    includeGlobal,
    isGPrefixActive,
    isHelpOpen
  ]);

  const contextValue = useMemo(
    () => ({
      setPageShortcuts: setRegisteredShortcuts
    }),
    []
  );

  return (
    <ShortcutContext.Provider value={contextValue}>
      {children}
      <ShortcutsHelpDialog
        isOpen={isHelpOpen}
        shortcuts={visibleShortcuts}
        onClose={() => {
          setIsHelpOpen(false);
          clearGPrefix();
        }}
      />
    </ShortcutContext.Provider>
  );
}

export function usePageShortcuts(shortcuts: ShortcutDefinition[]) {
  const context = useContext(ShortcutContext);

  useEffect(() => {
    if (!context) {
      return;
    }
    context.setPageShortcuts(shortcuts);
    return () => context.setPageShortcuts([]);
  }, [context, shortcuts]);
}

function ShortcutsHelpDialog({
  isOpen,
  shortcuts,
  onClose
}: {
  isOpen: boolean;
  shortcuts: ShortcutDefinition[];
  onClose: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  const groups = shortcuts.reduce<Record<string, ShortcutDefinition[]>>((acc, shortcut) => {
    if (!acc[shortcut.group]) {
      acc[shortcut.group] = [];
    }
    acc[shortcut.group].push(shortcut);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
        data-shortcuts-dialog="true"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 id="keyboard-shortcuts-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close keyboard shortcuts"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
          {Object.entries(groups).map(([group, items]) => (
            <section key={group}>
              <h3 className="mb-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                {group}
              </h3>
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                {items.map((shortcut) => (
                  <div
                    key={`${shortcut.group}-${shortcut.keys}-${shortcut.label}`}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {shortcut.label}
                    </span>
                    <ShortcutKeys keys={shortcut.keys} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
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

function normalizeKey(event: KeyboardEvent) {
  if (event.key === '?') {
    return '?';
  }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    return event.key;
  }
  if (event.key.length === 1) {
    return event.key.toLowerCase();
  }
  if (event.key === 'Enter') {
    return 'Enter';
  }
  return '';
}

function shouldIgnoreShortcut(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  if (!target) {
    return false;
  }

  return Boolean(
    target.isContentEditable ||
      target.closest(
        'input, textarea, select, button, a[href], [role="button"], [contenteditable="true"]'
      )
  );
}

function hasOpenExternalDialog() {
  return Boolean(
    document.querySelector('[role="dialog"][aria-modal="true"]:not([data-shortcuts-dialog="true"])')
  );
}
