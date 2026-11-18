// src/hooks/useArea.js
import { useState, useEffect, useCallback } from 'react';
import { areaService } from '../services/areaService';

export const useAreas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAreas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await areaService.getAll();
      setAreas(data);
    } catch (err) {
      console.error("Error cargando areas:", err);
      setError(err.response?.data || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createArea = async (newCentroData) => {
    try {
      const created = await areaService.create(newCentroData);
      await fetchAreas();
      return { success: true, data: created };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  const deleteArea = async (id) => {
    try {
      await areaService.delete(id);
      setAreas((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  return {
    areas,
    loading,
    error,
    refetch: fetchAreas,
    createArea,
    deleteArea,
  };
};