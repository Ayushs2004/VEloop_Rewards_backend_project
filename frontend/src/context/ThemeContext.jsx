import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // 'dark' | 'light' | 'system'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('veloop_theme') || 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState('dark');

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      let active = theme;
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        active = systemPrefersDark ? 'dark' : 'light';
      }
      setResolvedTheme(active);
      root.setAttribute('data-theme', active);
    };

    applyTheme();
    localStorage.setItem('veloop_theme', theme);

    if (theme === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
