import { processSubmission } from '../src/services/workerService';
import * as submissionService from '../src/services/submissionService';
import * as wrapperService from '../src/services/wrapperService';
import { query } from '../src/db';
import { mockGenerateContent } from './__mocks__/@google/genai';

jest.mock('../src/services/submissionService');
jest.mock('../src/services/sandboxService');
jest.mock('../src/routes/sandbox/sandboxRunner', () => ({
  __esModule: true,
  default: {
    execute: jest.fn().mockResolvedValue({ 
       exitCode: 0, output: 'SMALL: 0.1\nMEDIUM: 0.2\nLARGE: 0.4', memory_used: '10MB' 
    })
  }
}));

const TEST_SIG = `
class Solution:
    def solve(self, x: float):
        # Deadlock test signature
        pass
`;
// NOTE: float -> normalized signature = python:float->int
const NORMALIZED_SIG = `python:float->int`;

describe('Deadlock Recovery & Determinism Integration Test', () => {

    beforeAll(async () => {
        await query(`DELETE FROM signature_wrappers WHERE language = 'python' AND normalized_signature = $1`, [NORMALIZED_SIG]);
    });

    afterAll(async () => {
        await query(`DELETE FROM signature_wrappers WHERE language = 'python' AND normalized_signature = $1`, [NORMALIZED_SIG]);
        const { pool } = require('../src/db');
        await pool.end();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should delete lock placeholder on LLM failure, mark submission failed, and allow retry', async () => {
        const mockSubmission1 = { id: 'deadlock-1', code: TEST_SIG, language: 'python', status: 'pending' };
        const mockSubmission2 = { id: 'deadlock-2', code: TEST_SIG, language: 'python', status: 'pending' };

        (submissionService.getSubmissionById as jest.Mock)
             .mockResolvedValueOnce(mockSubmission1)
             .mockResolvedValueOnce(mockSubmission2);

        const generateSpy = jest.spyOn(wrapperService, 'generateWrapperViaLLM');
        
        // PASS 1: force LLM to fail
        generateSpy.mockRejectedValueOnce(new Error("Simulated LLM API Timeout"));

        // processSubmission catches internally and marks submission failed (does NOT re-throw)
        await processSubmission('deadlock-1');

        // Verify the submission was marked as failed
        expect(submissionService.updateSubmission).toHaveBeenCalledWith(
            'deadlock-1',
            expect.objectContaining({ status: 'failed', error_message: 'Simulated LLM API Timeout' })
        );

        // Verify lock row was cleaned up — no permanent deadlock
        const dbCheck = await query(`SELECT * FROM signature_wrappers WHERE language = 'python' AND normalized_signature = $1`, [NORMALIZED_SIG]);
        expect(dbCheck.rows.length).toBe(0);

        jest.clearAllMocks();

        // PASS 2: subsequent submission should now succeed normally
        (submissionService.getSubmissionById as jest.Mock).mockResolvedValueOnce(mockSubmission2);
        generateSpy.mockRestore();

        await processSubmission('deadlock-2');

        // Verify it completed successfully
        expect(submissionService.updateSubmission).toHaveBeenCalledWith(
            'deadlock-2',
            expect.objectContaining({ status: 'completed' })
        );

        // Verify wrapper is now stored and valid
        const dbCheck2 = await query(`SELECT * FROM signature_wrappers WHERE language = 'python' AND normalized_signature = $1`, [NORMALIZED_SIG]);
        expect(dbCheck2.rows.length).toBe(1);
        expect(dbCheck2.rows[0].wrapper_template).toContain("{{USER_CODE}}");

        // TEMPERATURE CHECK: assert the LLM call used temperature=0.0
        // mockGenerateContent was still called during the second submission above
        expect(mockGenerateContent).toHaveBeenCalledWith(
            expect.objectContaining({
                config: { temperature: 0.0 }
            })
        );
    });
});
