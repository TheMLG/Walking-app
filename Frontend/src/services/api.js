import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true
});

let csrfToken = '';

export async function bootstrapApi() {
  const response = await api.get('/api/auth/csrf');
  csrfToken = response.data.csrfToken;
  return csrfToken;
}

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (!['get', 'head', 'options'].includes(method) && csrfToken) {
    config.headers = config.headers || {};
    config.headers['x-csrf-token'] = csrfToken;
  }
  return config;
});

export function setCsrfToken(token) {
  csrfToken = token;
}

export default api;
