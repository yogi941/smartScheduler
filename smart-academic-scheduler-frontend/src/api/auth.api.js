import apiClient from './client';

export async function login(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data.data;
}

export async function register(payload) {
  const response = await apiClient.post('/auth/register', payload);
  return response.data.data;
}

export async function refreshToken() {
  const response = await apiClient.post('/auth/refresh-token');
  return response.data.data;
}

export async function logout() {
  const response = await apiClient.post('/auth/logout');
  return response.data;
}

export async function getMe() {
  const response = await apiClient.get('/auth/me');
  return response.data.data;
}
