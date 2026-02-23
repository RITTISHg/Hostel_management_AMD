import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ThemeContextType {
    dark: boolean;
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ dark: false, toggle: () => { } });

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [dark, setDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('theme');
            if (stored) return stored === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (dark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    }, [dark]);

    return (
        <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
