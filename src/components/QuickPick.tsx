"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Shuffle } from "lucide-react";
import { generateRandomNumbers, SECTION_A, SECTION_B } from "@/utils/mathUtils";

interface QuickPickProps {
    onPick: (mainNumbers: number[], bonusNumber: number) => void;
    disabled?: boolean;
}

/**
 * QuickPick Component
 * 
 * "Smart Randomizer" button that generates random valid selections
 * with a shuffle animation before locking in numbers.
 */
export default function QuickPick({ onPick, disabled = false }: QuickPickProps) {
    const [isShuffling, setIsShuffling] = useState(false);

    const handleQuickPick = useCallback(async () => {
        if (isShuffling || disabled) return;

        setIsShuffling(true);

        // Simulate shuffle animation (300ms)
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Generate random numbers
        const mainNumbers = generateRandomNumbers(
            SECTION_A.COUNT,
            SECTION_A.MIN,
            SECTION_A.MAX
        );

        const bonusNumbers = generateRandomNumbers(
            SECTION_B.COUNT,
            SECTION_B.MIN,
            SECTION_B.MAX
        );

        onPick(mainNumbers, bonusNumbers[0]);
        setIsShuffling(false);
    }, [isShuffling, disabled, onPick]);

    return (
        <motion.button
            onClick={handleQuickPick}
            disabled={disabled || isShuffling}
            className="btn-primary w-full h-[56px] text-lg font-bold shadow-lg shadow-[var(--accent-primary)]/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Quick Pick - Generate random numbers"
        >
            <motion.div
                animate={isShuffling ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <Shuffle size={24} strokeWidth={2} />
            </motion.div>
            <span>{isShuffling ? "Shuffling..." : "Quick Pick"}</span>
        </motion.button>
    );
}
