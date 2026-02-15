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

});
