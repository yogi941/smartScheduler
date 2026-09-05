import apiClient from './client';

export function createResourceApi(endpoint) {
  return {
    async list(params = {}) {
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    },

    async getById(id) {
      const response = await apiClient.get(`${endpoint}/${id}`);
      return response.data.data;
    },

    async create(data) {
      const response = await apiClient.post(endpoint, data);
      return response.data.data;
    },

    async update(id, updates) {
      const response = await apiClient.patch(`${endpoint}/${id}`, updates);
      return response.data.data;
    },

    async remove(id) {
      const response = await apiClient.delete(`${endpoint}/${id}`);
      return response.data;
    },
  };
}
