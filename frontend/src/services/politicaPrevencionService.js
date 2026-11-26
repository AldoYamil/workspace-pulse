// src/services/politicaPrevencionService.js
import api from '../api/axios';

export const politicaPrevencionService = {
  getAll: async (params = {}) => {
    const response = await api.get('v1/politicaprevencion/list/', { params });
    return Array.isArray(response.data) ? response.data : response.data?.results || [];
  },

  getById: async (id) => {
    const response = await api.get(`v1/politica_prevencion/detail/${id}/`);
    return response.data;
  },

  create: async (payload) => {
    const isFormData = payload instanceof FormData;
    const response = await api.post(
      'v1/politica_prevencion/create/',
      payload,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
    );
    return response.data;
  },

  update: async (id, payload) => {
    const isFormData = payload instanceof FormData;
    const response = await api.patch(
      `v1/politica_prevencion/update/${id}/`,
      payload,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
    );
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`v1/politica_prevencion/delete/${id}/`);
    return response.data;
  },
};