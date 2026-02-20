import { GoogleGenAI } from '@google/genai';
import { complexityAnalyzerPrompt } from '../prompts/complexityAnalyze.prompt';

export interface ExplainParams {
    code: string;
    estimatedComplexity?: string;
    smallTime?: number;
    mediumTime?: number;
    largeTime?: number;
    ratio1?: number;
    ratio2?: number;
    memoryUsage?: string;
}

let aiClient: GoogleGenAI | null = null;

const getAI = () => {
    if (!aiClient) {
        aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'test-key' });
    }
    return aiClient;
};

export const explain = async (params: ExplainParams): Promise<string> => {
    try {
        let prompt = complexityAnalyzerPrompt
            .replace('{{CODE}}', params.code)
            .replace('{{SMALL_TIME}}', params.smallTime ? (params.smallTime / 1000).toFixed(4) : 'N/A')
            .replace('{{MEDIUM_TIME}}', params.mediumTime ? (params.mediumTime / 1000).toFixed(4) : 'N/A')
            .replace('{{LARGE_TIME}}', params.largeTime ? (params.largeTime / 1000).toFixed(4) : 'N/A')
            .replace('{{RATIO_1}}', params.ratio1 ? params.ratio1.toFixed(2) : 'N/A')
            .replace('{{RATIO_2}}', params.ratio2 ? params.ratio2.toFixed(2) : 'N/A')
            .replace('{{MEMORY_USAGE}}', params.memoryUsage || 'N/A')
            .replace('{{ESTIMATED_COMPLEXITY}}', params.estimatedComplexity || 'Unknown');

        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const text = response.text || '{}';
        return text;
    } catch (error) {
        console.error("LLM Service Error:", error);
        return JSON.stringify({
            error: "Failed to generate AI explanation.",
            estimated_complexity: params.estimatedComplexity
        });
    }
};
