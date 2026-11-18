// src/services/preguntaServices.js
import api from '../api/axios';

export const preguntaService = {
  // GET: Listar todos las preguntas disponibles
  getAll: async () => {
    const response = await api.get('v1/pregunta/list/');
    return response.data;
  },

  // GET: Obtener detalle por ID
  getById: async (id) => {
    const response = await api.get(`v1/pregunta/detail/${id}`);
    return response.data;
  },

  // POST: Crear nueva pregunta
  create: async (data) => {
    const response = await api.post('v1/pregunta/create/', data);
    return response.data;
  },

  // PUT: Actualizar pregunta existente
  update: async (id, data) => {
    const response = await api.put(`v1/pregunta/update/${id}`, data);
    return response.data;
  },

  // DELETE: Eliminar pregunta
  delete: async (id) => {
    const response = await api.delete(`v1/pregunta/delete/${id}`);
    return response.data;
  },
};