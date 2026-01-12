/**
 * e-Swerte Math Utilities
 * 
 * Combinatorial calculations for lottery odds.
 * 
 * ODDS CALCULATION:
 * -----------------
 * Section A: Choose 6 unique numbers from 31
 * Combination formula: C(n, r) = n! / (r! × (n-r)!)
 * C(31, 6) = 31! / (6! × 25!) = 736,281
 * 
 * Section B: Choose 1 unique number from 12
 * C(12, 1) = 12
 * 
 * TOTAL COMBINATIONS:
 * 736,281 × 12 = 8,835,372
 * 
 * PROBABILITY:
 * 1 / 8,835,372 ≈ 0.0000001132 ≈ 0.0000113%
 */

/**
 * Calculate factorial of n
 * Uses BigInt for precision with large numbers
 */
export function factorial(n: number): bigint {
    if (n < 0) throw new Error("Factorial is not defined for negative numbers");
    if (n === 0 || n === 1) return BigInt(1);

    let result = BigInt(1);
    for (let i = 2; i <= n; i++) {
        result *= BigInt(i);
    }
    return result;
}

/**
 * Calculate combination C(n, r) = n! / (r! × (n-r)!)
 * Returns number for display purposes
 */
export function combination(n: number, r: number): number {
    if (r > n) return 0;
    if (r === 0 || r === n) return 1;

    // Optimize: C(n, r) = C(n, n-r), use smaller r
    const k = Math.min(r, n - r);

    // Calculate using product to avoid large intermediate values
    let result = BigInt(1);
    for (let i = 0; i < k; i++) {
        result = result * BigInt(n - i) / BigInt(i + 1);
    }

    return Number(result);
}

/**
 * Calculate total lottery odds
 * Section A: 6 from 31, Section B: 1 from 12
 */
export function calculateTotalOdds(): number {
    const sectionA = combination(31, 6); // 736,281
    const sectionB = 12;                  // C(12, 1) = 12
    return sectionA * sectionB;           // 8,835,372
}

/**
 * Calculate probability as percentage
 */
export function calculateProbability(): number {
    const totalOdds = calculateTotalOdds();
    return (1 / totalOdds) * 100;
}

/**
 * Format odds as human-readable string
 */
export function formatOdds(odds: number): string {
    return odds.toLocaleString();
}

/**
 * Format probability as percentage string
 */
export function formatProbability(probability: number): string {
    return probability.toFixed(7) + "%";
}

/**
 * Generate random unique numbers within a range
 * @param count - Number of random numbers to generate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 */
export function generateRandomNumbers(count: number, min: number, max: number): number[] {
    if (count > max - min + 1) {
        throw new Error("Cannot generate more unique numbers than available in range");
    }

    const numbers = new Set<number>();
    while (numbers.size < count) {
        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        numbers.add(randomNum);
    }

    return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Get strategic insights about number selection
 */
export interface StrategicInsight {
    title: string;
    description: string;
    tip: string;
}

export function getStrategicInsights(): StrategicInsight[] {
    return [
        {
            title: "The Birthday Paradox",
            description: "Many players choose numbers 1-31 (birthdays), making these more common selections. If multiple winners occur, the jackpot is split.",
            tip: "Consider mixing in numbers above 31 if available to reduce sharing chances.",
        },
        {
            title: "High/Low Balance",
            description: "Statistically, winning combinations tend to have a mix of high and low numbers rather than clusters.",
            tip: "Try selecting 3 numbers from 1-15 and 3 from 16-31 for balanced coverage.",
        },
        {
            title: "Odd/Even Distribution",
            description: "Pure odd or pure even combinations are statistically less common in winning draws.",
            tip: "A mix of 3 odd and 3 even numbers aligns with historical winning patterns.",
        },
        {
            title: "Consecutive Numbers",
            description: "Fully consecutive sequences (like 5-6-7-8-9-10) rarely appear in winning combinations.",
            tip: "Spread your selections across the number range for better statistical coverage.",
        },
        {
            title: "Quick Pick Advantage",
            description: "Computer-generated numbers eliminate human bias and pattern preferences.",
            tip: "Quick Pick ensures true randomness without subconscious number clustering.",
        },
    ];
}

/**
 * Section A constants
 */
export const SECTION_A = {
    MIN: 1,
    MAX: 31,
    COUNT: 6,
    LABEL: "Main Numbers",
} as const;

/**
 * Section B constants
 */
export const SECTION_B = {
    MIN: 1,
    MAX: 12,
    COUNT: 1,
    LABEL: "Bonus Number",
} as const;
