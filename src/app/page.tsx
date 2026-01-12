"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Check,
  X,
  Linkedin,
  Github,
  Globe,
} from "lucide-react";
import NumberGrid from "@/components/NumberGrid";
import BonusNumber from "@/components/BonusNumber";
import QuickPick from "@/components/QuickPick";
import ThemeToggle from "@/components/ThemeToggle";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import Logo from "@/components/Logo";
import SimulationEngine, { SimulationStatistics } from "@/components/SimulationEngine";
import {
  SECTION_A,
  SECTION_B,
  calculateTotalOdds,
  calculateProbability,
  formatOdds,
  formatProbability,
} from "@/utils/mathUtils";


/**
 * e-Swerte Main Page
 * 
 * Enterprise-grade lottery application with:
 * - Number selection grids (Section A & B)
 * - Quick Pick randomizer
 * - Analytics dashboard
 * - CSV/TXT export functionality
 */
export default function Home() {
  // Selection state
  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [bonusNumber, setBonusNumber] = useState<number | null>(null);

  // Simulation stats state
  const [simulationStats, setSimulationStats] = useState<SimulationStatistics | null>(null);

  // Check if selection is complete
  const isComplete =
    mainNumbers.length === SECTION_A.COUNT && bonusNumber !== null;

  // Handle main number toggle
  const handleMainNumberToggle = useCallback((num: number) => {
    setMainNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      }
      if (prev.length >= SECTION_A.COUNT) {
        return prev; // Max reached
      }
      return [...prev, num].sort((a, b) => a - b);
    });
  }, []);

  // Handle bonus number selection
  const handleBonusSelect = useCallback((num: number) => {
    setBonusNumber(num);
  }, []);

  // Handle Quick Pick
  const handleQuickPick = useCallback(
    (newMainNumbers: number[], newBonusNumber: number) => {
      setMainNumbers(newMainNumbers);
      setBonusNumber(newBonusNumber);
      // Reset stats on new pick
      setSimulationStats(null);
    },
    []
  );

  // Handle clear all
  const handleClear = useCallback(() => {
    setMainNumbers([]);
    setBonusNumber(null);
    setSimulationStats(null);
  }, []);

  // Handle simulation complete
  const handleSimulationComplete = useCallback((stats: SimulationStatistics) => {
    setSimulationStats(stats);
  }, []);


  return (
    <main className="min-h-screen py-8 md:py-12">
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Logo />
          </motion.div>
          <ThemeToggle />
        </header>

        {/* Main Content Stack */}
        <div className="space-y-12">

          {/* 🎟️ UNIFIED TICKET INTERFACE 🎟️ */}
          <motion.section
            className="surface-card overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-[var(--surface-elevated)] px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Official Entry Board
              </h2>
              <div className="flex items-center gap-2">
                {isComplete ? (
                  <span className="flex items-center gap-1.5 text-green-500 text-xs font-bold uppercase tracking-wide bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                    <Check size={12} strokeWidth={3} />
                    Ready
                  </span>
                ) : (
                  <span className="text-[var(--text-tertiary)] text-xs font-medium uppercase tracking-wide">
                    Incomplete
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-0">

                {/* Section A: Main Numbers (Left - Wider) */}
                <div className="lg:col-span-8 lg:border-r lg:border-[var(--border)] lg:pr-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">Main Numbers</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Select 6 numbers from 1 to 31</p>
                    </div>
                    <div className="text-sm font-medium text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-3 py-1 rounded-lg">
                      {mainNumbers.length} / {SECTION_A.COUNT}
                    </div>
                  </div>
                  <NumberGrid
                    selected={mainNumbers}
                    onToggle={handleMainNumberToggle}
                  />
                </div>

                {/* Section B: Bonus + Actions (Right - Narrower) */}
                <div className="lg:col-span-4 lg:pl-10 space-y-8 flex flex-col h-full">
                  {/* Bonus Selection */}
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Bonus Number</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Select 1 number from 1 to 12</p>
                      </div>
                      {bonusNumber !== null && (
                        <div className="text-sm font-medium text-[var(--accent-secondary)] bg-[var(--accent-secondary)]/10 px-3 py-1 rounded-lg whitespace-nowrap shrink-0">
                          Selected
                        </div>
                      )}
                    </div>

                    <BonusNumber selected={bonusNumber} onSelect={handleBonusSelect} />
                  </div>

                  <div className="hidden lg:block lg:flex-1" /> {/* Spacer to push actions down on desktop */}

                  {/* Control Actions */}
                  <div className="pt-8 border-t border-[var(--border)] space-y-3">
                    <QuickPick onPick={handleQuickPick} />
                    <button
                      onClick={handleClear}
                      className="btn-secondary w-full justify-center h-[50px] font-medium"
                      aria-label="Clear all selections"
                      disabled={mainNumbers.length === 0 && bonusNumber === null}
                    >
                      <Trash2 size={18} strokeWidth={1.5} />
                      <span>Clear Selection</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.section>

          {/* Simulation Engine Section */}
          <motion.section
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SimulationEngine
              mainNumbers={mainNumbers}
              bonusNumber={bonusNumber}
              onSimulationComplete={handleSimulationComplete}
            />
          </motion.section>

          {/* Analytics Dashboard */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AnalyticsDashboard stats={simulationStats} mainNumbers={mainNumbers} bonusNumber={bonusNumber} />
          </motion.section>
        </div>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t border-[var(--border)] text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
            <div className="flex items-center gap-3">
              <Logo size="small" />
              <span className="hidden md:inline text-[var(--border)]">|</span>
              <p className="text-sm text-[var(--text-primary)] font-medium">Lottery System Works</p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              <a
                href="https://www.linkedin.com/in/ramon-logan-jr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[#34c759] hover:border-[#34c759]/30 hover:bg-[#34c759]/5 transition-all duration-200"
              >
                <Linkedin size={18} strokeWidth={1.5} />
              </a>
              <a
                href="https://github.com/ramonloganjr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[#34c759] hover:border-[#34c759]/30 hover:bg-[#34c759]/5 transition-all duration-200"
              >
                <Github size={18} strokeWidth={1.5} />
              </a>
              <a
                href="https://ramonloganjr.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Personal Website"
                className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[#34c759] hover:border-[#34c759]/30 hover:bg-[#34c759]/5 transition-all duration-200"
              >
                <Globe size={18} strokeWidth={1.5} />
              </a>
            </div>

            <div className="text-sm text-[var(--text-tertiary)] flex flex-col md:items-end gap-1">
              <p>© {new Date().getFullYear()} Ramon Logan Jr. — MIT · CC BY 4.0</p>
              <p className="opacity-60">Random number generator for entertainment only.</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
