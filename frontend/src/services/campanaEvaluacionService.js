// src/services/campanaEvaluacionService.js
import api from '../api/axios';

export const campanaEvaluacionService = {
  // POST /api/v1/campana/create/
  create: async (payload) => {
    const { data } = await api.post('v1/campana/create/', payload);
    return data;
  },

  // GET /api/v1/campana/list/
  list: async (guiaId, centroId) => {
    const { data } = await api.get(`v1/campana/list/${guiaId}/${centroId}`);
    return data;
  },

  // GET /api/v1/campana/detail/
  detail: async (guiaId, centroId) => {
    const { data } = await api.get(`v1/campana/detail/${guiaId}/${centroId}`);
    return data;
  },

  // PUT / PATCH /api/v1/campana/update/
  update: async (guiaId, centroId, payload, method = 'put') => {
    const { data } = await api[method](`v1/campana/update/${guiaId}/${centroId}`, payload);
    return data;
  },

  // DELETE /api/v1/campana/delete/
  remove: async (guiaId, centroId) => {
    const { data } = await api.delete(`v1/campana/delet/${guiaId}/${centroId}`);
    return data;
  },
};