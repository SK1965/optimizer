import { GoogleGenAI } from '@google/genai';
import { CPP_CODE_IMPLEMENTATION_PROMPT } from '../prompts/CPP_code_implementation.prompt';
import { C_CODE_IMPLEMENTATION_PROMPT } from '../prompts/C_code_implementation.prompt';
import { JAVA_CODE_IMPLEMENTATION_PROMPT } from '../prompts/Java_code_implementation.prompt';
import { NODE_CODE_IMPLEMENTATION_PROMPT } from '../prompts/Node_code_implementation.prompt';
import { PYTHON_CODE_IMPLEMENTATION_PROMPT } from '../prompts/Python_code_implementation.prompt';

let aiClient: GoogleGenAI | null = null;

const getAI = () => {
    if (!aiClient) {
        aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'test-key' });
    }
    return aiClient;
};

const getPromptForLanguage = (language: string): string => {
    switch (language.toLowerCase()) {
        case 'cpp':
        case 'c++':
            return CPP_CODE_IMPLEMENTATION_PROMPT;
        case 'c':
            return C_CODE_IMPLEMENTATION_PROMPT;
        case 'java':
            return JAVA_CODE_IMPLEMENTATION_PROMPT;
        case 'node':
        case 'js':
        case 'javascript':
            return NODE_CODE_IMPLEMENTATION_PROMPT;
        case 'python':
        case 'python3':
        case 'py':
            return PYTHON_CODE_IMPLEMENTATION_PROMPT;
        default:
            throw new Error(`Unsupported language for complexity AI mode: ${language}`);
    }
};

/**
 * Generates an executable boilerplate wrapping the user's code using the Gemini AI.
 * The wrapped code will be instrumented to compute scaling metrics (SMALL, MEDIUM, LARGE inputs).
 */
export const generateBoilerplate = async (language: string, userCode: string): Promise<string> => {
    try {
        const basePrompt = getPromptForLanguage(language);
        
        const fullPrompt = `
${basePrompt}

CRITICAL: Return ONLY the raw runnable code. Do not use Markdown formatting (\`\`\`language...\`\`\`).
Do NOT include any explanations or conversational text.

USER_CODE:
${userCode}
`;

        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                // Ensure plain text response is requested to minimize markdown formatting
                responseMimeType: 'text/plain'
            }
        });

        let generatedCode = response.text || '';
        
        // Strip markdown backticks if AI ignores the instruction
        if (generatedCode.startsWith('\`\`\`')) {
            const firstNewline = generatedCode.indexOf('\n');
            if (firstNewline !== -1) {
                generatedCode = generatedCode.substring(firstNewline + 1);
            }
            if (generatedCode.endsWith('\`\`\`')) {
                generatedCode = generatedCode.substring(0, generatedCode.length - 3);
            }
            if (generatedCode.endsWith('\`\`\`\n')) {
                 generatedCode = generatedCode.substring(0, generatedCode.length - 4);
            }
        }
        
        generatedCode = generatedCode.trim();

        if (!generatedCode) {
            throw new Error("AI returned empty boilerplate string.");
        }

        return generatedCode;
    } catch (error: any) {
        console.error("[generateBoilerplate] LLM Error:", error);
        throw new Error(`Failed to generate complexity boilerplate: ${error.message}`);
    }
};
