import { processSubmission } from '../src/services/workerService';
import * as submissionService from '../src/services/submissionService';
import * as sandboxService from '../src/services/sandboxService';
import * as llmService from '../src/services/llmService';
import { PythonComplexityAnalyzer } from '../src/complexity/python/PythonComplexityAnalyzer';

// Mock dependencies
jest.mock('../src/services/submissionService');
jest.mock('../src/services/sandboxService');
jest.mock('../src/services/llmService');
jest.mock('../src/complexity/python/PythonComplexityAnalyzer');

describe('SubmissionWorker - processSubmission', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Standard Mode', () => {
    it('Should update submission to completed when sandbox succeeds', async () => {
        const mockSubmission = {
            id: '123',
            code: 'console.log("test")',
            language: 'javascript',
            status: 'pending'
        };

        (submissionService.getSubmissionById as jest.Mock).mockResolvedValue(mockSubmission);
        PythonComplexityAnalyzer.prototype.isComplexityMode = jest.fn().mockReturnValue(false);
        (sandboxService.execute as jest.Mock).mockResolvedValue({ success: true, output: 'test', complexity: 'O(1)', execution_time: 0.1, memory_used: '10MB' });
        (llmService.explain as jest.Mock).mockResolvedValue('explanation');

        await processSubmission('123');

        expect(submissionService.updateSubmission).toHaveBeenCalledWith(
            '123',
            expect.objectContaining({
                status: 'completed',
            })
        );
    });

    it('Should update submission to failed when sandbox throws error', async () => {
        const mockSubmission = {
            id: '124',
            code: 'error logic',
            language: 'javascript',
            status: 'pending'
        };

        (submissionService.getSubmissionById as jest.Mock).mockResolvedValue(mockSubmission);
        PythonComplexityAnalyzer.prototype.isComplexityMode = jest.fn().mockReturnValue(false);
        (sandboxService.execute as jest.Mock).mockRejectedValue(new Error('Sandbox Error'));

        await processSubmission('124');

        expect(submissionService.updateSubmission).toHaveBeenCalledWith(
            '124',
            expect.objectContaining({
                status: 'failed',
                error_message: 'Sandbox Error'
            })
        );
    });

    it('Should call llmService after successful sandbox execution in standard mode', async () => {
        const mockSubmission = {
            id: '125',
            code: 'test',
            language: 'javascript',
            status: 'pending'
        };

        const executionResult = { success: true, output: 'ok', complexity: 'O(1)', execution_time: 0.1, memory_used: '10MB' };
        (submissionService.getSubmissionById as jest.Mock).mockResolvedValue(mockSubmission);
        PythonComplexityAnalyzer.prototype.isComplexityMode = jest.fn().mockReturnValue(false);
        (sandboxService.execute as jest.Mock).mockResolvedValue(executionResult);
        (llmService.explain as jest.Mock).mockResolvedValue('AI explanation');

        await processSubmission('125');

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

    it('Should NOT call llmService if sandbox fails', async () => {
        const mockSubmission = {
            id: '126',
            code: 'fail test',
            language: 'ruby',
            status: 'pending'
        };

        (submissionService.getSubmissionById as jest.Mock).mockResolvedValue(mockSubmission);
        PythonComplexityAnalyzer.prototype.isComplexityMode = jest.fn().mockReturnValue(false);
        (sandboxService.execute as jest.Mock).mockRejectedValue(new Error('Fail'));

        await processSubmission('126');

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
