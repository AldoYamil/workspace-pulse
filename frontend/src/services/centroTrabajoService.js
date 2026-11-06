// src/services/centroTrabajoService.js
import api from '../api/axios';

export const centroTrabajoService = {
  // GET: Listar todos los centros de trabajo de la empresa
  getAll: async () => {
    const response = await api.get('v1/centrotrabajo/list/');
    return response.data;
  },

  // GET: Obtener detalle por ID
  getById: async (id) => {
    const response = await api.get(`v1/centrotrabajo/detail/${id}`);
    return response.data;
  },

  // POST: Crear nuevo centro de trabajo
  create: async (data) => {
    const response = await api.post('v1/centrotrabajo/create/', data);
    return response.data;
  },

  // PUT: Actualizar centro de trabajo existente
  update: async (id, data) => {
    const response = await api.put(`v1/centrotrabajo/update/${id}`, data);
    return response.data;
  },

  // DELETE: Eliminar centro de trabajo
  delete: async (id) => {
    const response = await api.delete(`v1/centrotrabajo/delete/${id}`);
    return response.data;
  },
};