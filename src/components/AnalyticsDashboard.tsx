"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    Percent,
    Lightbulb,
    ChevronDown,
    ChevronUp,
    Zap,
    Activity,
    Timer,
    Scale,
    Hash,
    ArrowUpDown,
    Target,
    Sparkles,
} from "lucide-react";
import {
    calculateTotalOdds,
    calculateProbability,
    formatOdds,
    formatProbability,
    getStrategicInsights,
    combination,
    SECTION_A,
} from "@/utils/mathUtils";
import { SimulationStatistics } from "@/components/SimulationEngine";

interface AnalyticsDashboardProps {
    stats?: SimulationStatistics | null;
    mainNumbers?: number[];
    bonusNumber?: number | null;
}

// Animated Counter Hook
function useAnimatedCounter(value: number, duration: number = 1000) {
    const [displayValue, setDisplayValue] = useState(0);
    const previousValue = useRef(0);

    useEffect(() => {
        if (value === previousValue.current) return;

        const startValue = previousValue.current;
        const endValue = value;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (endValue - startValue) * easeOut;

            setDisplayValue(Math.round(currentValue));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                previousValue.current = endValue;
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return displayValue;
}

// Radial Progress Component
function RadialProgress({ value, max, size = 60, strokeWidth = 4, color = "var(--accent-primary)", label }: {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
}) {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress Circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                        strokeDasharray: circumference,
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                    {label || `${Math.round(percentage)}%`}
                </span>
            </div>
        </div>
    );
}

// Mini Stat Badge Component
function StatBadge({ icon: Icon, label, value, status }: {
    icon: React.ElementType;
    label: string;
    value: string;
    status: "good" | "neutral" | "warning";
}) {
    const statusColors = {
        good: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        neutral: "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/20",
        warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    };

    return (
        <motion.div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusColors[status]}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Icon size={14} strokeWidth={2} />
            <span className="text-xs font-medium">{label}: <strong>{value}</strong></span>
        </motion.div>
    );
}

export default function AnalyticsDashboard({ stats, mainNumbers = [], bonusNumber }: AnalyticsDashboardProps) {
    const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

    const totalOdds = calculateTotalOdds();
    const probability = calculateProbability();
    const insights = getStrategicInsights();
    const sectionACombinations = combination(31, 6);

    // ============ DYNAMIC REAL-TIME ANALYSIS ============

    // Calculate selection-based metrics
    const selectionAnalysis = useMemo(() => {
        if (mainNumbers.length === 0) {
            return {
                sum: 0,
                oddCount: 0,
                evenCount: 0,
                highCount: 0,
                lowCount: 0,
                consecutiveCount: 0,
                selectionProgress: 0,
                sumStatus: "neutral" as const,
                balanceStatus: "neutral" as const,
                parityStatus: "neutral" as const,
                consecutiveStatus: "neutral" as const,
            };
        }

        const sum = mainNumbers.reduce((a, b) => a + b, 0);
        const oddCount = mainNumbers.filter(n => n % 2 !== 0).length;
        const evenCount = mainNumbers.length - oddCount;
        const midpoint = Math.floor((SECTION_A.MAX + SECTION_A.MIN) / 2);
        const lowCount = mainNumbers.filter(n => n <= midpoint).length;
        const highCount = mainNumbers.length - lowCount;

        // Detect consecutive numbers
        const sorted = [...mainNumbers].sort((a, b) => a - b);
        let consecutiveCount = 0;
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] - sorted[i - 1] === 1) consecutiveCount++;
        }

        // Selection progress
        const selectionProgress = (mainNumbers.length / SECTION_A.COUNT) * 100;

        // Evaluate sum (optimal range ~96-155 for 6 numbers from 1-31)
        const optimalSumMin = 96;
        const optimalSumMax = 155;
        const sumStatus: "good" | "neutral" | "warning" =
            mainNumbers.length < 6 ? "neutral" :
                (sum >= optimalSumMin && sum <= optimalSumMax) ? "good" : "warning";

        // Evaluate balance (optimal: 3 low, 3 high)
        const balanceDiff = Math.abs(lowCount - highCount);
        const balanceStatus: "good" | "neutral" | "warning" =
            mainNumbers.length < 6 ? "neutral" :
                balanceDiff <= 2 ? "good" : "warning";

        // Evaluate parity (optimal: 3 odd, 3 even)
        const parityDiff = Math.abs(oddCount - evenCount);
        const parityStatus: "good" | "neutral" | "warning" =
            mainNumbers.length < 6 ? "neutral" :
                parityDiff <= 2 ? "good" : "warning";

        // Evaluate consecutive (optimal: minimal consecutive)
        const consecutiveStatus: "good" | "neutral" | "warning" =
            mainNumbers.length < 3 ? "neutral" :
                consecutiveCount <= 1 ? "good" : consecutiveCount <= 2 ? "neutral" : "warning";

        return {
            sum,
            oddCount,
            evenCount,
            highCount,
            lowCount,
            consecutiveCount,
            selectionProgress,
            sumStatus,
            balanceStatus,
            parityStatus,
            consecutiveStatus,
        };
    }, [mainNumbers]);

    // Calculate overall selection quality score
    const qualityScore = useMemo(() => {
        if (mainNumbers.length < 6) return 0;

        let score = 0;
        if (selectionAnalysis.sumStatus === "good") score += 25;
        else if (selectionAnalysis.sumStatus === "neutral") score += 15;

        if (selectionAnalysis.balanceStatus === "good") score += 25;
        else if (selectionAnalysis.balanceStatus === "neutral") score += 15;

        if (selectionAnalysis.parityStatus === "good") score += 25;
        else if (selectionAnalysis.parityStatus === "neutral") score += 15;

        if (selectionAnalysis.consecutiveStatus === "good") score += 25;
        else if (selectionAnalysis.consecutiveStatus === "neutral") score += 15;

        return score;
    }, [mainNumbers.length, selectionAnalysis]);

    // Animated values
    const animatedSimulations = useAnimatedCounter(stats?.totalSimulations ?? 0, 1200);
    const animatedAverageSum = useAnimatedCounter(stats?.averageSum ?? 0, 800);
    const animatedPatternStrength = useAnimatedCounter(
        stats ? Math.round((stats.mostFrequentMain.length / 6) * 100) : 0,
        600
    );
    const animatedProcessingTime = useAnimatedCounter(stats?.processingTimeMs ?? 0, 500);
    const animatedSum = useAnimatedCounter(selectionAnalysis.sum, 400);
    const animatedQuality = useAnimatedCounter(qualityScore, 600);

    // Calculate dynamic insights if stats exist
    const sumAnalysis = stats ? (
        stats.averageSum < 100 ? "Low" : stats.averageSum > 150 ? "High" : "Balanced"
    ) : "N/A";

    const sumProgress = stats ? Math.min(100, (stats.averageSum / 200) * 100) : 0;

    const isSelectionComplete = mainNumbers.length === 6 && bonusNumber !== null;

    return (
        <div className="w-full space-y-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                Analytics Dashboard
            </h2>

            {/* ============ LIVE SELECTION ANALYSIS ============ */}
            <AnimatePresence mode="wait">
                {mainNumbers.length > 0 && (
                    <motion.div
                        key="selection-analysis"
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="surface-card p-6 border-l-4 border-[var(--accent-secondary)]"
                    >
                        <div className="flex items-start gap-4">
                            <motion.div
                                className="p-3 rounded-xl bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)]"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Target size={24} />
                            </motion.div>
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                        Live Selection Analysis
                                    </h3>
                                    <motion.span
                                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center gap-1.5"
                                        key={mainNumbers.length}
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        {mainNumbers.length}/{SECTION_A.COUNT} selected
                                    </motion.span>
                                </div>

                                {/* Selection Progress Bar */}
                                <div className="space-y-1">
                                    <div className="h-2 w-full bg-[var(--border)] rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-primary)] rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${selectionAnalysis.selectionProgress}%` }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>

                                {/* Real-time Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {/* Sum Total */}
                                    <motion.div
                                        className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]"
                                        layout
                                    >
                                        <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold mb-1">Sum</div>
                                        <div className="flex items-baseline gap-1.5">
                                            <motion.span
                                                className="text-2xl font-bold text-[var(--text-primary)] tabular-nums"
                                                key={selectionAnalysis.sum}
                                            >
                                                {animatedSum}
                                            </motion.span>
                                            {mainNumbers.length === 6 && (
                                                <motion.span
                                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${selectionAnalysis.sumStatus === "good"
                                                            ? "bg-emerald-500/10 text-emerald-500"
                                                            : selectionAnalysis.sumStatus === "warning"
                                                                ? "bg-amber-500/10 text-amber-500"
                                                                : "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                                                        }`}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                >
                                                    {selectionAnalysis.sumStatus === "good" ? "Optimal" :
                                                        selectionAnalysis.sumStatus === "warning" ? "Off" : "—"}
                                                </motion.span>
                                            )}
                                        </div>
                                        <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">Target: 96-155</p>
                                    </motion.div>

                                    {/* Odd/Even Ratio */}
                                    <motion.div
                                        className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]"
                                        layout
                                    >
                                        <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold mb-1">Odd/Even</div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                                                {selectionAnalysis.oddCount}/{selectionAnalysis.evenCount}
                                            </span>
                                            {mainNumbers.length === 6 && (
                                                <motion.span
                                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${selectionAnalysis.parityStatus === "good"
                                                            ? "bg-emerald-500/10 text-emerald-500"
                                                            : "bg-amber-500/10 text-amber-500"
                                                        }`}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                >
                                                    {selectionAnalysis.parityStatus === "good" ? "Balanced" : "Skewed"}
                                                </motion.span>
                                            )}
                                        </div>
                                        <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">Optimal: 3/3</p>
                                    </motion.div>

                                    {/* High/Low Balance */}
                                    <motion.div
                                        className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]"
                                        layout
                                    >
                                        <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold mb-1">High/Low</div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                                                {selectionAnalysis.highCount}/{selectionAnalysis.lowCount}
                                            </span>
                                            {mainNumbers.length === 6 && (
                                                <motion.span
                                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${selectionAnalysis.balanceStatus === "good"
                                                            ? "bg-emerald-500/10 text-emerald-500"
                                                            : "bg-amber-500/10 text-amber-500"
                                                        }`}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                >
                                                    {selectionAnalysis.balanceStatus === "good" ? "Balanced" : "Skewed"}
                                                </motion.span>
                                            )}
                                        </div>
                                        <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">Optimal: 3/3</p>
                                    </motion.div>

                                    {/* Consecutive Detection */}
                                    <motion.div
                                        className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]"
                                        layout
                                    >
                                        <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold mb-1">Consecutive</div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                                                {selectionAnalysis.consecutiveCount}
                                            </span>
                                            <span className="text-sm text-[var(--text-secondary)]">pairs</span>
                                            {mainNumbers.length >= 3 && (
                                                <motion.span
                                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${selectionAnalysis.consecutiveStatus === "good"
                                                            ? "bg-emerald-500/10 text-emerald-500"
                                                            : selectionAnalysis.consecutiveStatus === "warning"
                                                                ? "bg-amber-500/10 text-amber-500"
                                                                : "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                                                        }`}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                >
                                                    {selectionAnalysis.consecutiveStatus === "good" ? "OK" :
                                                        selectionAnalysis.consecutiveStatus === "warning" ? "Many" : "—"}
                                                </motion.span>
                                            )}
                                        </div>
                                        <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">Fewer is better</p>
                                    </motion.div>
                                </div>

                                {/* Quality Score (only when complete) */}
                                <AnimatePresence>
                                    {isSelectionComplete && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-4 pt-3 border-t border-[var(--border)]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <RadialProgress
                                                    value={animatedQuality}
                                                    max={100}
                                                    size={52}
                                                    strokeWidth={5}
                                                    color={qualityScore >= 75 ? "#10b981" : qualityScore >= 50 ? "var(--accent-primary)" : "#f59e0b"}
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-[var(--text-primary)]">Selection Quality</p>
                                                    <p className="text-xs text-[var(--text-tertiary)]">
                                                        Based on statistical patterns
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="ml-auto flex items-center gap-2">
                                                <Sparkles size={14} className="text-[var(--accent-primary)]" />
                                                <span className="text-xs text-[var(--text-secondary)]">
                                                    {qualityScore >= 75 ? "Excellent pattern" : qualityScore >= 50 ? "Good pattern" : "Consider rebalancing"}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ============ COMPUTATIONAL REASONING (Post-Simulation) ============ */}
            <AnimatePresence mode="wait">
                {stats && (
                    <motion.div
                        key="computational-reasoning"
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="surface-card p-6 border-l-4 border-[var(--accent-primary)]"
                    >
                        <div className="flex items-start gap-4">
                            <motion.div
                                className="p-3 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatDelay: 3 }}
                            >
                                <Zap size={24} />
                            </motion.div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                        Computational Reasoning
                                        <motion.span
                                            className="text-xs font-normal text-[var(--text-tertiary)] bg-[var(--surface-elevated)] px-2 py-0.5 rounded-full border border-[var(--border)] flex items-center gap-1"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <Activity size={10} className="text-[var(--accent-primary)]" />
                                            {animatedSimulations.toLocaleString()} simulations
                                        </motion.span>
                                    </h3>
                                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                                        Why this combination? Our engine analyzed patterns across {animatedSimulations.toLocaleString()} iterations.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Sum Analysis - Animated */}
                                    <motion.div
                                        className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] relative overflow-hidden"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="text-xs text-[var(--text-tertiary)] uppercase font-bold mb-2">Sum Total Analysis</div>
                                        <div className="flex items-end gap-2 mb-2">
                                            <motion.span
                                                className="text-3xl font-bold text-[var(--text-primary)] tabular-nums"
                                                key={stats.averageSum}
                                            >
                                                {animatedAverageSum}
                                            </motion.span>
                                            <motion.span
                                                className={`text-xs font-medium px-2 py-0.5 rounded-full mb-1 ${sumAnalysis === "Balanced"
                                                    ? "bg-emerald-500/10 text-emerald-500"
                                                    : "bg-amber-500/10 text-amber-500"
                                                    }`}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                {sumAnalysis} Range
                                            </motion.span>
                                        </div>
                                        {/* Animated Progress Bar */}
                                        <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary)]/60 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${sumProgress}%` }}
                                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Target range: 96-155</p>
                                    </motion.div>

                                    {/* Pattern Strength - with Radial Progress */}
                                    <motion.div
                                        className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="text-xs text-[var(--text-tertiary)] uppercase font-bold mb-2">Pattern Strength</div>
                                        <div className="flex items-center gap-3">
                                            <RadialProgress
                                                value={animatedPatternStrength}
                                                max={100}
                                                size={56}
                                                strokeWidth={5}
                                                color="var(--accent-primary)"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">Coverage</p>
                                                <p className="text-xs text-[var(--text-tertiary)]">
                                                    Alignment with hot numbers
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Bonus Metric - Enhanced */}
                                    <motion.div
                                        className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="text-xs text-[var(--text-tertiary)] uppercase font-bold mb-2">Bonus Affinity</div>
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                className="w-12 h-12 rounded-full bg-[var(--accent-secondary)] text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-[var(--accent-secondary)]/25"
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                                            >
                                                {stats.mostFrequentBonus}
                                            </motion.div>
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">Most Frequent</p>
                                                <p className="text-xs text-[var(--text-tertiary)]">
                                                    Bonus in this set
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Processing Time Indicator */}
                                <motion.div
                                    className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <Timer size={12} />
                                    <span>Processed in <strong className="text-[var(--text-secondary)]">{animatedProcessingTime}ms</strong></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-emerald-500">Live</span>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ============ BENTO GRID ============ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Odds Card */}
                <motion.div
                    className="bento-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-[var(--accent-primary)]/10">
                            <TrendingUp
                                size={24}
                                strokeWidth={1.5}
                                className="text-[var(--accent-primary)]"
                            />
                        </div>
                        <h3 className="font-medium text-[var(--text-primary)]">The Odds</h3>
                    </div>

                    <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
                        1 in {formatOdds(totalOdds)}
                    </p>

                    <p className="text-sm text-[var(--text-secondary)]">
                        Total possible combinations
                    </p>

                    {/* Math breakdown */}
                    <div className="mt-4 p-3 rounded-lg bg-[var(--surface-elevated)] text-xs font-mono text-[var(--text-tertiary)]">
                        <p>C(31,6) × 12</p>
                        <p>= {formatOdds(sectionACombinations)} × 12</p>
                        <p>= {formatOdds(totalOdds)}</p>
                    </div>
                </motion.div>

                {/* Probability Card */}
                <motion.div
                    className="bento-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-[var(--accent-secondary)]/10">
                            <Percent
                                size={24}
                                strokeWidth={1.5}
                                className="text-[var(--accent-secondary)]"
                            />
                        </div>
                        <h3 className="font-medium text-[var(--text-primary)]">Probability</h3>
                    </div>

                    <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
                        ~{formatProbability(probability)}
                    </p>

                    <p className="text-sm text-[var(--text-secondary)]">
                        Chance of winning jackpot
                    </p>

                    {/* Visual representation */}
                    <div className="mt-4">
                        <div className="h-2 w-full rounded-full bg-[var(--border)] overflow-hidden">
                            <motion.div
                                className="h-full bg-[var(--accent-secondary)]"
                                initial={{ width: 0 }}
                                animate={{ width: "0.01%" }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            />
                        </div>
                        <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                            Visual scale (exaggerated for visibility)
                        </p>
                    </div>
                </motion.div>

                {/* Strategic Insights Card */}
                <motion.div
                    className="bento-item md:col-span-2 lg:col-span-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-amber-500/10">
                            <Lightbulb
                                size={24}
                                strokeWidth={1.5}
                                className="text-amber-500"
                            />
                        </div>
                        <h3 className="font-medium text-[var(--text-primary)]">
                            Strategic Insights
                        </h3>
                    </div>

                    {/* Accordion */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {insights.map((insight, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-[var(--border)] overflow-hidden"
                            >
                                <button
                                    onClick={() => setExpandedInsight(expandedInsight === index ? null : index)}
                                    className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--surface-elevated)] transition-colors"
                                    aria-expanded={expandedInsight === index}
                                    aria-label={`Toggle ${insight.title} insight`}
                                >
                                    <span className="text-sm font-medium text-[var(--text-primary)]">
                                        {insight.title}
                                    </span>
                                    {expandedInsight === index ? (
                                        <ChevronUp size={18} className="text-[var(--text-secondary)]" strokeWidth={1.5} />
                                    ) : (
                                        <ChevronDown size={18} className="text-[var(--text-secondary)]" strokeWidth={1.5} />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {expandedInsight === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-3 pt-0 space-y-2">
                                                <p className="text-sm text-[var(--text-secondary)]">
                                                    {insight.description}
                                                </p>
                                                <p className="text-sm text-[var(--accent-primary)] font-medium">
                                                    Tip: {insight.tip}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
