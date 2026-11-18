// src/hooks/useEncuesta.js
import { useState, useEffect, useCallback } from 'react';
import { encuestaService } from '../services/encuestaService';

export function useEncuesta({ guiaId = null, centroId = null, autoFetchGuias = true } = {}) {
  const [guias, setGuias] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [campanas, setCampanas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGuias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await encuestaService.listGuias();
      const lista = Array.isArray(data) ? data : data?.results || [];
      setGuias(lista);
      return lista;
    } catch (err) {
      setError(err.response?.data || err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createGuia = async (payload) => {
    try {
      const data = await encuestaService.createGuia(payload);
      await fetchGuias();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const updateGuia = async (id, payload, method = 'put') => {
    try {
      const data = await encuestaService.updateGuia(id, payload, method);
      await fetchGuias();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const deleteGuia = async (id) => {
    try {
      await encuestaService.deleteGuia(id);
      await fetchGuias();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  // --- PREGUNTAS POR GUÍA ---
  const fetchPreguntas = useCallback(
    async (gId = guiaId) => {
      if (!gId) {
        setPreguntas([]);
        return [];
      }
      try {
        setLoading(true);
        setError(null);
        const data = await encuestaService.listPreguntasByGuia(gId);
        const lista = Array.isArray(data) ? data : data?.results || [];
        setPreguntas(lista);
        return lista;
      } catch (err) {
        setError(err.response?.data || err.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [guiaId]
  );

  const createPregunta = async (payload) => {
    try {
      const data = await encuestaService.createPregunta(payload);
      const targetGuia = payload.guia_referencia || payload.guia_id || guiaId;
      if (targetGuia) await fetchPreguntas(targetGuia);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const updatePregunta = async (id, payload, method = 'put') => {
    try {
      const data = await encuestaService.updatePregunta(id, payload, method);
      if (guiaId) await fetchPreguntas(guiaId);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const deletePregunta = async (id) => {
    try {
      await encuestaService.deletePregunta(id);
      if (guiaId) await fetchPreguntas(guiaId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  // --- CAMPAÑAS ---
  const fetchCampanas = useCallback(
    async (gId = guiaId, cId = centroId) => {
      if (!gId || !cId) {
        setCampanas([]);
        return [];
      }
      try {
        setLoading(true);
        setError(null);
        const data = await encuestaService.listCampanas(gId, cId);
        const lista = Array.isArray(data) ? data : data?.results || [];
        setCampanas(lista);
        return lista;
      } catch (err) {
        setError(err.response?.data || err.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [guiaId, centroId]
  );

  useEffect(() => {
    if (autoFetchGuias) fetchGuias();
  }, [autoFetchGuias, fetchGuias]);

  useEffect(() => {
    if (guiaId) fetchPreguntas(guiaId);
  }, [guiaId, fetchPreguntas]);

  useEffect(() => {
    if (guiaId && centroId) fetchCampanas(guiaId, centroId);
  }, [guiaId, centroId, fetchCampanas]);

  return {
    guias,
    preguntas,
    campanas,
    loading,
    error,
    fetchGuias,
    createGuia,
    updateGuia,
    deleteGuia,
    fetchPreguntas,
    createPregunta,
    updatePregunta,
    deletePregunta,
    fetchCampanas,
  };
}