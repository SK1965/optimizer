import request from 'supertest';
import { app } from '../src/app';
import * as submissionService from '../src/services/submissionService';
import * as workerService from '../src/services/workerService';

jest.mock('../src/services/submissionService');

import { pool } from '../src/db/client';

describe('SubmissionController', () => {

  beforeAll(async () => {
    await pool.query('SELECT 1');
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  jest.spyOn(workerService, 'processSubmission')
      .mockResolvedValue(undefined);

  const mockedCreate = submissionService.createSubmission as jest.Mock;

  describe('POST /api/submit', () => {

    it('should create submission and return submission_id', async () => {
      mockedCreate.mockResolvedValue('test-id-123');

      const payload = {
        code: 'console.log("Hello")',
        language: 'javascript'
      };

      const res = await request(app)
        .post('/api/submit')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('submission_id', 'test-id-123');
    });

    it('should return 400 if code is missing', async () => {
      const res = await request(app)
        .post('/api/submit')
        .send({ language: 'javascript' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 if language is missing', async () => {
      const res = await request(app)
        .post('/api/submit')
        .send({ code: 'console.log("test")' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

  });

});
