export interface ParsedTiming {
    small: number;
    medium: number;
    large: number;
}

/**
 * Extracts SMALL_TIME, MEDIUM_TIME, LARGE_TIME from the given standard output.
 * It ignores everything else outputted by the boilerplate.
 */
export const parseTimingOutput = (stdout: string): ParsedTiming => {
    const lines = stdout.split('\n');
    let small: number | null = null;
    let medium: number | null = null;
    let large: number | null = null;

    for (const line of lines) {
        const cleanLine = line.trim();
        if (cleanLine.startsWith('SMALL_TIME=')) {
            const val = parseFloat(cleanLine.replace('SMALL_TIME=', ''));
            if (!isNaN(val)) small = val;
        } else if (cleanLine.startsWith('MEDIUM_TIME=')) {
            const val = parseFloat(cleanLine.replace('MEDIUM_TIME=', ''));
            if (!isNaN(val)) medium = val;
        } else if (cleanLine.startsWith('LARGE_TIME=')) {
            const val = parseFloat(cleanLine.replace('LARGE_TIME=', ''));
            if (!isNaN(val)) large = val;
        }
    }

    if (small === null || medium === null || large === null) {
        throw new Error("Failed to parse fully expected timing outputs. Extracted: " + JSON.stringify({ small, medium, large }) + "\nStdout:\n" + stdout);
    }

    // Microsecond outputs can sometimes be 0 if the code is extremely trivial and resolution is poor.
    // Clamp to 1 microsecond minimum to explicitly prevent divide-by-zero errors.
    return {
        small: Math.max(1, small),
        medium: Math.max(1, medium),
        large: Math.max(1, large)
    };
};

/**
 * Estimates worst-case asymptotic upper-bound Time Complexity Big-O given scaling inputs.
 * The scaling assumption rests heavily on generating N inputs representing 1k, 2k, 4k (doubling).
 * Thus, computing the ratio (Next / Prev) provides the multiplication coefficient `C`.
 * 
 * Approximate doubling ratios (approximate input sizes x2):
 * O(1)   -> Ratio ~ 1 (Time stays constant)
 * O(n)   -> Ratio ~ 2 (Time doubles when input doubles)
 * O(n^2) -> Ratio ~ 4 (Time quadruples when input doubles)
 * O(n^3) -> Ratio ~ 8 (Time octuples when input doubles)
 */
export const estimateComplexity = (small: number, medium: number, large: number): string => {
    const ratio1 = medium / small;
    const ratio2 = large / medium;
    
    // Average ratio to smooth minor timing inconsistencies 
    // We weight the larger transition slightly higher because resolution overhead is relatively lower.
    const averageRatio = (ratio1 * 0.4) + (ratio2 * 0.6);

    // Approximate mapping with leeway ranges to account for overhead/noise bias
    if (averageRatio <= 1.5) {
        return "O(1)";
    } else if (averageRatio <= 2.8) {
        return "O(n) or O(n log n)";
    } else if (averageRatio <= 5.5) {
        return "O(n^2)";
    } else if (averageRatio <= 10.0) {
        return "O(n^3)"; 
    } else {
        return "O(2^n) or worse";
    }
};
