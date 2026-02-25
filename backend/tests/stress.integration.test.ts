import { processSubmission } from '../src/services/workerService';
import * as submissionService from '../src/services/submissionService';
import * as sandboxService from '../src/services/sandboxService';
import * as wrapperService from '../src/services/wrapperService';
import { query } from '../src/db';

jest.mock('../src/services/submissionService');
jest.mock('../src/services/sandboxService');

const TEST_SIG = `
class Solution:
    def solve(self, x: int):
        # Stress test signature
        pass
`;

describe('Concurrency Caching Stress Test', () => {

    beforeAll(async () => {
         // Clean up specific test signature cache
         await query(`DELETE FROM signature_wrappers WHERE language = 'python' AND normalized_signature = 'python:int->int'`);
    });

    afterAll(async () => {
         await query(`DELETE FROM signature_wrappers WHERE language = 'python' AND normalized_signature = 'python:int->int'`);
         const { pool } = require('../src/db');
         await pool.end();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should only call LLM once when 5 identical submissions arrive concurrently', async () => {
        // Setup 5 mock submissions
        const submissions = Array.from({ length: 5 }, (_, i) => ({
             id: `concurrent-${i}`,
             code: TEST_SIG,
             language: 'python',
             status: 'pending'
        }));

        // Mock `getSubmissionById` to return the right submission concurrently
        (submissionService.getSubmissionById as jest.Mock).mockImplementation(async (id: string) => {
            return submissions.find(s => s.id === id);
        });

        // Mock Sandbox execution
        jest.spyOn(sandboxService as any, 'execute').mockResolvedValue({ 
             success: true, output: 'SMALL: 0.1\nMEDIUM: 0.2\nLARGE: 0.4', exitCode: 0 
        });

        // Spy on LLM wrapping
        const generateSpy = jest.spyOn(wrapperService, 'generateWrapperViaLLM');

        // Fire all 5 processing promises AT THE SAME TIME
        const promises = submissions.map(sub => processSubmission(sub.id));
        
        // Wait for all to finish
        await Promise.all(promises);
        
        // 1. Assert LLM WAS ONLY CALLED ONCE despite concurrent requests missing the cache at the identical ms
        expect(generateSpy).toHaveBeenCalledTimes(1);

        // 2. Assert all 5 were completed properly
        expect(submissionService.updateSubmission).toHaveBeenCalledTimes(5);
        for (const sub of submissions) {
            expect(submissionService.updateSubmission).toHaveBeenCalledWith(
                sub.id,
                expect.objectContaining({ status: 'completed' })
            );
        }
    }, 20000); // Allow up to 20s for concurrent test
});
