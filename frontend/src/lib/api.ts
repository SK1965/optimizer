import axios from 'axios';

export interface SubmissionRequest {
  code: string;
  language: string;
}

export interface SubmissionResponse {
  submission_id: string;
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

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const submitCode = async (data: SubmissionRequest): Promise<SubmissionResponse> => {
  console.log('Submitting code length:', data.code.length);
  try {
    const response = await apiClient.post<SubmissionResponse>('/submit', data);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Failed to submit code: ${error.response.statusText}`);
    }
    throw new Error(`Failed to submit code: ${error.message}`);
  }
};

export const getSubmissionStatus = async (id: string): Promise<SubmissionStatus> => {
  try {
    const response = await apiClient.get<SubmissionStatus>(`/submission/${id}`);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Failed to get submission status: ${error.response.statusText}`);
    }
    throw new Error(`Failed to get submission status: ${error.message}`);
  }
};
