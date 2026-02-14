process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import express, { Request, Response } from 'express';
import { connectDB } from './db';

const app = express();
const port = 3000;

// Connect to Database
connectDB().then(() => {
  console.log('Database connected successfully');
});

app.get('/', async (req: Request, res: Response) => {
  try {
    res.send('Server is running and database is connected');
  } catch (error) {
    res.status(500).send('Server is running but database connection failed');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
