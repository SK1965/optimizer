import { ComplexityAnalyzer, ComplexityResult } from '../ComplexityAnalyzer';
import { Sandbox } from '../../routes/sandbox/Sandbox';

export class PythonComplexityAnalyzer implements ComplexityAnalyzer {
    
    private readonly SIZES = {
        SMALL: 1000,
        MEDIUM: 2000,
        LARGE: 4000
    };

    /**
     * Regex to match:
     * class Solution:
     *     def solve(self, param: int) -> ...:
     */
    private readonly SIGNATURE_REGEX = /class\s+Solution:\s+def\s+solve\s*\(\s*self\s*,\s*\w+\s*:\s*int\s*\)/s;

    isComplexityMode(code: string): boolean {
        return this.SIGNATURE_REGEX.test(code);
    }

    async analyze(code: string, language: string, sandbox: Sandbox, wrapperTemplate?: string): Promise<ComplexityResult> {
        if (!this.isComplexityMode(code)) {
             return { isComplexityMode: false };
        }

        let wrappedCode: string;
        if (wrapperTemplate) {
            wrappedCode = wrapperTemplate.replace('{{USER_CODE}}', code);
        } else {
            // Fallback for cases where wrapperTemplate isn't provided but it still runs
            wrappedCode = this.generateFallbackWrapper(code);
        }
        
        const result = await sandbox.execute('python', wrappedCode);

        if (result.exitCode !== 0) {
            return {
                isComplexityMode: true,
                error: `Execution failed: ${result.error || result.output}`
            };
        }

        const times = this.parseOutput(result.output);
        if (!times) {
             return {
                isComplexityMode: true,
                error: 'Failed to parse execution times'
            };
        }

        const complexity = this.estimateComplexity(times);

        return {
            isComplexityMode: true,
            executionTimes: times,
            estimatedComplexity: complexity
        };
    }

    private generateFallbackWrapper(userCode: string): string {
        return `
import time
import sys

# User Code
${userCode}

# Driver Code
if __name__ == "__main__":
    try:
        sol = Solution()
        
        # Define Inputs (Phase 1: int type means input size itself)
        inputs = {
            "small": ${this.SIZES.SMALL},
            "medium": ${this.SIZES.MEDIUM},
            "large": ${this.SIZES.LARGE}
        }
        
        results = {}
        
        for size_name, input_val in inputs.items():
            # For O(1) or very fast ops, we might need loops, but for MVP we run once
            start_time = time.perf_counter()
            sol.solve(input_val)
            end_time = time.perf_counter()
            results[size_name] = end_time - start_time
            
        print(f"SMALL: {results['small']:.6f}")
        print(f"MEDIUM: {results['medium']:.6f}")
        print(f"LARGE: {results['large']:.6f}")
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
`;
    }

    private parseOutput(output: string): { small: number, medium: number, large: number } | null {
        try {
            const smallMatch = output.match(/SMALL:\s*(\d+\.?\d*)/);
            const mediumMatch = output.match(/MEDIUM:\s*(\d+\.?\d*)/);
            const largeMatch = output.match(/LARGE:\s*(\d+\.?\d*)/);

            if (smallMatch && mediumMatch && largeMatch) {
                return {
                    small: parseFloat(smallMatch[1]),
                    medium: parseFloat(mediumMatch[1]),
                    large: parseFloat(largeMatch[1])
                };
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    private estimateComplexity(times: { small: number, medium: number, large: number }): string {
        const { small, medium, large } = times;
        
        // Prevent division by zero
        const t1 = Math.max(small, 0.000001);
        const t2 = Math.max(medium, 0.000001);
        const t3 = Math.max(large, 0.000001);

        const ratio1 = t2 / t1; // 1000 -> 2000 (2x size)
        const ratio2 = t3 / t2; // 2000 -> 4000 (2x size)
        
        const avgRatio = (ratio1 + ratio2) / 2;

        // Doubling input size:
        // O(1) -> ratio ~ 1
        // O(n) -> ratio ~ 2
        // O(n^2) -> ratio ~ 4
        
        if (avgRatio < 1.5) return 'O(1)';
        if (avgRatio >= 1.5 && avgRatio < 3.0) return 'O(n)';
        if (avgRatio >= 3.0) return 'O(n^2)';
        
        return 'O(> n^2)';
    }
}
