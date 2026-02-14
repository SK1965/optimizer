import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Health check: OK');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
