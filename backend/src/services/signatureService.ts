/**
 * Service to extract and normalize function signatures from user code.
 * 
 * For the MVP, this relies on Regex extraction rather than a full AST parser.
 * It strictly looks for `class Solution` and a `solve` method with a single parameter.
 */

export const extractSignature = (code: string, language: string): string | null => {
  const normLang = language.toLowerCase();
  let paramType: string | null = null;
  let returnType = 'int'; // MVP assumes return type is int if not easily parsable

  if (normLang === 'python' || normLang === 'python3') {
    // Match Python class Solution: def solve(self, param: type): or -> type:
    // This regex looks for: class Solution:\s+def solve(self, paramName: paramType)
    const pythonRegex = /class\s+Solution\s*:\s*def\s+solve\s*\(\s*self\s*,\s*\w+\s*:\s*([a-zA-Z0-9_\[\]]+)\s*\)/s;
    const match = pythonRegex.exec(code);
    if (match) {
      paramType = match[1];
    }
  } else if (normLang === 'cpp' || normLang === 'c++') {
    // Match C++ class Solution { public: int solve(int paramName)
    const cppRegex = /class\s+Solution\s*\{.*public\s*:\s*(int)\s+solve\s*\(\s*(int|[a-zA-Z0-9_<>: ]+)\s+\w+\s*\)/s;
    const match = cppRegex.exec(code);
    if (match) {
      returnType = match[1];
      paramType = match[2].replace(/\s+/g, ''); // normalize spacing
    }
  } else if (normLang === 'java') {
    // Match Java class Solution { public int solve(int paramName)
    const javaRegex = /class\s+Solution\s*\{.*public\s+(int)\s+solve\s*\(\s*(int|[a-zA-Z0-9_<>\[\]]+)\s+\w+\s*\)/s;
    const match = javaRegex.exec(code);
    if (match) {
      returnType = match[1];
      paramType = match[2].replace(/\s+/g, '');
    }
  } else if (normLang === 'c') {
    const cRegex = /(int)\s+solve\s*\(\s*(int)\s+\w+\s*\)/s;
    const match = cRegex.exec(code);
    if (match) {
      returnType = match[1];
      paramType = match[2];
    }
  } else if (normLang === 'javascript' || normLang === 'node' || normLang === 'js') {
    const jsRegex = /class\s+Solution\s*\{.*solve\s*\(\s*\w+\s*\)/s;
    const match = jsRegex.exec(code);
    if (match) {
      paramType = 'any';
      returnType = 'any';
    }
  }

  if (!paramType) {
    return null;
  }

  // Normalize language name for output key
  let outputLang = normLang;
  if (normLang === 'python3') outputLang = 'python';
  if (normLang === 'c++') outputLang = 'cpp';
  if (normLang === 'node' || normLang === 'js') outputLang = 'javascript';

  return `${outputLang}:${paramType}->${returnType}`;
};
