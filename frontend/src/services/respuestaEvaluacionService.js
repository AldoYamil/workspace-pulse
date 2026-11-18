// src/services/respuestaEvaluacionService.js
import api from '../api/axios';

export const respuestaEvaluacionService = {

  create: async (payload) => {
    const { data } = await api.post('v1/respuesta/create/', payload);
    return data;
  },

  list: async (campanaId, areaId) => {
    const { data } = await api.get(`v1/respuesta/list/${campanaId}/${areaId}`);
    return data;
  },

  detail: async (campanaId, areaId) => {
    const { data } = await api.get(`v1/respuesta/detail/${campanaId}/${areaId}`);
    return data;
  },

  getEncuestaPublica: async ({ token, campana, area } = {}) => {
    const { data } = await api.get('v1/encuesta-publica/', {
      params: {
        token: token || undefined,
        campana: campana || undefined,
        area: area || undefined,
      },
    });
    return data;
  },

  responderEncuestaPublica: async (payload) => {
    const { data } = await api.post('v1/encuesta-publica/responder/', payload);
    return data;
  },
};