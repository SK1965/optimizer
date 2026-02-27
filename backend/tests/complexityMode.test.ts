import { processSubmission } from '../src/services/workerService';
import * as submissionService from '../src/services/submissionService';
import * as sandboxService from '../src/services/sandboxService';
import * as llmService from '../src/services/llmService';
import * as aiBoilerplateService from '../src/services/aiBoilerplateService';

// Mock dependencies
jest.mock('../src/services/submissionService');
jest.mock('../src/services/sandboxService');
jest.mock('../src/services/llmService');
jest.mock('../src/services/aiBoilerplateService');

describe('SubmissionWorker - AI Complexity Mode', () => {

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should correctly execute, parse timings, estimate O(n) complexity, and update DB', async () => {
      const mockSubmission = {
          id: '123-complex',
          code: 'for(let i=0; i<n; i++) {}',
          language: 'javascript',
          status: 'pending',
          mode: 'complexity'
      };

      // 1. Mock the submission fetch
      (submissionService.getSubmissionById as jest.Mock).mockResolvedValue(mockSubmission);

      // 2. Mock AI Boilerplate generator to just return some dummy code
      (aiBoilerplateService.generateBoilerplate as jest.Mock).mockResolvedValue('// transpiled code');

      // 3. Mock Sandbox execution returning doubled timings -> maps to O(n)
      (sandboxService.execute as jest.Mock).mockResolvedValue({
          output: `SMALL_TIME=100\nMEDIUM_TIME=200\nLARGE_TIME=400\nsome other stdout`,
          exitCode: 0,
          memory_used: 'N/A'
      });

      // 4. Mock AI explanation returning a dummy string
      (llmService.explain as jest.Mock).mockResolvedValue('AI generated explanation about O(n) growth');

      // Execute worker
      await processSubmission('123-complex');

      expect(aiBoilerplateService.generateBoilerplate).toHaveBeenCalledWith('javascript', mockSubmission.code);
      
      expect(sandboxService.execute).toHaveBeenCalledWith(
          '// transpiled code',
          'javascript',
          undefined
      );
      
      // Expected O(n) calculations
      expect(llmService.explain).toHaveBeenCalledWith({
          code: mockSubmission.code,
          estimatedComplexity: 'O(n) or O(n log n)',
          smallTime: 100,
          mediumTime: 200,
          largeTime: 400,
          ratio1: 2.0,
          ratio2: 2.0,
          memoryUsage: 'N/A'
      });

      expect(submissionService.updateSubmission).toHaveBeenCalledWith(
          '123-complex',
          expect.objectContaining({
              status: 'completed',
              execution_time_small: 100,
              execution_time_medium: 200,
              execution_time_large: 400,
              estimated_complexity: 'O(n) or O(n log n)',
              ai_explanation: 'AI generated explanation about O(n) growth',
              complexity: 'O(n) or O(n log n)' // Backwards compatible metric field
          })
      );
  });

  it('Should fail submission if Sandbox emits bad timing stdout', async () => {
    const mockSubmission = {
        id: '124-complex',
        code: 'bad code',
        language: 'python',
        status: 'pending',
        mode: 'complexity'
    };

    (submissionService.getSubmissionById as jest.Mock).mockResolvedValue(mockSubmission);
    (aiBoilerplateService.generateBoilerplate as jest.Mock).mockResolvedValue('// transpiled code');
    (sandboxService.execute as jest.Mock).mockResolvedValue({
        output: `syntax error on line 1`,
        exitCode: 1,
        memory_used: 'N/A'
    });

    await processSubmission('124-complex');

    expect(submissionService.updateSubmission).toHaveBeenCalledWith(
        '124-complex',
        expect.objectContaining({
            status: 'failed',
            error_message: expect.stringContaining('Failed to parse fully expected timing outputs')
        })
    );
  });

});
