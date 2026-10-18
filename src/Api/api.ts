import axios from 'axios';

const API = axios.create({
  baseURL: (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) || '/api',
});

// Add a request interceptor to include the token in the headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
