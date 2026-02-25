export class GoogleGenAI {
  constructor() {}

  models = {
    generateContent: jest.fn().mockImplementation(async (args: any) => {
      const prompt = args.contents || '';
      
      if (prompt.includes('Generate ONLY a Python wrapper')) {
        return {
          text: `
{{USER_CODE}}
print("SMALL: 0.001")
print("MEDIUM: 0.002")
print("LARGE: 0.004")
          `
        };
      }

      return {
        text: JSON.stringify({
          explanation: 'Mock AI explanation for the code complexity and time performance.'
        })
      };
    })
  };
}
