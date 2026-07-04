import axios from 'axios';

// Talks to the real Spring Cloud Gateway (see .env.*).
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Read the persisted real Keycloak access token and attach it as a Bearer header.
const readAuth = () => {
  try {
    const persistRoot = localStorage.getItem('persist:root');
    if (!persistRoot) return null;
    const rootState = JSON.parse(persistRoot);
    if (!rootState.auth) return null;
    return JSON.parse(rootState.auth);
  } catch (error) {
    console.error('Error reading auth from localStorage:', error);
    return null;
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    const auth = readAuth();
    const token = auth?.accessToken || auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;

// The backend wraps every payload in ApiResponse<T> = { success, message, data, ... }.
// Unwrap it to the inner `data` so slices can keep reading `response.data`.
axiosInstance.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    // On a 401, try a one-shot refresh, then fall back to logout.
    if (error.response?.status === 401 && original && !original._retry && !isRefreshing) {
      original._retry = true;
      const auth = readAuth();
      const refreshToken = auth?.refreshToken;
      if (refreshToken) {
        try {
          isRefreshing = true;
          const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
          const payload = res.data?.data || res.data;
          const newToken = payload?.accessToken;
          if (newToken) {
            // Persist the rotated token back into redux-persist storage.
            const persistRoot = JSON.parse(localStorage.getItem('persist:root'));
            const updatedAuth = { ...auth, accessToken: newToken, refreshToken: payload.refreshToken || refreshToken };
            persistRoot.auth = JSON.stringify(updatedAuth);
            localStorage.setItem('persist:root', JSON.stringify(persistRoot));
            original.headers.Authorization = `Bearer ${newToken}`;
            isRefreshing = false;
            return axiosInstance(original);
          }
        } catch (refreshErr) {
          isRefreshing = false;
          console.error('Token refresh failed:', refreshErr);
        }
      }
      // Refresh unavailable/failed -> clear session and bounce to login.
      localStorage.removeItem('persist:root');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
