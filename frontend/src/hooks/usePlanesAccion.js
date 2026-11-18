// frontend/src/hooks/usePlanesAccion.js
import { useState, useEffect, useCallback } from 'react';
import planesService from '../services/planesService';

export const usePlanesAccion = (autoFetch = true) => {
  const [planes, setPlanes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingIA, setLoadingIA] = useState(false);
  const [error, setError] = useState(null);

  // Cargar planes de acción y áreas disponibles
  const fetchPlanes = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await planesService.getAll(filtros);
      const lista = Array.isArray(data) ? data : data.results || data.planes || [];
      setPlanes(lista);
      return { success: true, data: lista };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error al cargar los planes de acción';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAreas = useCallback(async () => {
    try {
      const data = await planesService.getAreas();
      const lista = Array.isArray(data) ? data : data.results || data.areas || [];
      setAreas(lista);
      return { success: true, data: lista };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchPlanes();
      fetchAreas();
    }
  }, [autoFetch, fetchPlanes, fetchAreas]);

  // Crear nuevo plan (manual o a partir de una recomendación de Groq)
  const crearPlan = async (nuevoPlan) => {
    try {
      const creado = await planesService.create(nuevoPlan);
      setPlanes((prev) => [creado, ...prev]);
      return { success: true, data: creado };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Error al crear el plan de acción',
      };
    }
  };

  // Actualizar plan (avance %, estado, fecha, responsable)
  const actualizarPlan = async (id, cambios) => {
    try {
      const actualizado = await planesService.update(id, cambios);
      setPlanes((prev) =>
        prev.map((plan) => (plan.id === id ? { ...plan, ...actualizado } : plan))
      );
      return { success: true, data: actualizado };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Error al actualizar el plan',
      };
    }
  };

  // Eliminar plan
  const eliminarPlan = async (id) => {
    try {
      await planesService.delete(id);
      setPlanes((prev) => prev.filter((plan) => plan.id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Error al eliminar el plan',
      };
    }
  };

  // Obtener sugerencias de IA (Groq) o catálogo de respaldo para un área
  const obtenerRecomendaciones = async ({ area_id, campana_id, usar_ia = true }) => {
    setLoadingIA(true);
    setError(null);
    try {
      const data = await planesService.generarRecomendaciones({
        area_id,
        campana_id,
        usar_ia,
      });
      const lista = Array.isArray(data) ? data : data.recomendaciones || [];
      setRecomendaciones(lista);
      return { success: true, data: lista, origen: data.origen || 'ia' };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'No se pudieron generar recomendaciones en este momento';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoadingIA(false);
    }
  };

  return {
    planes,
    areas,
    recomendaciones,
    loading,
    loadingIA,
    error,
    fetchPlanes,
    fetchAreas,
    crearPlan,
    actualizarPlan,
    eliminarPlan,
    obtenerRecomendaciones,
  };
};