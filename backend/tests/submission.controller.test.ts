import request from 'supertest';
import { app } from '../src/app';
import * as submissionService from '../src/services/submissionService';
import * as workerService from '../src/services/workerService';

jest.mock('../src/services/submissionService');

import { pool } from '../src/db/client';

describe('SubmissionController', () => {

  beforeAll(async () => {
    // Ensure DB is ready
    await pool.query('SELECT 1');
  });

  afterAll(async () => {
    // Close DB connection after tests
    await pool.end();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 🧠 Mock worker only (so sandbox/LLM not triggered)
  jest.spyOn(workerService, 'processSubmission')
  describe('POST /api/submit', () => {

    it('should create submission and return submission_id', async () => {
      const payload = {
        code: 'console.log("Hello")',
        language: 'javascript'
      };

      const res = await request(app)
        .post('/api/submit')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('submission_id');
      expect(typeof res.body.submission_id).toBe('string');
    });

  });

});
