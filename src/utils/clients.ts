import Axios from 'axios';
import { getCsrfToken } from './authentication';

export const apiClient = Axios.create({
  withCredentials: true,
});
apiClient.interceptors.request.use((req) => {
  if (!req.headers) req.headers = {};

  const csrfToken = getCsrfToken();
  if (csrfToken) {
    req.headers['X-XSRF-TOKEN'] = csrfToken.token;
  }

  return req;
});
