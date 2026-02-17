import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
  process.exit(1);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
