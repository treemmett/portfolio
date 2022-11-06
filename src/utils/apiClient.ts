import axios from 'axios';

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
