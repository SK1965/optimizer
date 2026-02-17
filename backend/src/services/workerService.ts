import * as sandboxService from './sandboxService';
import * as llmService from './llmService';
import {
  getSubmissionById,
  updateSubmission,
} from './submissionService';

export const processSubmission = async (id: string) => {
  try {
    const submission = await getSubmissionById(id);

    if (!submission) {
      throw new Error('Submission not found');
    }

    const sandboxResult = await sandboxService.execute(
      submission.code,
      submission.language,
      submission.input
    );

    const explanation = await llmService.explain(
      submission.code,
      sandboxResult.complexity
    );

    await updateSubmission(id, {
      status: 'completed',
      execution_time: sandboxResult.execution_time,
      memory_used: sandboxResult.memory_used,
      output: sandboxResult.output,
      complexity: sandboxResult.complexity,
      ai_explanation: explanation,
    });

  } catch (error: any) {
    await updateSubmission(id, {
      status: 'failed',
      error_message: error.message,
    });
  }
};
