import { pool } from '../db/client';

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('Starting migration: Adding complexity columns...');

    await client.query('BEGIN');

    // Add columns if they don't exist
    const columns = [
      'execution_time_small DOUBLE PRECISION',
      'execution_time_medium DOUBLE PRECISION',
      'execution_time_large DOUBLE PRECISION',
      'estimated_complexity VARCHAR(50)'
    ];

    for (const columnDefinition of columns) {
      const columnName = columnDefinition.split(' ')[0];
      // Check if column exists
      const checkRes = await client.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name='submissions' AND column_name=$1`,
        [columnName]
      );

      if (checkRes.rowCount === 0) {
        await client.query(`ALTER TABLE submissions ADD COLUMN ${columnDefinition}`);
        console.log(`Added column: ${columnName}`);
      } else {
        console.log(`Column already exists: ${columnName}`);
      }
    }

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
