"use client";

import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

interface LogoProps {
    size?: "default" | "small";
}

/**
 * Logo Component
 * 
 * Theme-aware logo that switches between light and dark variants
 * for optimal contrast and visual consistency.
 */
export default function Logo({ size = "default" }: LogoProps) {
    const { theme } = useTheme();

    // Use light-background logo for light theme, dark-background logo for dark theme
    const logoSrc = theme === "dark"
        ? "/logo-dark-background.svg"
        : "/logo-light-background.svg";

    const sizeClasses = size === "small"
        ? "h-8 md:h-10 w-auto"
        : "h-16 md:h-20 w-auto";

    return (
        <Image
            src={logoSrc}
            alt="zwerte - Lottery System Works Generator"
            width={320}
            height={70}
            priority
            className={sizeClasses}
        />
    );
}

