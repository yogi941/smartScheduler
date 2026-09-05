import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * In-memory access token store. Deliberately NOT localStorage/sessionStorage:
 * an access token in a JS-readable store is exposed to any successful XSS,
 * whereas an in-memory variable disappears on refresh (acceptable, since
 * the httpOnly refresh-token cookie silently re-establishes the session
 * via /auth/refresh-token on app load — see AuthContext.jsx).
 */
let accessToken = null;

function setAccessToken(token) {
  accessToken = token;
}

function getAccessToken() {
  return accessToken;
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the httpOnly refreshToken cookie
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * Single-flight refresh queue: if five requests all 401 at the same
 * moment, only the FIRST triggers a real /auth/refresh-token call. Every
 * other failed request awaits that same in-flight promise and retries
 * once it resolves, instead of firing five parallel refresh calls (which
 * would race and could invalidate each other's rotated refresh token —
 * see the reuse-detection logic in the backend's auth.service.js).
 */
let refreshPromise = null;

function onRefreshed(newToken) {
  setAccessToken(newToken);
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post('/auth/refresh-token')
      .then((response) => {
        const newToken = response.data.data.accessToken;
        onRefreshed(newToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh-token');

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient, setAccessToken, getAccessToken, refreshAccessToken };
export default apiClient;
