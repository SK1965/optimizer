import * as sandboxService from './sandboxService';
import * as llmService from './llmService';
import {
  getSubmissionById,
  updateSubmission,
} from './submissionService';
import { PythonComplexityAnalyzer } from '../complexity/python/PythonComplexityAnalyzer';
import sandboxRunner from '../sandbox/sandboxRunner';

const pythonAnalyzer = new PythonComplexityAnalyzer();

export const processSubmission = async (id: string) => {
  try {
    const submission = await getSubmissionById(id);

    if (!submission) {
      throw new Error('Submission not found');
    }
    
    // IDEMPOTENCY CHECK (Audit Fix)
    if (submission.status === 'completed' || submission.status === 'failed') {
        console.log(`Submission ${id} is already processed. Skipping.`);
        return;
    }

    // CHECK FOR COMPLEXITY MODE (Python + Signature)
    if (submission.language === 'python' && pythonAnalyzer.isComplexityMode(submission.code)) {
        
        console.log(`Processing submission ${id} in Complexity Mode`);
        
        const complexityResult = await pythonAnalyzer.analyze(submission.code, submission.language, sandboxRunner);
        
        if (complexityResult.error) {
             throw new Error(complexityResult.error);
        }
        
        // Use LLM to explain the complexity
        const explanation = await llmService.explain(
            submission.code,
            complexityResult.estimatedComplexity || 'Unknown'
        );

        await updateSubmission(id, {
            status: 'completed',
            execution_time_small: complexityResult.executionTimes?.small,
            execution_time_medium: complexityResult.executionTimes?.medium,
            execution_time_large: complexityResult.executionTimes?.large,
            estimated_complexity: complexityResult.estimatedComplexity,
            ai_explanation: explanation,
            output: 'Complexity Analysis Completed Successfully',
            complexity: complexityResult.estimatedComplexity
        });
        
    } else {
        // STANDARD MODE
        console.log(`Processing submission ${id} in Standard Mode`);
        
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
    }

  } catch (error: any) {
    console.error(`Submission processing failed for ${id}:`, error);
    await updateSubmission(id, {
      status: 'failed',
      error_message: error.message,
    });
  }
};
