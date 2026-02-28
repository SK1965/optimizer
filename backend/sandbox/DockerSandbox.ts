import { Sandbox, ExecutionResult } from './Sandbox';
import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import * as os from 'os';

export class DockerSandbox implements Sandbox {
    private readonly TIMEOUT_MS = 50000; // 5 seconds
    private readonly MEMORY_LIMIT = '512m';
    private readonly CPU_LIMIT = '0.5';
    private readonly IMAGE_NAME = 'sandbox-runner';

    async execute(language: string, code: string, input?: string): Promise<ExecutionResult> {
        const runId = randomUUID();
        const tempDir = path.join(os.tmpdir(), 'sandbox', runId);
        
        try {
            await fs.mkdir(tempDir, { recursive: true });
            
            const { filename, compileCmd, runCmd } = this.getLanguageConfig(language);
            
            // Write source code
            await fs.writeFile(path.join(tempDir, filename), code);
            
            // REQUIRED DEBUG STEP 4: Log final file written inside container
            console.log(`[Sandbox] File successfully written to: ${path.join(tempDir, filename)}`);
            console.log(`[Sandbox] File Content:\n${code}`);
            
            // Write input file if provided
            if (input) {
                await fs.writeFile(path.join(tempDir, 'input.txt'), input);
            }

            const startTime = Date.now();
            
            // Construct the Docker command
            // We use 'sh -c' to chain compilation and execution
            let commandScript = '';
            
            if (compileCmd) {
                commandScript += `${compileCmd} && `;
                // REQUIRED DEBUG STEP 5: Confirm compile command is g++ file.cpp -o output
                console.log(`[Sandbox] Compile Command: ${compileCmd}`);
            }
            
            // If input exists, pipe it. Otherwise just run.
            if (input) {
                 commandScript += `${runCmd} < input.txt`;
            } else {
                 commandScript += runCmd;
            }

            const dockerArgs = [
                'run',
                '--rm', // Remove container after exit
                '--network', 'none', // No internet access
                '--memory', this.MEMORY_LIMIT,
                '--cpus', this.CPU_LIMIT,
                '-v', `${tempDir}:/app`, // Mount temp dir
                this.IMAGE_NAME,
                '/bin/sh', '-c', commandScript
            ];

            const { stdout, stderr, exitCode } = await this.runDockerCommand(dockerArgs);
            const executionTime = Date.now() - startTime;

            return {
                output: stdout,
                error: stderr,
                exitCode,
                executionTime
            };

        } catch (error: any) {
            return {
                output: '',
                error: error.message || 'Internal Sandbox Error',
                exitCode: -1,
                executionTime: 0
            };
        } finally {
            // Cleanup: remove temp directory
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (e) {
                console.error(`Failed to cleanup sandbox dir ${tempDir}:`, e);
            }
        }``
    }

    private getLanguageConfig(language: string): { filename: string, compileCmd?: string, runCmd: string } {
        switch (language.toLowerCase()) {
            case 'c':
                return {
                    filename: 'main.c',
                    compileCmd: 'gcc main.c -o main',
                    runCmd: './main'
                };
            case 'cpp':
            case 'c++':
                return {
                    filename: 'main.cpp',
                    compileCmd: 'g++ main.cpp -o main',
                    runCmd: './main'
                };
            case 'java':
                return {
                    filename: 'Main.java',
                    compileCmd: 'javac Main.java',
                    runCmd: 'java Main'
                };
            case 'python':
            case 'python3':
                return {
                    filename: 'main.py',
                    runCmd: 'python3 main.py'
                };
            case 'javascript':
            case 'js':
            case 'node':
                return {
                    filename: 'main.js',
                    runCmd: 'node main.js'
                };
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }

    private runDockerCommand(args: string[]): Promise<{ stdout: string, stderr: string, exitCode: number }> {
        return new Promise((resolve) => {
            const process = spawn('docker', args);
            
            let stdout = '';
            let stderr = '';
            
            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            // Timeout handling
            const timeout = setTimeout(() => {
                process.kill();
                resolve({
                    stdout: stdout,
                    stderr: stderr + '\nExecution Timed Out',
                    exitCode: 124 // Common timeout exit code
                });
            }, this.TIMEOUT_MS);

            process.on('close', (code) => {
                clearTimeout(timeout);
                resolve({
                    stdout,
                    stderr,
                    exitCode: code ?? -1
                });
            });

            process.on('error', (err) => {
                clearTimeout(timeout);
                resolve({
                    stdout,
                    stderr: `Failed to start Docker process: ${err.message}`,
                    exitCode: -1
                });
            });
        });
    }
}
