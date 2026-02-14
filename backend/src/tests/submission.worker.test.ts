import { SubmissionWorker } from '../workers/submissionWorker';
import { SubmissionService } from '../services/submissionService';
import { SandboxService } from '../services/sandboxService';
import { LLMService } from '../services/llmService';

// Mock dependencies (Virtual mocks)
jest.mock('../services/submissionService', () => ({
  SubmissionService: jest.fn().mockImplementation(() => ({
    getSubmission: jest.fn(),
    updateSubmissionStatus: jest.fn()
  }))
}), { virtual: true });

jest.mock('../services/sandboxService', () => ({
  SandboxService: jest.fn().mockImplementation(() => ({
    execute: jest.fn()
  }))
}), { virtual: true });

jest.mock('../services/llmService', () => ({
  LLMService: jest.fn().mockImplementation(() => ({
    explain: jest.fn()
  }))
}), { virtual: true });

describe('SubmissionWorker', () => {
  let worker: SubmissionWorker;
  let mockSubmissionService: any;
  let mockSandboxService: any;
  let mockLLMService: any;

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();

    mockSubmissionService = new SubmissionService();
    mockSandboxService = new SandboxService();
    mockLLMService = new LLMService();
    
    // We can instantiate worker directly if we assume dependency injection
    // Even if file doesn't exist, we are writing the test as if it does.
    worker = new SubmissionWorker(
        mockSubmissionService,
        mockSandboxService,
        mockLLMService
    );
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

        mockSubmissionService.getSubmission.mockResolvedValue(mockSubmission);
        mockSandboxService.execute.mockResolvedValue({ success: true, output: 'test' });
        mockLLMService.explain.mockResolvedValue('explanation');

        await worker.processSubmission('123');

        expect(mockSubmissionService.getSubmission).toHaveBeenCalledWith('123');
        expect(mockSandboxService.execute).toHaveBeenCalledWith(
            mockSubmission.code, 
            mockSubmission.language, 
            undefined
        );
        // Should verify status update
        // We assume updateSubmissionStatus(id, status, result) signature
        expect(mockSubmissionService.updateSubmissionStatus).toHaveBeenCalledWith(
            '123',
            'completed',
            expect.objectContaining({ 
                result: { success: true, output: 'test' },
                explanation: 'explanation'
            })
        );
    });
  });
});
