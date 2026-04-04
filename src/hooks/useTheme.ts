import { useEffect } from 'react';

export function useTheme(theme: 'dark' | 'light'): void {
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
}
