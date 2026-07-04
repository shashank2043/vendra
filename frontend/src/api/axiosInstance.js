import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      // Retrieve token from redux-persist stored in localStorage
      const persistRoot = localStorage.getItem('persist:root');
      if (persistRoot) {
        const rootState = JSON.parse(persistRoot);
        if (rootState.auth) {
          const auth = JSON.parse(rootState.auth);
          if (auth.token) {
            config.headers.Authorization = `Bearer ${auth.token}`;
          }
        }
      }
    } catch (error) {
      console.error('Error reading auth token from localStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
