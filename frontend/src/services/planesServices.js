// src/services/planesService.js
import api from '../api/axios';

export const planesService = {
  // GET: Listar todos los planes de acción de la empresa
  getAll: async (params = {}) => {
    const response = await api.get('v1/planes-accion/', { params });
    return response.data;
  },

  // POST: Crear nuevo plan de acción (o disparar generación según la vista)
  create: async (data) => {
    const response = await api.post('v1/planes-accion/', data);
    return response.data;
  },

  // GET: Obtener detalle de un plan por ID (<int:pk>)
  getById: async (id) => {
    const response = await api.get(`v1/planes-accion/${id}/`);
    return response.data;
  },

  // GET / POST: Recomendaciones (catálogo o generación con IA / Groq)
  getRecomendaciones: async (params = {}) => {
    const response = await api.get('v1/planes-accion/recomendaciones/', { params });
    return response.data;
  },

  generarRecomendaciones: async (data) => {
    const response = await api.post('v1/planes-accion/recomendaciones/', data);
    return response.data;
  },

  // GET: Áreas disponibles vinculadas a planes de acción
  getAreas: async () => {
    const response = await api.get('v1/planes-accion/areas/');
    return response.data;
  },
};