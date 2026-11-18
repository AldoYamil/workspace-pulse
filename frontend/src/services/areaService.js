// src/services/areaService.js
import api from '../api/axios';

export const areaService = {
    // GET: Listar todos las areas de trabajo de la empresa
  getAll: async () => {
    const response = await api.get('v1/area/list/');
    return response.data;
  },

  // GET: Obtener detalle por ID
  getById: async (id) => {
    const response = await api.get(`v1/area/detail/${id}`);
    return response.data;
  },

  // POST: Crear nuevo area de trabajo
  create: async (data) => {
    const response = await api.post('v1/area/create/', data);
    return response.data;
  },

  // PUT: Actualizar area de trabajo existente
  update: async (id, data) => {
    const response = await api.put(`v1/area/update/${id}`, data);
    return response.data;
  },

  // DELETE: Eliminar area de trabajo
  delete: async (id) => {
    const response = await api.delete(`v1/area/delete/${id}`);
    return response.data;
  },
}