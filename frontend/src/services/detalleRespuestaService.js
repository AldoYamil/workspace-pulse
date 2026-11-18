// src/services/detalleRespuestaService.js
import api from '../api/axios';

export const detalleRespuestaervice = {
  // GET: Listar todos los detalles de la respuesta
  getAll: async () => {
    const response = await api.get('v1/respuesta/list/');
    return response.data;
  },

  // GET: Obtener detalle por ID
  getById: async (id) => {
    const response = await api.get(`v1/respuesta/detail/${id}`);
    return response.data;
  },

  // POST: Crear nuevo detalle
  create: async (data) => {
    const response = await api.post('v1/respuesta/create/', data);
    return response.data;
  },
};