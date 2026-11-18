// src/hooks/useGuiaReferencia.js
import { useState, useEffect, useCallback } from 'react';
import { guiaService } from '../services/guiaService';

export const useGuiaReferencia = () => {
  const [guia, setGuia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGuias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await guiaService.getAll();
      setGuia(data);
    } catch (err) {
      console.error("Error cargando las guias de referencias:", err);
      setError(err.response?.data || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGuia = async (newCentroData) => {
    try {
      const created = await guiaService.create(newCentroData);
      await fetchGuias();
      return { success: true, data: created };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  const deleteGuia = async (id) => {
    try {
      await guiaService.delete(id);
      setCentros((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  useEffect(() => {
    fetchGuias();
  }, [fetchGuias]);

  return {
    guia,
    loading,
    error,
    refetch: fetchGuias,
    createGuia,
    deleteGuia,
  };
};