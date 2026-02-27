import { explain } from '../services/llmService';

async function test() {
    const res = await explain({
        code: "int main() { return 0; }",
        estimatedComplexity: "O(1)",
        smallTime: 10,
        mediumTime: 10,
        largeTime: 10,
        ratio1: 1,
        ratio2: 1,
        memoryUsage: "1MB"
    });
    console.log("LLM Response RAW:");
    console.log(res);
}

test();
