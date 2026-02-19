import { createSubmission, getSubmissionById } from '../services/submissionService';
import { processSubmission } from '../services/workerService';

async function verifyFlow() {
  console.log('Starting Manual Verification...');

  // 1. Create Submission
  console.log('1. Creating Submission...');
  const submissionId = await createSubmission({
    code: 'print("Hello from Optimization Engine")',
    language: 'python',
    input: ''
  });
  console.log(`   Submission Created via Service with ID: ${submissionId}`);

  // 2. Mock Controller Triggering Worker
  console.log('2. Triggering Worker (Simulating Async Call)...');
  await processSubmission(submissionId);
  console.log('   Worker Finished Processing.');

  // 3. Verify Result
  console.log('3. Verifying Result in DB...');
  const result = await getSubmissionById(submissionId);
  
  if (result) {
    console.log('   Submission Found:');
    console.log(`   - Status: ${result.status}`);
    console.log(`   - Output: ${result.output?.trim()}`);
    console.log(`   - Execution Time: ${result.execution_time}ms`);
    console.log(`   - Complexity: ${result.complexity}`);
    
    if (result.status === 'completed' && result.output?.includes('Hello from Optimization Engine')) {
        console.log('✅ VERIFICATION SUCCESS: Flow works as expected.');
        process.exit(0);
    } else {
        console.error('❌ VERIFICATION FAILED: Unexpected status or output.');
        console.log(result);
        process.exit(1);
    }

  } else {
    console.error('❌ VERIFICATION FAILED: Submission not found in DB.');
    process.exit(1);
  }
}

verifyFlow().catch(err => {
    console.error('❌ VERIFICATION ERROR:', err);
    process.exit(1);
});
