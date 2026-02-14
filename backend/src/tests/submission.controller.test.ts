import request from 'supertest';
import { app } from '../app';
import { SubmissionWorker } from '../workers/submissionWorker';

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

    // CASE_3
    it('Should return 400 if language missing', async () => {
      const payload = {
        code: 'console.log("test")'
        // language is missing
      };

      const res = await request(app)
        .post('/submit')
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    // CASE_4
    it('Should trigger background worker', async () => {
      const payload = {
        code: 'console.log("test")',
        language: 'javascript'
      };

      await request(app)
        .post('/submit')
        .send(payload);

      // Verify SubmissionWorker was instantiated
      expect(SubmissionWorker).toHaveBeenCalled();
      
      // Verify processSubmission was called on the instance
      // Note: In a real test we might need to grab the specific instance
      const workerInstance = (SubmissionWorker as jest.Mock).mock.instances[0];
      // Depending on implementation, instance might be created once or per request. 
      // Assuming singleton or fresh instance, we check if method called.
      // If singleton, we might check last instance.
      // But here we rely on the mock factory.
      if (workerInstance) {
          expect(workerInstance.processSubmission).toHaveBeenCalled();
      }
    });
  });
});
