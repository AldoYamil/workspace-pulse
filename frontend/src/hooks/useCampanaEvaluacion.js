// src/hooks/useCampanaEvaluacion.js
import { useState, useEffect, useCallback } from 'react';
import { campanaEvaluacionService } from '../services/campanaEvaluacionService';

export function useCampanaEvaluacion(guiaId = null, centroId = null) {
  const [campanas, setCampanas] = useState([]);
  const [campanaDetalle, setCampanaDetalle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCampanas = useCallback(
    async (gId = guiaId, cId = centroId) => {
      if (!gId || !cId) {
        setCampanas([]);
        return [];
      }
      try {
        setLoading(true);
        setError(null);
        const data = await campanaEvaluacionService.list(gId, cId);
        const lista = Array.isArray(data) ? data : data?.results || [];
        setCampanas(lista);
        return lista;
      } catch (err) {
        const msg = err.response?.data || err.message;
        setError(msg);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [guiaId, centroId]
  );

  useEffect(() => {
    if (guiaId && centroId) {
      fetchCampanas(guiaId, centroId);
    }
  }, [guiaId, centroId, fetchCampanas]);

  const getCampanaDetail = async (gId = guiaId, cId = centroId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await campanaEvaluacionService.detail(gId, cId);
      setCampanaDetalle(data);
      return { success: true, data };
    } catch (err) {
      const msg = err.response?.data || err.message;
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const createCampana = async (payload) => {
    try {
      const data = await campanaEvaluacionService.create(payload);
      const targetGuia = payload.guia_referencia || payload.guia_id || guiaId;
      const targetCentro = payload.centro_trabajo || payload.centro_id || centroId;
      if (targetGuia && targetCentro) {
        await fetchCampanas(targetGuia, targetCentro);
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const updateCampana = async (gId, cId, payload, method = 'put') => {
    try {
      const data = await campanaEvaluacionService.update(gId, cId, payload, method);
      await fetchCampanas(gId, cId);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const deleteCampana = async (gId, cId) => {
    try {
      await campanaEvaluacionService.remove(gId, cId);
      await fetchCampanas(gId, cId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  return {
    campanas,
    campanaDetalle,
    loading,
    error,
    fetchCampanas,
    getCampanaDetail,
    createCampana,
    updateCampana,
    deleteCampana,
  };
}