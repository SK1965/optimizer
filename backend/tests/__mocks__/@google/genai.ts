export class GoogleGenAI {
  constructor() {}

  models = {
    generateContent: jest.fn().mockResolvedValue({
      text: JSON.stringify({
        explanation: 'Mock AI explanation for the code complexity and time performance.'
      })
    })
  };
}
