import sandboxRunner from '../src/sandbox/sandboxRunner';
import { DockerSandbox } from '../src/sandbox/DockerSandbox';

describe('Sandbox Integration Tests', () => {
    // Increase timeout for Docker operations
    jest.setTimeout(30000);

    // Skip tests if Docker is not available or if we want to run unit tests only
    // For now, we assume these tests run in an environment with Docker
    
    it('should execute C code (Hello World)', async () => {
        const code = `
        #include <stdio.h>
        int main() {
            printf("Hello C");
            return 0;
        }
        `;
        const result = await sandboxRunner.execute('c', code);
        expect(result.exitCode).toBe(0);
        expect(result.output).toContain('Hello C');
    });

    it('should execute C++ code (Hello World)', async () => {
        const code = `
        #include <iostream>
        int main() {
            std::cout << "Hello C++";
            return 0;
        }
        `;
        const result = await sandboxRunner.execute('cpp', code);
        expect(result.exitCode).toBe(0);
        expect(result.output).toContain('Hello C++');
    });

    it('should execute Java code (Hello World)', async () => {
        const code = `
        public class Main {
            public static void main(String[] args) {
                System.out.println("Hello Java");
            }
        }
        `;
        const result = await sandboxRunner.execute('java', code);
        expect(result.exitCode).toBe(0);
        expect(result.output).toContain('Hello Java');
    });

    it('should execute Python code (Hello World)', async () => {
        const code = `print("Hello Python")`;
        const result = await sandboxRunner.execute('python', code);
        expect(result.exitCode).toBe(0);
        expect(result.output).toContain('Hello Python');
    });

    it('should execute JavaScript code (Hello World)', async () => {
        const code = `console.log("Hello JS");`;
        const result = await sandboxRunner.execute('javascript', code);
        expect(result.exitCode).toBe(0);
        expect(result.output).toContain('Hello JS');
    });

    it('should handle infinite loops (Timeout)', async () => {
        const code = `
        while(1) {}
        `;
        const result = await sandboxRunner.execute('c', code);
        // Expect timeout behavior - usually exitCode 124 or error message
        // DockerSandbox implementation returns exitCode 124 for timeout
        expect(result.exitCode).toBe(124);
        expect(result.error).toContain('Timed Out');
    });

    it('should handle standard input', async () => {
        const code = `
        import sys
        data = sys.stdin.read()
        print(f"Received: {data}")
        `;
        const result = await sandboxRunner.execute('python', code, 'Input Data');
        expect(result.exitCode).toBe(0);
        expect(result.output).toContain('Received: Input Data');
    });
});
