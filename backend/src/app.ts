import express, { Request, Response } from 'express';

export const app = express();

app.get('/', async (req: Request, res: Response) => {
  try {
    res.send('Server is running and database is connected');
  } catch (error) {
    res.status(500).send('Server is running but database connection failed');
  }
});
