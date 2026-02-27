
// 1. Mock 'pg' module to prevent real connection attempt during import
jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

// 2. Mock services
jest.mock('../src/services/submissionService', () => ({
  createSubmission: jest.fn(),
  getSubmissionById: jest.fn(),
}));

jest.mock('../src/services/workerService', () => ({
  processSubmission: jest.fn(),
}));

import request from 'supertest';
// Import dependencies after mocking
import { createSubmission, getSubmissionById } from '../src/services/submissionService';
import { processSubmission } from '../src/services/workerService';
// app import will trigger db/client.ts import, but pg is now mocked
import { app } from '../src/app'; 

describe('SubmissionController', () => {

  beforeAll(async () => {
     // DB is already mocked via 'pg' module mock
     jest.spyOn(console, 'log').mockImplementation(() => {});
     jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/submit', () => {
    it('should create submission and trigger worker', async () => {
      const fakeId = 'abc-123';
      (createSubmission as jest.Mock).mockResolvedValue(fakeId);
      (processSubmission as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/submit')
        .send({ code: 'print("hi")', language: 'python' });

      expect(res.status).toBe(201);
      expect(res.body.submissionId).toBe(fakeId);
      
      expect(createSubmission).toHaveBeenCalledTimes(1);
      expect(processSubmission).toHaveBeenCalledWith(fakeId);
    });

    it('should return 400 for missing data', async () => {
      const res = await request(app)
        .post('/api/submit')
        .send({});

      expect(res.status).toBe(400);
      expect(createSubmission).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/submission/:id', () => {
    it('should return submission if found', async () => {
       const mockSub = { id: '123', status: 'completed' };
       (getSubmissionById as jest.Mock).mockResolvedValue(mockSub);

       const res = await request(app).get('/api/submission/123');
       
       expect(res.status).toBe(200);
       expect(res.body.id).toBe('123');
    });

    it('should return 404 if not found', async () => {
       (getSubmissionById as jest.Mock).mockResolvedValue(null);

       const res = await request(app).get('/api/submission/999');
       
       expect(res.status).toBe(404);
    });
  });

});
