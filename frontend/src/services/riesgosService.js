// src/services/riesgosService.js
import api from '../api/axios';

export const riesgosService = {
  // GET /api/v1/panel-riesgos/
  getPanelRiesgos: async (params = {}) => {
    const { data } = await api.get('v1/panel-riesgos/', {
      params: {
        campana: params.campana || undefined,
        area: params.area || undefined,
        centro: params.centro || undefined,
        meses: params.meses || undefined,
      },
    });
    return data;
  },

  // POST /api/v1/resultado-riesgo/create/
  createResultadoRiesgo: async (payload) => {
    const { data } = await api.post('v1/resultado-riesgo/create/', payload);
    return data;
  },

  // GET /api/v1/resultado-riesgo/list-by-campana/
  listByCampana: async (campanaId) => {
    const { data } = await api.get(`v1/resultado-riesgo/list-by-campana/${campanaId}/`);
    return data;
  },

  // GET /api/v1/resultado-riesgo/list-by-area-campana/
  listByAreaCampana: async (campanaId, areaId) => {
    const { data } = await api.get(`v1/resultado-riesgo/list-by-area-campana/${campanaId}/${areaId}/`);
    return data;
  },
};