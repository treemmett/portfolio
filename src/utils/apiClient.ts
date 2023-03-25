import axios from 'axios';
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

  if (!req.headers) req.headers = {};

  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }

  return req;
});
