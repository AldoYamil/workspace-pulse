// src/services/alertaService.js
import api from '../api/axios';

export const alertaService = {
    // GET: Listar todos las alerta-clima de la empresa
  getAll: async () => {
    const response = await api.get('v1/alerta-clima/list/');
    return response.data;
  },

  // GET: Obtener detalle por ID
  getById: async (id) => {
    const response = await api.get(`v1/alerta-clima/detail/${id}`);
    return response.data;
  },

  // POST: Crear nuevo alerta-clima
  create: async (data) => {
    const response = await api.post('v1/alerta-clima/create/', data);
    return response.data;
  },

  // PUT: Actualizar alerta-clima existente
  update: async (id, data) => {
    const response = await api.put(`v1/alerta-clima/update/${id}`, data);
    return response.data;
  },

  // DELETE: Eliminar alerta-clima
  delete: async (id) => {
    const response = await api.delete(`v1/alerta-clima/delete/${id}`);
    return response.data;
  },
}