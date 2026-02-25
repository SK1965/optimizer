import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateWrapperViaLLM = async (signature: string): Promise<string> => {
    const prompt = `
You are an expert in code complexity analysis.
I have a function signature: ${signature}.

Generate ONLY a Python wrapper template to measure the time taken to run this function for different input sizes: 1000, 2000, 4000.
The user code will be injected where {{USER_CODE}} is placed.

Deterministic Input Rules:
- You MUST use fixed, deterministic values for inputs (e.g. lists of strictly descending or identical identical integers, or exact identical shapes).
- DO NOT use random numbers or unpredictable input generation.
- DO NOT add creative variations. The output shape should strictly be predictable.

Output requirements:
- ONLY output the valid Python code. No markdown formatting, no explanations.
- The wrapper must print the execution times exactly as:
SMALL: <time in seconds>
MEDIUM: <time in seconds>
LARGE: <time in seconds>
    `;

    try {
        console.log(`[LLM] Generating wrapper with deterministic settings`);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.0
            }
        });

        const rawText = response.text || '';
        // Remove markdown formatting if present
        return rawText.replace(/^```python\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    } catch (error) {
        console.error('LLM Wrapper Generation failed:', error);
        throw new Error('Failed to generate wrapper via LLM');
    }
};

export const validateWrapper = (wrapper: string): boolean => {
    if (!wrapper.includes('{{USER_CODE}}')) {
        return false;
    }
    if (!wrapper.includes('SMALL:') || !wrapper.includes('MEDIUM:') || !wrapper.includes('LARGE:')) {
        return false;
    }
    return true;
};
