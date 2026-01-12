/**
 * e-Swerte Export Utilities
 * 
 * Client-side file generation using Blob API
 * Supports CSV and TXT export formats
 */

export interface ExportData {
    mainNumbers: number[];
    bonusNumber: number | null;
    timestamp: Date;
    odds: string;
    probability: string;
}

/**
 * Format number with leading zero (01-31)
 */
function formatNumber(num: number): string {
    return num.toString().padStart(2, "0");
}

/**
 * Format timestamp for display
 */
function formatTimestamp(date: Date): string {
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
}

/**
 * Format timestamp for filename (safe characters)
 */
function formatFilenameTimestamp(date: Date): string {
    return date.toISOString().replace(/[:.]/g, "-").split("T").join("_");
}

/**
 * Generate CSV file content
 * Format: Timestamp, Main Numbers (comma-separated), Bonus Number, Odds, Probability
 */
export function generateCSV(data: ExportData): string {
    const headers = ["Timestamp", "Main Numbers", "Bonus Number", "Odds", "Probability"];
    const mainNumbers = data.mainNumbers.map(formatNumber).join(";");
    const bonusNumber = data.bonusNumber ? formatNumber(data.bonusNumber) : "N/A";

    const row = [
        formatTimestamp(data.timestamp),
        mainNumbers,
        bonusNumber,
        data.odds,
        data.probability,
    ];

    return [
        headers.join(","),
        row.map(cell => `"${cell}"`).join(","),
    ].join("\n");
}

/**
 * Generate TXT file content (receipt-style layout)
 */
export function generateTXT(data: ExportData): string {
    const separator = "═".repeat(40);
    const thinSeparator = "─".repeat(40);
    const mainNumbers = data.mainNumbers.map(formatNumber).join(" · ");
    const bonusNumber = data.bonusNumber ? formatNumber(data.bonusNumber) : "N/A";

    return `
${separator}
             ZWERTE LOTTERY
       Enterprise Edition v1.0
${separator}

Generated: ${formatTimestamp(data.timestamp)}

${thinSeparator}
              SELECTIONS
${thinSeparator}

  MAIN NUMBERS (6 of 31):
  ${mainNumbers}

  BONUS NUMBER (1 of 12):
  ${bonusNumber}

${thinSeparator}
             STATISTICS
${thinSeparator}

  Odds:        1 in ${data.odds}
  Probability: ${data.probability}

${thinSeparator}

  DISCLAIMER:
  This is a random number generator for
  entertainment purposes only. Past
  selections do not influence future
  lottery outcomes.

${separator}
         Good Luck! 🍀
${separator}
`.trim();
}

/**
 * Trigger file download using Blob API
 * @throws Error if download fails
 */
export async function downloadFile(
    content: string,
    filename: string,
    mimeType: string
): Promise<void> {
    try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Export failed:", error);
        throw new Error("Failed to generate export file. Please try again.");
    }
}

/**
 * Export selection data as CSV
 */
export async function exportAsCSV(data: ExportData): Promise<void> {
    const content = generateCSV(data);
    const filename = `zwerte_${formatFilenameTimestamp(data.timestamp)}.csv`;
    await downloadFile(content, filename, "text/csv;charset=utf-8");
}

/**
 * Export selection data as TXT
 */
export async function exportAsTXT(data: ExportData): Promise<void> {
    const content = generateTXT(data);
    const filename = `zwerte_${formatFilenameTimestamp(data.timestamp)}.txt`;
    await downloadFile(content, filename, "text/plain;charset=utf-8");
}
