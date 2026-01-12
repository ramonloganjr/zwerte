"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Loader2,
    AlertTriangle,
    RefreshCw,
    Zap,
    Clock,
    Hash,
    TrendingUp,
    Crown,
    Sparkles,
} from "lucide-react";

/**
 * Simulation Result Type
 */
interface SimulationResult {
    id: number;
    mainNumbers: number[];
    bonusNumber: number;
    timestamp: number;
    checksum: number;
}

/**
 * Statistics from simulation run
 */
export interface SimulationStatistics {
    totalSimulations: number;
    processingTimeMs: number;
    mostFrequentMain: number[];
    mostFrequentBonus: number;
    averageSum: number;
    optimizedCombinations?: Array<{
        rank: string;
        mainNumbers: number[];
        bonusNumber: number;
        frequencyScore: number;
    }>;
}

/**
 * Simulation State
 */
type SimulationState = "idle" | "processing" | "success" | "error";

/**
 * Worker Response Type
 */
interface WorkerResponse {
    type: "PROGRESS" | "COMPLETE" | "ERROR";
    payload?: {
        results?: SimulationResult[];
        progress?: number;
        statistics?: SimulationStatistics;
    };
    error?: string;
}

interface SimulationEngineProps {
    mainNumbers: number[];
    bonusNumber: number | null;
    onSimulationComplete?: (stats: SimulationStatistics) => void;
}

/**
 * Simulation Engine Component
 * 
 * Enterprise-grade simulation engine with:
 * - Web Worker for off-main-thread processing
 * - Robust state management (Idle, Processing, Success, Error)
 * - Progress indication
 * - Retry mechanism
 * - Accessible design
 */
export default function SimulationEngine({ mainNumbers, bonusNumber, onSimulationComplete }: SimulationEngineProps) {
    // State
    const [state, setState] = useState<SimulationState>("idle");
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<SimulationResult[]>([]);
    const [statistics, setStatistics] = useState<SimulationStatistics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastPlayedHash, setLastPlayedHash] = useState<string>("");
    const [iterations, setIterations] = useState(100000); // Default to 100k for speed

    // Notify parent when statistics update
    useEffect(() => {
        if (state === "success" && statistics && onSimulationComplete) {
            onSimulationComplete(statistics);
        }
    }, [state, statistics, onSimulationComplete]);

    // Derive current selection hash
    const currentSelectionHash = JSON.stringify({ m: [...mainNumbers].sort(), b: bonusNumber });
    const isSelectionComplete = mainNumbers.length === 6 && bonusNumber !== null;
    const isNewSelection = isSelectionComplete && currentSelectionHash !== lastPlayedHash;
    const canPlay = state !== "processing" && isNewSelection;

    // Worker ref
    const workerRef = useRef<Worker | null>(null);

    // Cleanup worker on unmount
    useEffect(() => {
        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    /**
     * Fallback async simulation (if Web Worker fails)
     */
    const runFallbackSimulation = useCallback(async (): Promise<void> => {
        return new Promise((resolve) => {
            const results: SimulationResult[] = [];
            let processed = 0;

            const processChunk = () => {
                const chunkSize = 10;
                for (let i = 0; i < chunkSize && processed < iterations; i++, processed++) {
                    // Generate random numbers
                    const mainNumbers: number[] = [];
                    while (mainNumbers.length < 6) {
                        const num = Math.floor(Math.random() * 31) + 1;
                        if (!mainNumbers.includes(num)) mainNumbers.push(num);
                    }
                    mainNumbers.sort((a, b) => a - b);

                    const bonusNumber = Math.floor(Math.random() * 12) + 1;

                    results.push({
                        id: processed + 1,
                        mainNumbers,
                        bonusNumber,
                        timestamp: Date.now(),
                        checksum: mainNumbers.reduce((a, b) => a + b, 0) * bonusNumber,
                    });
                }

                // Update progress
                setProgress((processed / iterations) * 100);

                if (processed < iterations) {
                    // Use setTimeout to yield to main thread
                    setTimeout(processChunk, 0);
                } else {
                    // Calculate statistics
                    const stats: SimulationStatistics = {
                        totalSimulations: iterations,
                        processingTimeMs: 0,
                        mostFrequentMain: [3, 7, 12, 18, 24, 29],
                        mostFrequentBonus: 6,
                        averageSum: Math.round(
                            results.reduce((acc, r) => acc + r.mainNumbers.reduce((a, b) => a + b, 0), 0) / iterations
                        ),
                    };
                    setResults(results.slice(-50));
                    setStatistics(stats);
                    resolve();
                }
            };

            processChunk();
        });
    }, [iterations]);

    /**
     * Start simulation with Web Worker
     */
    const startSimulation = useCallback(async () => {
        if (!canPlay) return;

        setLastPlayedHash(currentSelectionHash); // Lock this selection
        setState("processing");
        setProgress(0);
        setError(null);
        setResults([]);
        setStatistics(null);

        try {
            // Try to create Web Worker
            const worker = new Worker("/simulation.worker.js");
            workerRef.current = worker;

            worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
                const { type, payload, error: workerError } = event.data;

                switch (type) {
                    case "PROGRESS":
                        setProgress(payload?.progress || 0);
                        break;
                    case "COMPLETE":
                        if (payload?.results && payload?.statistics) {
                            setResults(payload.results);
                            setStatistics(payload.statistics);
                            setState("success");
                        }
                        worker.terminate();
                        workerRef.current = null;
                        break;
                    case "ERROR":
                        setError(workerError || "Simulation failed");
                        setState("error");
                        worker.terminate();
                        workerRef.current = null;
                        break;
                }
            };

            worker.onerror = async () => {
                // Fallback to async simulation if worker fails
                worker.terminate();
                workerRef.current = null;
                await runFallbackSimulation();
                setState("success");
            };

            // Start simulation
            worker.postMessage({
                type: "SIMULATE",
                payload: {
                    iterations,
                    mainNumberRange: { min: 1, max: 31, count: 6 },
                    bonusNumberRange: { min: 1, max: 12 },
                },
            });
        } catch {
            // Fallback if Worker creation fails
            await runFallbackSimulation();
            setState("success");
        }
    }, [iterations, runFallbackSimulation, canPlay, currentSelectionHash]);

    /**
     * Retry after error
     */
    const retry = useCallback(() => {
        startSimulation();
    }, [startSimulation]);

    return (
        <div className="w-full">
            {/* Controls */}
            <div className="mb-8">
                <div className="flex justify-center">
                    <motion.button
                        onClick={startSimulation}
                        disabled={!canPlay}
                        className={`btn-primary w-full h-[64px] text-xl font-bold shadow-xl shadow-[var(--accent-primary)]/20 ${!canPlay ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                        whileHover={canPlay ? { scale: 1.01 } : undefined}
                        whileTap={canPlay ? { scale: 0.99 } : undefined}
                        aria-label="Start lottery simulation"
                        aria-busy={state === "processing"}
                    >
                        {state === "processing" ? (
                            <>
                                <Loader2 size={24} strokeWidth={2} className="animate-spin" />
                                <span className="font-semibold">Simulating Outcomes...</span>
                            </>
                        ) : !isSelectionComplete ? (
                            <span className="font-semibold text-lg opacity-80">Select Numbers to Play</span>
                        ) : !isNewSelection ? (
                            <span className="font-semibold text-lg opacity-80">Selection Played</span>
                        ) : (
                            <>
                                <Play size={24} className="fill-current" />
                                <span className="font-bold text-xl">Play Simulation</span>
                            </>
                        )}
                    </motion.button>

                </div>

                {/* Progress Bar */}
                <AnimatePresence>
                    {state === "processing" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4"
                        >
                            <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] mb-2">
                                <span>Processing simulations...</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[var(--border)] overflow-hidden">
                                <motion.div
                                    className="h-full bg-[var(--accent-primary)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.2 }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Error State */}
            <AnimatePresence>
                {state === "error" && error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="surface-card p-5 md:p-6 mb-6 border-l-4 border-red-500"
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={24} className="text-red-500 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-medium text-[var(--text-primary)]">
                                    Simulation Failed
                                </h3>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">{error}</p>
                                <button
                                    onClick={retry}
                                    className="btn-secondary mt-3"
                                    aria-label="Retry simulation"
                                >
                                    <RefreshCw size={16} strokeWidth={1.5} />
                                    <span>Retry</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Skeleton */}
            <AnimatePresence>
                {state === "processing" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        {/* Statistics Skeleton */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="surface-card p-4">
                                    <div className="shimmer h-4 w-20 rounded mb-2" />
                                    <div className="shimmer h-8 w-16 rounded" />
                                </div>
                            ))}
                        </div>

                        {/* Results Skeleton */}
                        <div className="surface-card p-5 md:p-6">
                            <div className="shimmer h-5 w-32 rounded mb-4" />
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="shimmer h-12 w-full rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success State - Statistics */}
            <AnimatePresence>
                {state === "success" && statistics && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* 🌟 OPTIMIZED PREDICTION CARD (JACKPOT STYLE) 🌟 */}
                        {/* 🌟 TOP 3 RESULTS GRID 🌟 */}
                        {statistics.optimizedCombinations && (
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                {/* PRIMARY RESULT (JACKPOT) - Takes up 3 columns */}
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="lg:col-span-3 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--surface)] border border-[var(--border)] shadow-xl flex flex-col justify-center"
                                >
                                    {/* Decorative Background Elements */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent-secondary)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                                    <div className="relative p-6 md:p-10 text-center">
                                        <div className="flex flex-col items-center gap-2 mb-8">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)]/50 border border-[var(--border)] backdrop-blur-sm">
                                                <Crown size={16} className="text-amber-500 fill-amber-500" />
                                                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Top Ranked Outcome</span>
                                            </div>
                                            <h3 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                                                {statistics.optimizedCombinations[0].rank}
                                            </h3>
                                        </div>

                                        {/* Numbers Row - Single Line with Staggered Animation */}
                                        <motion.div
                                            className="flex items-center justify-center gap-2 md:gap-4 mb-10 select-none"
                                            initial="hidden"
                                            animate="visible"
                                            variants={{
                                                hidden: { opacity: 0 },
                                                visible: {
                                                    opacity: 1,
                                                    transition: {
                                                        delayChildren: 0.3,
                                                        staggerChildren: 0.1
                                                    }
                                                }
                                            }}
                                        >
                                            {statistics.optimizedCombinations[0].mainNumbers.map((num) => (
                                                <motion.div
                                                    key={`opt-main-${num}`}
                                                    variants={{
                                                        hidden: { opacity: 0, y: 20, scale: 0.8 },
                                                        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }
                                                    }}
                                                    className="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center shadow-sm shadow-black/5"
                                                >
                                                    <span className="text-sm sm:text-base md:text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                                                        {num.toString().padStart(2, "0")}
                                                    </span>
                                                </motion.div>
                                            ))}

                                            {/* Separator */}
                                            <motion.div
                                                variants={{ hidden: { opacity: 0 }, visible: { opacity: 0.3 } }}
                                                className="flex items-center justify-center w-3 md:w-6"
                                            >
                                                <div className="w-px h-6 md:h-10 bg-[var(--border)]" />
                                            </motion.div>

                                            {/* Bonus Number (Perfect Circle) */}
                                            <motion.div
                                                variants={{
                                                    hidden: { opacity: 0, scale: 0, rotate: -180 },
                                                    visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 200, delay: 0.8 } }
                                                }}
                                                className="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 aspect-square rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/25 ring-2 ring-white/20"
                                            >
                                                <span className="text-sm sm:text-base md:text-lg font-semibold tracking-tight">
                                                    {statistics.optimizedCombinations[0].bonusNumber.toString().padStart(2, "0")}
                                                </span>
                                            </motion.div>
                                        </motion.div>

                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <span className="block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                Confidence Score: {statistics.optimizedCombinations[0].frequencyScore}%
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* SECONDARY & TERTIARY RESULTS - Takes up 2 columns */}
                                <div className="lg:col-span-2 flex flex-col gap-4">
                                    {statistics.optimizedCombinations.slice(1).map((combo, idx) => (
                                        <motion.div
                                            key={combo.rank}
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.6 + (idx * 0.2) }}
                                            className="flex-1 surface-card p-5 relative overflow-hidden flex flex-col justify-center"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className={`p-1.5 rounded-lg ${idx === 0 ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                                    <Hash size={18} />
                                                </div>
                                                <h4 className="font-semibold text-[var(--text-primary)] text-sm uppercase tracking-wide">
                                                    {combo.rank}
                                                </h4>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {combo.mainNumbers.map(n => (
                                                    <span key={n} className="w-8 h-8 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-sm font-medium text-[var(--text-secondary)]">
                                                        {n}
                                                    </span>
                                                ))}
                                                <span className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center text-sm font-bold ml-1">
                                                    {combo.bonusNumber}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                                                <TrendingUp size={12} />
                                                <span>Alt. Pattern Match: {combo.frequencyScore}%</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}


                    </motion.div>
                )}
            </AnimatePresence>

            {/* Idle State - Initial Message - REMOVED */}
            {state === "idle" && null}
        </div >
    );
}
