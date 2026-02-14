import express, { Request, Response } from 'express';
import { connectDB, query } from './server';
import { createUsersTable } from './db/init';

const app = express();
const port = 3000;

// Connect to Database
connectDB().then(() => {
  createUsersTable();
});

app.get('/', (req: Request, res: Response) => {
  res.send('Health check: OK');
});

app.get('/db-health', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ status: 'OK', time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: 'Error', error });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
