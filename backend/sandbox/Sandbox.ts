export interface ExecutionResult {
    output: string;
    error: string;
    exitCode: number;
    executionTime: number; // in milliseconds
}

export interface Sandbox {
    execute(language: string, code: string, input?: string): Promise<ExecutionResult>;
}
