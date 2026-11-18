// src/hooks/useRespuestaEvaluacion.js
import { useState, useEffect, useCallback } from 'react';
import { respuestaEvaluacionService } from '../services/respuestaEvaluacionService';

export function useRespuestaEvaluacion(campanaId = null, areaId = null) {
  const [respuestas, setRespuestas] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRespuestas = useCallback(
    async (cId = campanaId, aId = areaId) => {
      if (!cId || !aId) {
        setRespuestas([]);
        return [];
      }
      try {
        setLoading(true);
        setError(null);
        const data = await respuestaEvaluacionService.list(cId, aId);
        const lista = Array.isArray(data) ? data : data?.results || [];
        setRespuestas(lista);
        return lista;
      } catch (err) {
        const msg = err.response?.data || err.message;
        setError(msg);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [campanaId, areaId]
  );

  useEffect(() => {
    if (campanaId && areaId) {
      fetchRespuestas(campanaId, areaId);
    }
  }, [campanaId, areaId, fetchRespuestas]);

  const getDetalleRespuesta = async (cId = campanaId, aId = areaId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await respuestaEvaluacionService.detail(cId, aId);
      setDetalle(data);
      return { success: true, data };
    } catch (err) {
      const msg = err.response?.data || err.message;
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const createRespuesta = async (payload) => {
    try {
      const data = await respuestaEvaluacionService.create(payload);
      if (campanaId && areaId) {
        await fetchRespuestas(campanaId, areaId);
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const getEncuestaPublica = async (params) => {
    try {
      const data = await respuestaEvaluacionService.getEncuestaPublica(params);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const responderEncuestaPublica = async (payload) => {
    try {
      const data = await respuestaEvaluacionService.responderEncuestaPublica(payload);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  return {
    respuestas,
    detalle,
    loading,
    error,
    fetchRespuestas,
    getDetalleRespuesta,
    createRespuesta,
    getEncuestaPublica,
    responderEncuestaPublica,
  };
}