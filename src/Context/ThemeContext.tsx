"use client";

import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Toaster } from 'react-hot-toast';

export const TEMPLATES = [
  {
    id: 'emerald',
    name: 'Modern Civic Emerald',
    tag: 'Default Civic',
    description: 'Clean emerald green and crisp slate for trusted democratic voting.',
    previewColors: ['#059669', '#10b981', '#f8fafc', '#0f172a'],
    isDark: false
  },
  {
    id: 'navy',
    name: 'Royal Executive Navy',
    tag: 'Government & State',
    description: 'Regal navy blue with amber gold accents for executive elections.',
    previewColors: ['#1e3a8a', '#d97706', '#f0f4f9', '#111827'],
    isDark: false
  },
  {
    id: 'dark',
    name: 'Midnight Cyber Security',
    tag: 'High Security Dark',
    description: 'Futuristic obsidian canvas with glowing cyan & emerald verification indicators.',
    previewColors: ['#0b0f19', '#06b6d4', '#10b981', '#f8fafc'],
    isDark: true
  },
  {
    id: 'sunset',
    name: 'Vibrant Indigo & Rose',
    tag: 'Modern & Dynamic',
    description: 'Vibrant indigo with warm rose accents for modern, accessible engagement.',
    previewColors: ['#4f46e5', '#f43f5e', '#faf5ff', '#1e1b4b'],
    isDark: false
  },
  {
    id: 'slate',
    name: 'Nordic Slate & Platinum',
    tag: 'Ultra Minimal',
    description: 'Precision slate and platinum gray for a refined, minimalist aesthetic.',
    previewColors: ['#334155', '#2563eb', '#f1f5f9', '#0f172a'],
    isDark: false
  }
] as const;

export type ThemeId = (typeof TEMPLATES)[number]["id"];

interface ThemeContextValue {
  currentTheme: ThemeId;
  changeTheme: (themeId: ThemeId) => void;
  templates: typeof TEMPLATES;
  selectorOpen: boolean;
  setSelectorOpen: Dispatch<SetStateAction<boolean>>;
  toggleSelector: () => void;
  activeTemplate: (typeof TEMPLATES)[number];
}

const isThemeId = (value: string): value is ThemeId =>
  TEMPLATES.some((template) => template.id === value);

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('dark');
  const [themeLoaded, setThemeLoaded] = useState(false);

  const [selectorOpen, setSelectorOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('evoting_theme');
    if (savedTheme && isThemeId(savedTheme)) {
      setCurrentTheme(savedTheme);
    }
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (themeLoaded) {
      localStorage.setItem('evoting_theme', currentTheme);
    }
  }, [currentTheme, themeLoaded]);

  const changeTheme = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
  };

  const toggleSelector = () => {
    setSelectorOpen((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        changeTheme,
        templates: TEMPLATES,
        selectorOpen,
        setSelectorOpen,
        toggleSelector,
        activeTemplate: TEMPLATES.find((t) => t.id === currentTheme) || TEMPLATES[0]
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #111)',
            border: '1px solid var(--border-color, rgba(0,0,0,0.08))',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }
        }}
      />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }
  return context;
}
