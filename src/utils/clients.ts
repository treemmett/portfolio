import Axios from 'axios';
import { ACCESS_TOKEN_STORAGE_KEY } from './auth';

export const apiClient = Axios.create({
  withCredentials: true,
});
apiClient.interceptors.request.use((req) => {
  if (!req.headers) req.headers = {};

  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }

  return req;
});
