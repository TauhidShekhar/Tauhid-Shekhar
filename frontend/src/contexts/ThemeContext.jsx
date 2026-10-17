import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const applyThemeToDOM = (isDark) => {
  try {
    const root = document.documentElement;
    const body = document.body;

    if (isDark) {
      root.classList.add('dark', 'darkmode');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      if (body) {
        body.classList.add('dark', 'darkmode');
        body.setAttribute('data-theme', 'dark');
        body.style.colorScheme = 'dark';
      }
    } else {
      root.classList.remove('dark', 'darkmode');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      if (body) {
        body.classList.remove('dark', 'darkmode');
        body.setAttribute('data-theme', 'light');
        body.style.colorScheme = 'light';
      }
    }
  } catch (err) {
    console.error('Failed to apply theme to DOM:', err);
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return document.documentElement.classList.contains('dark') || 
             document.documentElement.classList.contains('darkmode') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Ensure DOM classes and localStorage are strictly in sync
  useEffect(() => {
    applyThemeToDOM(isDark);
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (_) {}
  }, [isDark]);

  // Synchronize across browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        const nextDark = e.newValue === 'dark';
        setIsDark(nextDark);
        applyThemeToDOM(nextDark);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      applyThemeToDOM(next);
      return next;
    });
  };

  const setTheme = (mode) => {
    const next = mode === 'dark';
    setIsDark(next);
    applyThemeToDOM(next);
  };

  return (
    <ThemeContext.Provider value={{ isDark, theme: isDark ? 'dark' : 'light', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback if component is rendered outside ThemeProvider
    const isDarkFallback = typeof document !== 'undefined' 
      ? (document.documentElement.classList.contains('dark') || document.documentElement.classList.contains('darkmode'))
      : false;
    return {
      isDark: isDarkFallback,
      theme: isDarkFallback ? 'dark' : 'light',
      toggleTheme: () => {
        const next = !isDarkFallback;
        applyThemeToDOM(next);
        try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch (_) {}
      },
      setTheme: (mode) => {
        applyThemeToDOM(mode === 'dark');
        try { localStorage.setItem('theme', mode); } catch (_) {}
      }
    };
  }
  return context;
};

export default ThemeContext;
