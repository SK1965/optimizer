export interface CreateSubmissionInput {
  code: string;
  language: string;
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
}
