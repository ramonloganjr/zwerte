"use client";

import { motion } from "framer-motion";
import { SECTION_B } from "@/utils/mathUtils";

interface BonusNumberProps {
    selected: number | null;
    onSelect: (num: number) => void;
    disabled?: boolean;
}

/**
 * BonusNumber Component - Section B
 * 
 * Displays a grid of numbers (01-12) for bonus number selection.
 * Only 1 selection allowed (auto-deselects previous on new selection).
 */
export default function BonusNumber({ selected, onSelect, disabled = false }: BonusNumberProps) {
    const numbers = Array.from({ length: SECTION_B.MAX }, (_, i) => i + 1);

    return (
        <div className="w-full">
            {/* Grid Only - Header removed */}

            {/* Number Grid - 6 columns for 12 numbers */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
                {numbers.map((num) => {
                    const isSelected = selected === num;

                    return (
                        <motion.button
                            key={num}
                            onClick={() => onSelect(num)}
                            disabled={disabled}
                            className={`number-btn ${isSelected ? "selected" : ""}`}
                            whileHover={!disabled ? { scale: 1.05 } : undefined}
                            whileTap={!disabled ? { scale: 0.95 } : undefined}
                            initial={false}
                            animate={{
                                backgroundColor: isSelected ? "var(--accent-primary)" : "var(--surface)",
                                borderColor: isSelected ? "var(--accent-primary)" : "var(--border)",
                                color: isSelected ? "#FFFFFF" : "var(--text-primary)",
                            }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            aria-label={`Select bonus number ${num.toString().padStart(2, "0")}${isSelected ? " (selected)" : ""}`}
                            aria-pressed={isSelected}
                        >
                            {num.toString().padStart(2, "0")}
                        </motion.button>
                    );
                })}
            </div>


        </div>
    );
}
