import { useState, useEffect, useCallback } from 'react';
import { usuarioService } from '../services/usuarioService';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch (err) {
      setError(err.response?.data || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUsuario = async (newUsuarioData) => {
    try {
      const created = await usuarioService.create(newUsuarioData);
      await fetchUsuarios();
      return { success: true, data: created };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  const deleteUsuario = async (id) => {
    try {
      await usuarioService.delete(id);
      setUsuarios((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return { usuarios, loading, error, refetch: fetchUsuarios, createUsuario, deleteUsuario };
};