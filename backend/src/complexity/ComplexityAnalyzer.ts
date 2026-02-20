import { Sandbox } from '../routes/sandbox/Sandbox';

export interface ComplexityResult {
    isComplexityMode: boolean;
    estimatedComplexity?: string;
    executionTimes?: {
        small: number;
        medium: number;
        large: number;
    };
    error?: string;
}

export interface ComplexityAnalyzer {
    /**
     * Analyzes the submitted code to determine time complexity.
     * @param code The user submitted code.
     * @param language The programming language.
     * @param sandbox The sandbox instance to execute code.
     */
    analyze(code: string, language: string, sandbox: Sandbox): Promise<ComplexityResult>;
    
    /**
     * Checks if the code matches the required structure for complexity analysis.
     */
    isComplexityMode(code: string): boolean;
}
