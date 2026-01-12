"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

// Default context value for hydration safety
const defaultContext: ThemeContextType = {
    theme: "light",
    toggleTheme: () => { },
    setTheme: () => { },
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("zwerte-theme") as Theme | null;
        if (stored) {
            setThemeState(stored);
            document.documentElement.setAttribute("data-theme", stored);
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const systemTheme: Theme = prefersDark ? "dark" : "light";
            setThemeState(systemTheme);
            document.documentElement.setAttribute("data-theme", systemTheme);
        }
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            const stored = localStorage.getItem("zwerte-theme");
            if (!stored) {
                const newTheme: Theme = e.matches ? "dark" : "light";
                setThemeState(newTheme);
                document.documentElement.setAttribute("data-theme", newTheme);
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("zwerte-theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    const toggleTheme = () => {
        const newTheme: Theme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
    };

    // Always provide context value for consistent hydration
    const contextValue: ThemeContextType = {
        theme: mounted ? theme : "light",
        toggleTheme: mounted ? toggleTheme : () => { },
        setTheme: mounted ? setTheme : () => { },
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
