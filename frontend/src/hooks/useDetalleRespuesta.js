// src/hooks/useDetalleRespuesta.js
import { useState, useEffect, useCallback } from 'react';
import { centroTrabajoService } from '../services/centroTrabajoService';

export const useDetalleRespuesta = () => {
  const [detalle, setDetalle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetalle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await detalleRespuestaService.getAll();
      setDetalle(data);
    } catch (err) {
      console.error("Error cargando detalles de la respuesta:", err);
      setError(err.response?.data || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDetalle = async (newCentroData) => {
    try {
      const created = await detalleRespuestaService.create(newCentroData);
      await fetchDetalle();
      return { success: true, data: created };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  useEffect(() => {
    fetchDetalle();
  }, [fetchDetalle]);

  return {
    detalle,
    loading,
    error,
    refetch: fetchDetalle,
    createDetalle,
  };
};