export type ThemePreference = 'light' | 'dark';

const THEME_KEY = 'blepp-theme';

export const getStoredTheme = (): ThemePreference => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  const prefersDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const applyTheme = (theme: ThemePreference) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_KEY, theme);
  }
};

export const initTheme = () => {
  applyTheme(getStoredTheme());
};
