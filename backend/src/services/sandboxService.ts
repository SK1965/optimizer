import sandboxRunner from '../../sandbox/sandboxRunner';

export interface SandboxResult {
  execution_time: number;
  memory_used: string;
  output: string;
  complexity: string; // This might be deprecated or used for manual estimation
  error?: string;
}

export const execute = async (
  code: string,
  language: string,
  input?: string
): Promise<SandboxResult> => {
  
  const result = await sandboxRunner.execute(language, code, input);

  if (result.exitCode !== 0) {
      throw new Error(result.error || result.output);
  }

  // Provide basic complexity estimation based on time if needed, 
  // but for now just return the raw data.
  // We'll mimic the previous signature.
  
  return {
    execution_time: result.executionTime,
    memory_used: 'N/A', // DockerSandbox doesn't return memory yet
    output: result.output,
    complexity: 'N/A',
  };
};
