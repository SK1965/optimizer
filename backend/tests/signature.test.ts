import { extractSignature } from '../src/services/signatureService';

describe('Signature Service Extraction', () => {
    it('Extracts python ints correctly and normalizes language', () => {
        const code1 = `
class Solution:
    def solve(self, x: int):
        pass
`;
        const code2 = `
class    Solution   :
  def    solve  (  self  ,  param : int  )   :
    return 0
`;
        const code3 = `class Solution: def solve(self, n:list[int]):`;

        expect(extractSignature(code1, 'python')).toBe('python:int->int');
        expect(extractSignature(code2, 'python3')).toBe('python:int->int'); // formatting variance
        expect(extractSignature(code3, 'python')).toBe('python:list[int]->int');
    });

    it('Extracts cpp ints correctly', () => {
        const cppCode1 = `
class Solution {
public:
    int solve(int n) {
        return 0;
    }
};
`;
        const cppCode2 = `class Solution{\npublic:\nint solve(int myVar){}}`;

        expect(extractSignature(cppCode1, 'c++')).toBe('cpp:int->int');
        expect(extractSignature(cppCode2, 'cpp')).toBe('cpp:int->int');
    });

    it('Extracts java ints correctly', () => {
        const javaCode = `
class Solution {
    public int solve(int abc) {
        return abc;
    }
}
`;
        const javaCode2 = `class Solution{public int solve(int _b){}}`;
        expect(extractSignature(javaCode, 'java')).toBe('java:int->int');
        expect(extractSignature(javaCode2, 'java')).toBe('java:int->int');
    });

    it('Extracts javascript correctly and defaults to any', () => {
        const jsCode = `
class Solution {
    solve(x) {
        return x;
    }
}
`;
        // spaces variant
        const jsCode2 = `class Solution { solve ( y ) { return y; } }`;
        expect(extractSignature(jsCode, 'javascript')).toBe('javascript:any->any');
        expect(extractSignature(jsCode2, 'node')).toBe('javascript:any->any');
    });

    it('Extracts C correctly', () => {
        const cCode = `
int solve(int    x) {
    return x;
}
`;
        expect(extractSignature(cCode, 'c')).toBe('c:int->int');
    });

    it('Returns null for unparseable or unsupported structures', () => {
        const invalidCode = `def foo(): pass`;
        expect(extractSignature(invalidCode, 'python')).toBeNull();
    });
});
