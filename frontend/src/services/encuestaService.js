// src/services/encuestaService.js
import api from '../api/axios';

export const encuestaService = {
  createGuia: async (payload) => {
    const { data } = await api.post('v1/guiareferencia/create/', payload);
    return data;
  },

  listGuias: async () => {
    const { data } = await api.get('v1/guiareferencia/list/');
    return data;
  },

  detailGuia: async (id) => {
    const { data } = await api.get(`v1/guiareferencia/detail/${id}`);
    return data;
  },

  updateGuia: async (id, payload, method = 'put') => {
    const { data } = await api[method](`v1/guiareferencia/update/${id}`, payload);
    return data;
  },

  deleteGuia: async (id) => {
    const { data } = await api.delete(`v1/guiareferencia/delet/${id}`);
    return data;
  },

  createPregunta: async (payload) => {
    const { data } = await api.post('v1/pregunta/create/', payload);
    return data;
  },

  listPreguntasByGuia: async (guiaId) => {
    const { data } = await api.get(`v1/pregunta/list/${guiaId}`);
    return data;
  },

  detailPregunta: async (guiaId) => {
    const { data } = await api.get(`v1/pregunta/detail/${guiaId}`);
    return data;
  },

  updatePregunta: async (id, payload, method = 'put') => {
    const { data } = await api[method](`v1/pregunta/update/${id}`, payload);
    return data;
  },

  deletePregunta: async (id) => {
    const { data } = await api.delete(`v1/pregunta/delete/${id}`);
    return data;
  },

  createCampana: async (payload) => {
    const { data } = await api.post('v1/campana/create/', payload);
    return data;
  },

  listCampanas: async (guiaId, centroId) => {
    const { data } = await api.get(`v1/campana/list/${guiaId}/${centroId}`);
    return data;
  },

  detailCampana: async (guiaId, centroId) => {
    const { data } = await api.get(`v1/campana/detail/${guiaId}/${centroId}`);
    return data;
  },

  updateCampana: async (guiaId, centroId, payload, method = 'put') => {
    const { data } = await api[method](`v1/campana/update/${guiaId}/${centroId}`, payload);
    return data;
  },

  deleteCampana: async (guiaId, centroId) => {
    const { data } = await api.delete(`v1/campana/delet/${guiaId}/${centroId}`);
    return data;
  },

  createRespuesta: async (payload) => {
    const { data } = await api.post('v1/respuesta/create/', payload);
    return data;
  },

  listRespuestas: async (campanaId, areaId) => {
    const { data } = await api.get(`v1/respuesta/list/${campanaId}/${areaId}`);
    return data;
  },

  detailRespuesta: async (campanaId, areaId) => {
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