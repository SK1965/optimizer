import { Sandbox } from '../routes/sandbox/Sandbox';

export interface ComplexityResult {
    isComplexityMode: boolean;
    error?: string;
    executionTimes?: {
        small: number;
        medium: number;
        large: number;
    };
    estimatedComplexity?: string;
}

export interface ComplexityAnalyzer {
    isComplexityMode(code: string): boolean;
    analyze(code: string, language: string, sandbox: Sandbox, wrapperTemplate?: string): Promise<ComplexityResult>;
}
