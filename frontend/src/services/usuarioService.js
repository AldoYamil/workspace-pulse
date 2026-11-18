import api from '../api/axios';

export const usuarioService = {
  getAll: async () => {
    const response = await api.get('v1/usuario/list/');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('v1/usuario/create/', data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`v1/usuario/delete/${id}`);
    return response.data;
  },
};