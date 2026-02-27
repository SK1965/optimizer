import * as sandboxService from './sandboxService';
import * as llmService from './llmService';
import {
  getSubmissionById,
  updateSubmission,
} from './submissionService';
import { generateBoilerplate } from './aiBoilerplateService';
import { parseTimingOutput, estimateComplexity, ParsedTiming } from '../utils/complexityUtils';

export const processSubmission = async (id: string) => {
  try {
    const submission = await getSubmissionById(id);

    if (!submission) {
      throw new Error('Submission not found');
    }
    
    // IDEMPOTENCY CHECK
    if (submission.status === 'completed' || submission.status === 'failed') {
        console.log(`Submission ${id} is already processed. Skipping.`);
        return;
    }

    console.log(`[Worker] Started processing submission ${id} via AI Wrapper (Default)`);

    try {
        console.log(`[Worker] Generating boilerplate via LLM...`);
        const transformedCode = await generateBoilerplate(submission.language, submission.code);

        // REQUIRED DEBUG STEP 1: Log full transformedCode before sandbox execution
        console.log(`[Worker] Full Transformed Code before Sandbox execution:\n`, transformedCode);

        // REQUIRED DEBUG STEP 2 & 3: Assert transformedCode.includes('main(')
        if (submission.language === 'cpp' || submission.language === 'c++' || submission.language === 'c') {
            if (!transformedCode.includes('main(')) {
                 console.error(`[Worker] AI generated code is missing main() function.`);
                 throw new Error('AI generated code is missing main() function.');
            }
        }

        console.log(`[Worker] Executing instrumented code in Sandbox...`);
        const sandboxResult = await sandboxService.execute(
            transformedCode,
            submission.language,
            submission.input
        );

        console.log(`[Worker] Sandbox execution finished for ${id}. Parsing timings...`);
        
        // Extract timings using our regex utility
        const timings: ParsedTiming = parseTimingOutput(sandboxResult.output);
        
        console.log(`[Worker] Parsed Timings:`, timings);
        
        // Mathematically estimate complexity based on input doubling ratios
        const estimatedO = estimateComplexity(timings.small, timings.medium, timings.large);
        
        console.log(`[Worker] Complexity Analysis finished for ${id}. Estimated: ${estimatedO}`);
        console.log(`[Worker] Fetching AI explanation...`);
        
        const ratio1 = timings.medium / timings.small;
        const ratio2 = timings.large / timings.medium;

        // Use LLM to explain the complexity with the extracted real timings
        const explanation = await llmService.explain({
            code: submission.code,
            estimatedComplexity: estimatedO,
            smallTime: timings.small,
            mediumTime: timings.medium,
            largeTime: timings.large,
            ratio1,
            ratio2,
            memoryUsage: sandboxResult.memory_used || 'N/A'
        });

        console.log(`[Worker] Updating DB for submission ${id} with completed status...`);
        await updateSubmission(id, {
            status: 'completed',
            execution_time_small: timings.small,
            execution_time_medium: timings.medium,
            execution_time_large: timings.large,
            estimated_complexity: estimatedO,
            ai_explanation: explanation,
            output: sandboxResult.output,
            complexity: estimatedO // map to old db schema as fallback
        });
        console.log(`[Worker] Successfully completed submission ${id}`);

    } catch (complexityError: any) {
         console.error(`[Worker] Analysis failed for ${id}:`, complexityError.message);
         throw new Error(complexityError.message);
    }

  } catch (error: any) {
    console.error(`Submission processing failed for ${id}:`, error);
    await updateSubmission(id, {
      status: 'failed',
      error_message: error.message,
    });
  }
};
