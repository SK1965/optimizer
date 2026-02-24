export interface SubmissionRequest {
  code: string;
  language: string;
}

export interface SubmissionResponse {
  submissionId: string;
  message: string;
}

export interface SubmissionStatus {
  id: string;
  code: string;
  language: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  execution_time: number | null;
  estimated_complexity: string | null;
  ai_explanation: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const submitCode = async (data: SubmissionRequest): Promise<SubmissionResponse> => {
  const response = await fetch(`${API_BASE_URL}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit code: ${response.statusText}`);
  }

  return response.json();
};

export const getSubmissionStatus = async (id: string): Promise<SubmissionStatus> => {
  const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get submission status: ${response.statusText}`);
  }

  return response.json();
};
