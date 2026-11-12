// src/services/touchpointService.js
import api from '../api/axios';

export const touchpointService = {
    // GET: Listar todos las touchpoint de la empresa
  getAll: async () => {
    const response = await api.get('v1/touchpoint/list/');
    return response.data;
  },

  // GET: Obtener detalle por ID
  getById: async (id) => {
    const response = await api.get(`v1/touchpoint/detail/${id}`);
    return response.data;
  },

  // POST: Crear nuevo touchpoint
  create: async (data) => {
    const response = await api.post('v1/touchpoint/create/', data);
    return response.data;
  },

  // PUT: Actualizar touchpoint existente
  update: async (id, data) => {
    const response = await api.put(`v1/touchpoint/update/${id}`, data);
    return response.data;
  },

  // DELETE: Eliminar touchpoint
  delete: async (id) => {
    const response = await api.delete(`v1/touchpoint/delete/${id}`);
    return response.data;
  },
}