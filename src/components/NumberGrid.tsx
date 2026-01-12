"use client";

import { motion } from "framer-motion";
import { SECTION_A } from "@/utils/mathUtils";

interface NumberGridProps {
    selected: number[];
    onToggle: (num: number) => void;
    disabled?: boolean;
}

/**
 * NumberGrid Component - Section A
 * 
 * Displays a responsive grid of numbers (01-31) for main number selection.
 * - Mobile: 5-column grid
 * - Desktop: 8-column grid
 * - Max 6 selections allowed
 */
export default function NumberGrid({ selected, onToggle, disabled = false }: NumberGridProps) {
    const numbers = Array.from({ length: SECTION_A.MAX }, (_, i) => i + 1);
    const maxReached = selected.length >= SECTION_A.COUNT;

    return (
        <div className="w-full">
            {/* Grid Only - Header removed */}
            <div className="grid grid-cols-5 md:grid-cols-8 gap-2 md:gap-3">
                {numbers.map((num) => {
                    const isSelected = selected.includes(num);
                    const isDisabled = disabled || (maxReached && !isSelected);

                    return (
                        <motion.button
                            key={num}
                            onClick={() => onToggle(num)}
                            disabled={isDisabled}
                            className={`number-btn ${isSelected ? "selected" : ""}`}
                            whileHover={!isDisabled ? { scale: 1.05 } : undefined}
                            whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                            initial={false}
                            animate={{
                                backgroundColor: isSelected ? "var(--accent-primary)" : "var(--surface)",
                                borderColor: isSelected ? "var(--accent-primary)" : "var(--border)",
                                color: isSelected ? "#FFFFFF" : "var(--text-primary)",
                            }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            aria-label={`Select number ${num.toString().padStart(2, "0")}${isSelected ? " (selected)" : ""}`}
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
