import { PythonComplexityAnalyzer } from '../src/complexity/python/PythonComplexityAnalyzer';
import sandboxRunner from '../src/sandbox/sandboxRunner';

jest.mock('../src/sandbox/sandboxRunner');

describe('PythonComplexityAnalyzer', () => {
    let analyzer: PythonComplexityAnalyzer;

    beforeEach(() => {
        analyzer = new PythonComplexityAnalyzer();
    });

    it('should detect complexity mode signature', () => {
        const code = `
class Solution:
    def solve(self, n: int) -> int:
        return n
`;
        expect(analyzer.isComplexityMode(code)).toBe(true);
    });

    it('should reject non-complexity mode code', () => {
        const code = `print("Hello")`;
        expect(analyzer.isComplexityMode(code)).toBe(false);
    });

    it('should estimate O(n) complexity based on timing', async () => {
        // Doubling input x2 -> Time x2 (Ratio 2)
        const mockOutput = `
SMALL: 0.001000
MEDIUM: 0.002000
LARGE: 0.004000
`;
        (sandboxRunner.execute as jest.Mock).mockResolvedValue({
            exitCode: 0,
            output: mockOutput,
            executionTime: 100
        });

        const code = `class Solution: def solve(self, n: int): pass`;
        const result = await analyzer.analyze(code, 'python', sandboxRunner);

        expect(result.estimatedComplexity).toBe('O(n)');
        expect(result.executionTimes).toEqual({
            small: 0.001,
            medium: 0.002,
            large: 0.004
        });
    });

    it('should estimate O(n^2) complexity based on timing', async () => {
        // Doubling input x2 -> Time x4 (Ratio 4)
        const mockOutput = `
SMALL: 0.001000
MEDIUM: 0.004000
LARGE: 0.016000
`;
        (sandboxRunner.execute as jest.Mock).mockResolvedValue({
            exitCode: 0,
            output: mockOutput,
            executionTime: 100
        });

        const code = `class Solution: def solve(self, n: int): pass`;
        const result = await analyzer.analyze(code, 'python', sandboxRunner);

        expect(result.estimatedComplexity).toBe('O(n^2)');
    });

    it('should estimate O(1) complexity based on timing', async () => {
        // constant time
        const mockOutput = `
SMALL: 0.001000
MEDIUM: 0.001000
LARGE: 0.001000
`;
        (sandboxRunner.execute as jest.Mock).mockResolvedValue({
            exitCode: 0,
            output: mockOutput,
            executionTime: 100
        });

        const code = `class Solution: def solve(self, n: int): pass`;
        const result = await analyzer.analyze(code, 'python', sandboxRunner);

        expect(result.estimatedComplexity).toBe('O(1)');
    });

    it('should handle execution errors', async () => {
        (sandboxRunner.execute as jest.Mock).mockResolvedValue({
            exitCode: 1,
            output: '',
            error: 'Syntax Error'
        });

        const code = `class Solution: def solve(self, n: int): pass`;
        const result = await analyzer.analyze(code, 'python', sandboxRunner);

        expect(result.error).toContain('Execution failed');
    });
});
