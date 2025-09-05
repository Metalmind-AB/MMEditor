/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'auto',
  storageKey = 'mmeditor-theme',
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      setThemeState(savedTheme as ThemeMode);
    }
  }, [storageKey]);

  // Handle auto theme detection
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(prefersDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme as 'light' | 'dark');
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateResolvedTheme();
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [theme]);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-mmeditor-theme', resolvedTheme);
    
    // Update CSS variables based on theme
    if (resolvedTheme === 'dark') {
      root.style.setProperty('--mme-background', '#1e1e1e');
      root.style.setProperty('--mme-text-color', '#e0e0e0');
      root.style.setProperty('--mme-border-color', '#444');
      root.style.setProperty('--mme-toolbar-bg', '#2d2d2d');
      root.style.setProperty('--mme-toolbar-border', '#444');
      root.style.setProperty('--mme-button-color', '#e0e0e0');
      root.style.setProperty('--mme-button-hover-bg', '#3a3a3a');
      root.style.setProperty('--mme-button-active-bg', '#4a4a4a');
      root.style.setProperty('--mme-button-active-color', '#4db8ff');
      root.style.setProperty('--mme-placeholder-color', '#666');
      root.style.setProperty('--mme-selection-bg', '#3a5f8a');
      root.style.setProperty('--mme-link-color', '#4db8ff');
      root.style.setProperty('--mme-link-hover-color', '#80d4ff');
      root.style.setProperty('--mme-code-bg', '#2d2d2d');
      root.style.setProperty('--mme-code-color', '#ff9999');
      root.style.setProperty('--mme-codeblock-bg', '#252525');
      root.style.setProperty('--mme-codeblock-color', '#e0e0e0');
      root.style.setProperty('--mme-table-border', '#444');
      root.style.setProperty('--mme-table-header-bg', '#2d2d2d');
      root.style.setProperty('--mme-readonly-bg', '#252525');
    } else {
      // Reset to light theme (default values)
      root.style.setProperty('--mme-background', '#fff');
      root.style.setProperty('--mme-text-color', '#333');
      root.style.setProperty('--mme-border-color', '#ddd');
      root.style.setProperty('--mme-toolbar-bg', '#f5f5f5');
      root.style.setProperty('--mme-toolbar-border', '#ddd');
      root.style.setProperty('--mme-button-color', '#333');
      root.style.setProperty('--mme-button-hover-bg', '#e0e0e0');
      root.style.setProperty('--mme-button-active-bg', '#d0d0d0');
      root.style.setProperty('--mme-button-active-color', '#0066cc');
      root.style.setProperty('--mme-placeholder-color', '#999');
      root.style.setProperty('--mme-selection-bg', '#b4d5fe');
      root.style.setProperty('--mme-link-color', '#0066cc');
      root.style.setProperty('--mme-link-hover-color', '#0052a3');
      root.style.setProperty('--mme-code-bg', '#f5f5f5');
      root.style.setProperty('--mme-code-color', '#d14');
      root.style.setProperty('--mme-codeblock-bg', '#f8f8f8');
      root.style.setProperty('--mme-codeblock-color', '#333');
      root.style.setProperty('--mme-table-border', '#ddd');
      root.style.setProperty('--mme-table-header-bg', '#f5f5f5');
      root.style.setProperty('--mme-readonly-bg', '#f5f5f5');
    }
  }, [resolvedTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

