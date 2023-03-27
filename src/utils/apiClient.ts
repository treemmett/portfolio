import axios, { AxiosError } from 'axios';
import * as Errors from './errors';
import { ACCESS_TOKEN_STORAGE_KEY } from '@entities/Jwt';

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

apiClient.interceptors.request.use((req) => {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }

  return req;
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
