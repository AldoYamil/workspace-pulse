// src/hooks/useTouchpoints.js
import { useState, useEffect, useCallback } from 'react';
import { touchpointService } from '../services/touchpointService';

export function useTouchpoints() {
  const [touchpoints, setTouchpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener todos los touchpoints de la empresa
  const fetchTouchpoints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await touchpointService.getAll();
      setTouchpoints(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setError(err.response?.data || err.message || 'Error al cargar los touchpoints QR');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTouchpoints();
  }, [fetchTouchpoints]);

  // Obtener detalle de un touchpoint por ID
  const getTouchpointById = async (id) => {
    try {
      const data = await touchpointService.getById(id);
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Error al obtener el detalle del touchpoint',
      };
    }
  };

  // Crear nuevo touchpoint
  const createTouchpoint = async (nuevoTouchpoint) => {
    try {
      const created = await touchpointService.create(nuevoTouchpoint);
      await fetchTouchpoints();
      return { success: true, data: created };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Error al crear el touchpoint',
      };
    }
  };

  // Actualizar touchpoint existente
  const updateTouchpoint = async (id, datosActualizados) => {
    try {
      const updated = await touchpointService.update(id, datosActualizados);
      await fetchTouchpoints();
      return { success: true, data: updated };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Error al actualizar el touchpoint',
      };
    }
  };

  // Eliminar touchpoint
  const deleteTouchpoint = async (id) => {
    try {
      await touchpointService.delete(id);
      setTouchpoints((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Error al eliminar el touchpoint',
      };
    }
  };

  return {
    touchpoints,
    loading,
    error,
    fetchTouchpoints,
    getTouchpointById,
    createTouchpoint,
    updateTouchpoint,
    deleteTouchpoint,
  };
}