// src/services/puestoService.js
import api from '../api/axios';

export const puestoService = {
    // GET: Listar todos las puestos de trabajo de la empresa
  getAll: async () => {
    const response = await api.get('v1/puesto/list/');
    return response.data;
  },

  // GET: Obtener detalle por ID
  getById: async (id) => {
    const response = await api.get(`v1/puesto/detail/${id}`);
    return response.data;
  },

  // POST: Crear nuevo puesto de trabajo
  create: async (data) => {
    const response = await api.post('v1/puesto/create/', data);
    return response.data;
  },

  // PUT: Actualizar puesto de trabajo existente
  update: async (id, data) => {
    const response = await api.put(`v1/puesto/update/${id}`, data);
    return response.data;
  },

  // DELETE: Eliminar puesto de trabajo
  delete: async (id) => {
    const response = await api.delete(`v1/puesto/delete/${id}`);
    return response.data;
  },
}