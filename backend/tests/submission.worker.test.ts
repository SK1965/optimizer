import { SubmissionWorker } from '../src/workers/submissionWorker';
import * as submissionService from '../src/services/submissionService';
import * as sandboxService from '../src/services/sandboxService';
import * as llmService from '../src/services/llmService';

// Mock dependencies
jest.mock('../src/services/submissionService');
jest.mock('../src/services/sandboxService');
jest.mock('../src/services/llmService');

describe('SubmissionWorker', () => {
  let worker: SubmissionWorker;

  beforeEach(() => {
    jest.clearAllMocks();
    worker = new SubmissionWorker();
  });

  describe('processSubmission', () => {
    // CASE_7
    it('Should update submission to completed when sandbox succeeds', async () => {
        const mockSubmission = {
            id: '123',
            code: 'console.log("test")',
            language: 'javascript',
            status: 'pending'
        };

        (submissionService.getSubmissionById as jest.Mock).mockResolvedValue(mockSubmission);
        (sandboxService.execute as jest.Mock).mockResolvedValue({ success: true, output: 'test', complexity: 'O(1)', execution_time: 0.1, memory_used: '10MB' });
        (llmService.explain as jest.Mock).mockResolvedValue('explanation');

        await worker.processSubmission('123');

        expect(submissionService.updateSubmission).toHaveBeenCalledWith(
            '123',
            expect.objectContaining({
                status: 'completed',
            })
        );
    });

    // CASE_8
    it('Should update submission to failed when sandbox throws error', async () => {
        const mockSubmission = {
            id: '124',
            code: 'error logic',
            language: 'javascript',
            status: 'pending'
        };

        (submissionService.getSubmissionById as jest.Mock).mockResolvedValue(mockSubmission);
        (sandboxService.execute as jest.Mock).mockRejectedValue(new Error('Sandbox Error'));

        await worker.processSubmission('124');

        expect(submissionService.updateSubmission).toHaveBeenCalledWith(
            '124',
            expect.objectContaining({
                status: 'failed',
                error_message: 'Sandbox Error'
            })
        );
    });

    // CASE_9
    it('Should call llmService after successful sandbox execution', async () => {
        const mockSubmission = {
            id: '125',
            code: 'test',
            language: 'python',
            status: 'pending'
        };

        const executionResult = { success: true, output: 'ok', complexity: 'O(1)', execution_time: 0.1, memory_used: '10MB' };
        (submissionService.getSubmissionById as jest.Mock).mockResolvedValue(mockSubmission);
        (sandboxService.execute as jest.Mock).mockResolvedValue(executionResult);
        (llmService.explain as jest.Mock).mockResolvedValue('AI explanation');

        await worker.processSubmission('125');

        expect(sandboxService.execute).toHaveBeenCalled();
        expect(llmService.explain).toHaveBeenCalledWith({
            code: mockSubmission.code,
            estimatedComplexity: executionResult.complexity,
            smallTime: executionResult.execution_time,
            memoryUsage: executionResult.memory_used
        });
        expect(submissionService.updateSubmission).toHaveBeenCalledWith(
            '125',
            expect.objectContaining({
                status: 'completed',
                ai_explanation: 'AI explanation'
            })
        );
    });

    // CASE_10
    it('Should NOT call llmService if sandbox fails', async () => {
        const mockSubmission = {
            id: '126',
            code: 'fail test',
            language: 'ruby',
            status: 'pending'
        };

        (submissionService.getSubmissionById as jest.Mock).mockResolvedValue(mockSubmission);
        (sandboxService.execute as jest.Mock).mockRejectedValue(new Error('Fail'));

        await worker.processSubmission('126');

        expect(sandboxService.execute).toHaveBeenCalled();
        expect(llmService.explain).not.toHaveBeenCalled();
        expect(submissionService.updateSubmission).toHaveBeenCalledWith(
            '126',
            expect.objectContaining({
                status: 'failed'
            })
        );
    });
  });
});
