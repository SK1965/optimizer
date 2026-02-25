import { processSubmission } from '../src/services/workerService';
import * as submissionService from '../src/services/submissionService';
import * as sandboxService from '../src/services/sandboxService';
import * as wrapperService from '../src/services/wrapperService';
import { query } from '../src/db';

// Mock other external dependencies but LEAVE our internal signature/wrapper caching active
jest.mock('../src/services/submissionService');
jest.mock('../src/services/sandboxService');

const TEST_SIG = `
class Solution:
    def solve(self, x: int):
        pass
`;

describe('Caching Integration Test', () => {

    beforeAll(async () => {
         // clean up any existing cache for this specific test signature so we start fresh
         await query(`DELETE FROM signature_wrappers WHERE language = 'python' AND normalized_signature = 'python:int->int'`);
    });

    afterAll(async () => {
         // cleanup
         await query(`DELETE FROM signature_wrappers WHERE language = 'python' AND normalized_signature = 'python:int->int'`);
         const { pool } = require('../src/db');
         await pool.end();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should call LLM on first submission and use cache on second identical submission', async () => {
        const mockSubmission1 = { id: 'cache-1', code: TEST_SIG, language: 'python', status: 'pending' };
        const mockSubmission2 = { id: 'cache-2', code: TEST_SIG, language: 'python', status: 'pending' };

        (submissionService.getSubmissionById as jest.Mock)
             .mockResolvedValueOnce(mockSubmission1)
             .mockResolvedValueOnce(mockSubmission2);

        // Mock sandbox execution to simulate successful python wrapper execution
        jest.spyOn(sandboxService as any, 'execute').mockResolvedValue({ 
             success: true, output: 'SMALL: 0.1\nMEDIUM: 0.2\nLARGE: 0.4', exitCode: 0 
        });

        // Spy on wrapper generation to count LLM invocations
        const generateSpy = jest.spyOn(wrapperService, 'generateWrapperViaLLM');

        // ==== PASS 1 ====
        // First run - should miss cache, generate wrapper via LLM, and insert into DB
        await processSubmission('cache-1');
        
        expect(generateSpy).toHaveBeenCalledTimes(1);
        expect(submissionService.updateSubmission).toHaveBeenCalledWith('cache-1', expect.objectContaining({ status: 'completed' }));

        // ==== PASS 2 ====
        // Second run - should hit the cache we just inserted! LLM should NOT be called again.
        await processSubmission('cache-2');
        
        // Assert it was NOT called a second time
        expect(generateSpy).toHaveBeenCalledTimes(1); 
        expect(submissionService.updateSubmission).toHaveBeenCalledWith('cache-2', expect.objectContaining({ status: 'completed' }));
    });
});
