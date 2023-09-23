import axios, { AxiosError } from 'axios';
import * as Errors from './errors';

export interface ApiRequest {
  id: string;
  progress: number;
  startRequest: (setProgress: (progress: number) => void) => Promise<void>;
  status: 'error' | 'queued' | 'uploading' | 'complete';
  thumbnailUrl?: string;
}

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

apiClient.interceptors.response.use(undefined, (err: AxiosError<{ error: Errors.APIError }>) => {
  const errorCode = err.response?.data?.error?.code as keyof typeof Errors;
  if (errorCode) {
    const E = Errors[errorCode] || Errors.APIError;
    throw new E(err.response?.data?.error?.message || 'An unknown error occurred');
  } else {
    throw new Errors.APIError();
  }
});
