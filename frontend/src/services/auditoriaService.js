// src/services/bitacoraService.js
import api from '../api/axios';

export const bitacoraService = {
    // GET: Listar todos las bitacora de la empresa
  getAll: async () => {
    const response = await api.get('v1/bitacora/list/');
    return response.data;
  },

  // GET: Obtener detalle por ID
  getById: async (id) => {
    const response = await api.get(`v1/bitacora/detail/${id}`);
    return response.data;
  },

  // POST: Crear nuevo bitacora
  create: async (data) => {
    const response = await api.post('v1/bitacora/create/', data);
    return response.data;
  },
}