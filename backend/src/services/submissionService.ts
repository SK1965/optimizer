import { query } from '../db/client';
import { randomUUID } from 'crypto';
import { CreateSubmissionInput, UpdateSubmissionInput } from '../types/submissions.types';
export const createSubmission = async (
  data: CreateSubmissionInput
): Promise<string> => {
  const id = randomUUID();
  
  try {
    await query(
      `INSERT INTO submissions 
       (id, code, language, input, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        id,
        data.code,
        data.language,
        data.input ?? null,
        'processing'
      ]
    );
  
    console.log(`[DB] Successfully saved submission ${id} to database.`);
    return id;
  } catch (error) {
    console.error("REAL DB ERROR:", error);
    throw error;
  }
};

export const getSubmissionById = async (id: string) => {
  try {
    const result = await query(
      `SELECT * FROM submissions WHERE id = $1`,
      [id]
    );
  
    return result.rows[0] ?? null;
  } catch (error) {
    throw error;
  }
};

export const updateSubmission = async (
  id: string,
  updates: UpdateSubmissionInput
) => {
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${index}`);
    values.push(value ?? null);
    index++;
  }

  if (fields.length === 0) return;

  values.push(id);

  await query(
    `UPDATE submissions
     SET ${fields.join(', ')},
         updated_at = NOW()
     WHERE id = $${index}`,
    values
  );
};
