import axios from 'axios';
import qs from 'qs';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) =>
    qs.stringify(params, { arrayFormat: 'repeat' }),
});

export default api;