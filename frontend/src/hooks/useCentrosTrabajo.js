// src/hooks/useCentrosTrabajo.js
import { useState, useEffect, useCallback } from 'react';
import { centroTrabajoService } from '../services/centroTrabajoService';

export const useCentrosTrabajo = () => {
  const [centros, setCentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCentros = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await centroTrabajoService.getAll();
      setCentros(data);
    } catch (err) {
      console.error("Error cargando centros de trabajo:", err);
      setError(err.response?.data || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCentro = async (newCentroData) => {
    try {
      const created = await centroTrabajoService.create(newCentroData);
      await fetchCentros();
      return { success: true, data: created };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  const deleteCentro = async (id) => {
    try {
      await centroTrabajoService.delete(id);
      setCentros((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  useEffect(() => {
    fetchCentros();
  }, [fetchCentros]);

  return {
    centros,
    loading,
    error,
    refetch: fetchCentros,
    createCentro,
    deleteCentro,
  };
};