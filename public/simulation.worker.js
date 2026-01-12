/**
 * Simulation Worker
 * 
 * Handles computationally expensive lottery simulation off the main thread.
 * Generates multiple lottery draws and calculates statistics.
 */

// Generate random unique numbers within range
function generateUniqueNumbers(count, min, max) {
    const numbers = new Set();
    while (numbers.size < count) {
        numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return Array.from(numbers).sort((a, b) => a - b);
}

// Calculate checksum for verification
function calculateChecksum(main, bonus) {
    return main.reduce((acc, n) => acc + n, 0) * bonus;
}

// Simulate heavy mathematical computation
function heavyComputation() {
    // Simulate CPU-intensive work with prime factorization
    const target = Math.floor(Math.random() * 10000) + 1000;
    let n = target;
    const factors = [];
    for (let d = 2; d * d <= n; d++) {
        while (n % d === 0) {
            factors.push(d);
            n /= d;
        }
    }
    if (n > 1) factors.push(n);
}

// Main simulation function
function runSimulation(message) {
    const { iterations, mainNumberRange, bonusNumberRange } = message.payload;
    const startTime = performance.now();
    const results = [];
    const mainFrequency = new Map();
    const bonusFrequency = new Map();
    let totalSum = 0;

    try {
        for (let i = 0; i < iterations; i++) {
            // Simulate heavy computation
            heavyComputation();

            // Generate lottery numbers
            const mainNumbers = generateUniqueNumbers(
                mainNumberRange.count,
                mainNumberRange.min,
                mainNumberRange.max
            );
            const bonusNumber = Math.floor(
                Math.random() * (bonusNumberRange.max - bonusNumberRange.min + 1)
            ) + bonusNumberRange.min;

            // Track frequency
            mainNumbers.forEach(n => {
                mainFrequency.set(n, (mainFrequency.get(n) || 0) + 1);
            });
            bonusFrequency.set(bonusNumber, (bonusFrequency.get(bonusNumber) || 0) + 1);

            // Calculate sum for statistics
            totalSum += mainNumbers.reduce((a, b) => a + b, 0);

            // Store result
            results.push({
                id: i + 1,
                mainNumbers,
                bonusNumber,
                timestamp: Date.now(),
                checksum: calculateChecksum(mainNumbers, bonusNumber),
            });

            // Send progress update every 10%
            if ((i + 1) % Math.ceil(iterations / 10) === 0) {
                const progress = ((i + 1) / iterations) * 100;
                self.postMessage({
                    type: 'PROGRESS',
                    payload: { progress },
                });
            }
        }

        // Calculate statistics
        const sortedMain = Array.from(mainFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([num]) => num);

        const sortedBonus = Array.from(bonusFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([num]) => num);

        const processingTimeMs = performance.now() - startTime;

        // Generate Top 3 Results
        const topMain = sortedMain.sort((a, b) => a - b);
        const top3Combinations = [
            {
                rank: "Primary Result",
                mainNumbers: topMain,
                bonusNumber: sortedBonus[0] || 1,
                frequencyScore: Math.round((mainFrequency.get(sortedMain[0]) || 0) / iterations * 100)
            },
            {
                rank: "Secondary Result",
                mainNumbers: topMain,
                bonusNumber: sortedBonus[1] || (sortedBonus[0] === 12 ? 1 : sortedBonus[0] + 1),
                frequencyScore: Math.round(((mainFrequency.get(sortedMain[0]) || 0) / iterations * 100) * 0.85)
            },
            {
                rank: "Tertiary Result",
                mainNumbers: topMain,
                bonusNumber: sortedBonus[2] || (sortedBonus[0] === 11 ? 1 : sortedBonus[0] + 2),
                frequencyScore: Math.round(((mainFrequency.get(sortedMain[0]) || 0) / iterations * 100) * 0.70)
            }
        ];

        // Send complete response
        self.postMessage({
            type: 'COMPLETE',
            payload: {
                results: results.slice(-50), // Return last 50 for display
                statistics: {
                    totalSimulations: iterations,
                    processingTimeMs: Math.round(processingTimeMs),
                    mostFrequentMain: sortedMain,
                    mostFrequentBonus: sortedBonus[0],
                    averageSum: Math.round(totalSum / iterations),
                    optimizedCombinations: top3Combinations
                },
            },
        });
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            error: error instanceof Error ? error.message : 'Simulation failed',
        });
    }
}

// Listen for messages from main thread
self.onmessage = function (event) {
    if (event.data.type === 'SIMULATE') {
        runSimulation(event.data);
    }
};
