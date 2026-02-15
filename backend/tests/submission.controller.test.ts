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

  const mockedGet = submissionService.getSubmissionById as jest.Mock;

  describe('GET /api/submission/:id', () => {

    it('should return 404 if submission not found', async () => {
      mockedGet.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/submission/non-existent-id');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      it('should create and then fetch submission', async () => {
      const fakeId = 'test-id-123';
      mockedCreate.mockResolvedValue(fakeId);

      const createRes = await request(app)
        .post('/api/submit')
        .send({
          code: 'console.log("Hello")',
          language: 'javascript'
        });

      expect(createRes.status).toBe(201);

      mockedGet.mockResolvedValue({
        id: fakeId,
        status: 'processing'
      });

      const getRes = await request(app)
        .get(`/api/submission/${fakeId}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body).toHaveProperty('id', fakeId);
      expect(getRes.body).toHaveProperty('status');
    });

  });

});

  });
