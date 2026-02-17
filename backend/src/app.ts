import express, { Request, Response,} from 'express';
import router from './routes/submission.routes';

export const app = express();

app.use(express.json());
app.use('/api/', router);
app.get('/', async (req: Request, res: Response) => {
  try {
    res.send('Server is running and database is connected');
  } catch (error) {
    res.status(500).send('Server is running but database connection failed');
  }
});
