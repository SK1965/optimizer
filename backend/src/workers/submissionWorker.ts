import { processSubmission } from '../services/workerService';

export class SubmissionWorker {
  // Dependencies injected for test compatibility, but logic is delegated to workerService
  constructor(
    private submissionService?: any,
    private sandboxService?: any,
    private llmService?: any
  ) {}

  async processSubmission(submissionId: string): Promise<void> {
    await processSubmission(submissionId);
  }
}
