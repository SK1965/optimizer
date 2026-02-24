import { connectDB } from './db';
import { app } from './app';

const port = 3000;

// Connect to Database
connectDB().then(() => {
  console.log('Database connected successfully');
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to connect to database', err);
  process.exit(1);
});
