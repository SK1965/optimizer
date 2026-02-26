export interface CreateSubmissionInput {
  code: string;
  language: string;
  mode?: 'standard' | 'complexity';
  input?: string;
}

export interface UpdateSubmissionInput {
  status?: string;
  execution_time?: number;
  memory_used?: string;
  output?: string;
  complexity?: string;
  ai_explanation?: string;
  error_message?: string;
  execution_time_small?: number;
  execution_time_medium?: number;
  execution_time_large?: number;
  estimated_complexity?: string;
}
