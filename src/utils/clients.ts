import Axios from 'axios';
import { getAuthToken } from './authentication';

export const apiClient = Axios.create({
  withCredentials: true,
});
apiClient.interceptors.request.use((req) => {
  if (!req.headers) req.headers = {};

  const access = getAuthToken();
  if (access) {
    req.headers.authorization = `Bearer ${access.token}`;
  }

  return req;
});
