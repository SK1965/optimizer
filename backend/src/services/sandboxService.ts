export interface SandboxResult {
  execution_time: number;
  memory_used: string;
  output: string;
  complexity: string;
}

export const execute = async (
  code: string,
  language: string,
  input?: string
): Promise<SandboxResult> => {
  // Placeholder implementation
  // Later this will call Docker container

  return {
    execution_time: 0.01,
    memory_used: '5MB',
    output: 'Hello World',
    complexity: 'O(n)',
  };
};
