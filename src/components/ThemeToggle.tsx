"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

/**
 * ThemeToggle Component
 * 
 * Animated toggle button for switching between light and dark modes.
 * Uses spring physics for smooth icon transitions.
 */
export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-elevated)] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
            <motion.div
                initial={false}
                animate={{
                    rotate: theme === "dark" ? 180 : 0,
                    scale: 1
                }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                }}
            >
                {theme === "light" ? (
                    <Sun size={22} strokeWidth={1.5} className="text-[var(--text-primary)]" />
                ) : (
                    <Moon size={22} strokeWidth={1.5} className="text-[var(--text-primary)]" />
                )}
            </motion.div>
        </motion.button>
    );
}
