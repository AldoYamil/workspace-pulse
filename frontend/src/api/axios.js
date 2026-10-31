
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agrega el token de Supabase a las peticiones del backend.
api.interceptors.request.use(async (config) => {
  if (!supabase) return config;

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return Promise.reject(error);
  }

  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
