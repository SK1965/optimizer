import request from 'supertest';
import { app } from '../app';

// Mock dependencies (Virtual mocks since files might not exist yet)
jest.mock('../services/submissionService', () => {
  return {
    SubmissionService: jest.fn().mockImplementation(() => ({
      createSubmission: jest.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        code: 'console.log("test")',
        language: 'javascript',
        status: 'pending',
        created_at: new Date()
      }),
      getSubmission: jest.fn()
    }))
  };
}, { virtual: true });

jest.mock('../workers/submissionWorker', () => {
  return {
    SubmissionWorker: jest.fn().mockImplementation(() => ({
      processSubmission: jest.fn().mockResolvedValue(undefined)
    }))
  };
}, { virtual: true });

describe('SubmissionController', () => {
  describe('POST /submit', () => {
    // CASE_1
    it('Should create submission and return submission_id', async () => {
      const payload = {
        code: 'console.log("Hello")',
        language: 'javascript'
      };

      const res = await request(app)
        .post('/submit')
        .send(payload);
      
      expect(res.status).toBe(201); // Created
      expect(res.body).toHaveProperty('submission_id');
      expect(typeof res.body.submission_id).toBe('string');
    });

    // CASE_2
    it('Should return 400 if code missing', async () => {
      const payload = {
        // code is missing
        language: 'javascript'
      };

      const res = await request(app)
        .post('/submit')
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
