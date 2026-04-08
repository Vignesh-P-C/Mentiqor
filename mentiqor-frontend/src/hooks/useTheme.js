import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('mq-theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mq-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggleTheme };
}