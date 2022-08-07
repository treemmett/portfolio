import axios from 'axios';

export interface ApiRequest {
  id: string;
  progress: number;
  startRequest: (setProgress: (progress: number) => void) => Promise<void>;
  status: 'queued' | 'uploading' | 'complete';
  thumbnailUrl?: string;
}

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});
