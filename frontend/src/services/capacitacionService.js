// src/services/capacitacionService.js
import api from '../api/axios';

const BASE_PATH = 'v1/capacitacion';

export const capacitacionService = {
  getAll: async () => {
    const response = await api.get(`${BASE_PATH}/list/`);
    return Array.isArray(response.data) ? response.data : response.data?.results || [];
  },

  getById: async (id) => {
    const response = await api.get(`${BASE_PATH}/detail/${id}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post(`${BASE_PATH}/create/`, payload);
    return response.data;
  },

  update: async (id, payload) => {
    try {
      const response = await api.patch(`${BASE_PATH}/update/${id}`, payload);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const response = await api.patch(`${BASE_PATH}/update/${id}/`, payload);
        return response.data;
      }
      throw err;
    }
  },

  remove: async (id) => {
    try {
      const response = await api.delete(`${BASE_PATH}/delete/${id}`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const response = await api.delete(`${BASE_PATH}/delete/${id}/`);
        return response.data;
      }
      throw err;
    }
  },
};