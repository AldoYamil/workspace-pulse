// src/hooks/useAlertas.js
import { useState, useEffect, useCallback } from 'react';
import { alertaService } from '../services/alertaService';

export function useAlertas() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener todas las alertas de clima
  const fetchAlertas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await alertaService.getAll();
      // Soporta respuestas paginadas de DRF ({ results: [...] }) o arreglos directos
      setAlertas(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setError(err.response?.data || err.message || 'Error al cargar las alertas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlertas();
  }, [fetchAlertas]);

  // Obtener detalle de una alerta por ID
  const getAlertaById = async (id) => {
    try {
      const data = await alertaService.getById(id);
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Error al obtener detalle de la alerta',
      };
    }
  };

  const ejecutarEvaluacion = async (opciones = {}) => {
    try {
      const resumen = await alertaService.evaluarUmbrales(opciones);
      await fetchAlertas();
      return { success: true, data: resumen };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Error al evaluar umbrales',
      };
    }
  };

  // Crear nueva alerta
  const createAlerta = async (nuevaAlerta) => {
    try {
      const created = await alertaService.create(nuevaAlerta);
      await fetchAlertas(); // Recarga la lista actualizada desde el backend
      return { success: true, data: created };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Error al crear la alerta',
      };
    }
  };

  // Actualizar alerta existente
  const updateAlerta = async (id, datosActualizados) => {
    try {
      const updated = await alertaService.update(id, datosActualizados);
      await fetchAlertas();
      return { success: true, data: updated };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Error al actualizar la alerta',
      };
    }
  };

  // Eliminar alerta
  const deleteAlerta = async (id) => {
    try {
      await alertaService.delete(id);
      setAlertas((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Error al eliminar la alerta',
      };
    }
  };

  return {
    alertas,
    loading,
    error,
    fetchAlertas,
    getAlertaById,
    createAlerta,
    updateAlerta,
    deleteAlerta,
  };
}