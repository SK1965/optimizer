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

    // CHECK FOR COMPLEXITY MODE
    if (submission.mode === 'complexity') {
        console.log(`[Worker] Started processing submission ${id} in AI Complexity Mode`);

        try {
            console.log(`[Worker] Generating boilerplate via LLM...`);
            const transformedCode = await generateBoilerplate(submission.language, submission.code);

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
             console.error(`[Worker] Complexity Analysis failed for ${id}:`, complexityError.message);
             throw new Error(complexityError.message);
        }
        
    } else {
        // STANDARD MODE
        console.log(`[Worker] Started processing submission ${id} in Standard Mode`);
        console.log(`[Worker] Executing code in Sandbox...`);
        
        const sandboxResult = await sandboxService.execute(
          submission.code,
          submission.language,
          submission.input
        );
        
        console.log(`[Worker] Sandbox execution finished for ${id}.`);
        console.log(`[Worker] Fetching AI explanation...`);

        const explanation = await llmService.explain({
          code: submission.code,
          estimatedComplexity: sandboxResult.complexity,
          smallTime: sandboxResult.execution_time,
          memoryUsage: sandboxResult.memory_used
        });

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
