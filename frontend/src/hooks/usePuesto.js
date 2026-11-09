// src/hooks/usePuesto.js
import { useState, useEffect, useCallback } from 'react';
import { puestoService } from '../services/puestoService';

export const usePuesto = () => {
  const [puestos, setPuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPuestos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await puestoService.getAll();
      setPuestos(data);
    } catch (err) {
      console.error("Error cargando puestos:", err);
      setError(err.response?.data || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPuesto = async (newCentroData) => {
    try {
      const created = await puestoService.create(newCentroData);
      await fetchPuestos();
      return { success: true, data: created };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  const deletePuesto = async (id) => {
    try {
      await puestoService.delete(id);
      setPuestos((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  useEffect(() => {
    fetchPuestos();
  }, [fetchPuestos]);

  return {
    puestos,
    loading,
    error,
    refetch: fetchCentros,
    createPuesto,
    deletePuesto,
  };
};