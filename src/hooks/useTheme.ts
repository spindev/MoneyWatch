import { useEffect } from 'react';

/** Applies the dark/light theme class to the document root. */
export function useTheme(theme: 'dark' | 'light'): void {
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
}
