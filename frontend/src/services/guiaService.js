// src/services/guiaServices.js
import api from '../api/axios';

export const guiaService = {
  // GET: Listar todos las guias de referencia disponibles
  getAll: async () => {
    const response = await api.get('v1/guiareferencia/list/');
    return response.data;
  },

  // GET: Obtener detalle por ID
  getById: async (id) => {
    const response = await api.get(`v1/guiareferencia/detail/${id}`);
    return response.data;
  },

  // POST: Crear nueva guia de referencia
  create: async (data) => {
    const response = await api.post('v1/guiareferencia/create/', data);
    return response.data;
  },

  // PUT: Actualizar guia de referencia existente
  update: async (id, data) => {
    const response = await api.put(`v1/guiareferencia/update/${id}`, data);
    return response.data;
  },

  // DELETE: Eliminar guia de referencia
  delete: async (id) => {
    const response = await api.delete(`v1/guiareferencia/delete/${id}`);
    return response.data;
  },
};