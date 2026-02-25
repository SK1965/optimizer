import { pool } from '../db/client';

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('Starting migration: Creating signature_wrappers table...');

    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS signature_wrappers (
        id UUID PRIMARY KEY,
        language VARCHAR(50) NOT NULL,
        normalized_signature TEXT NOT NULL,
        wrapper_template TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(language, normalized_signature)
      );
    `);

    console.log('Table signature_wrappers created with UNIQUE constraint on (language, normalized_signature).');

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
