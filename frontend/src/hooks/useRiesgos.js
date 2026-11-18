// src/hooks/useRiesgos.js
import { useState, useEffect, useCallback } from 'react';
import { riesgosService } from '../services/riesgosService';

export function useRiesgos({ campanaId = null, areaId = null, centroId = null, meses = null, autoFetch = true } = {}) {
  const [panelData, setPanelData] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carga el resumen general de PanelRiesgosView
  const fetchPanelRiesgos = useCallback(
    async (filtros = {}) => {
      try {
        setLoading(true);
        setError(null);
        const data = await riesgosService.getPanelRiesgos({
          campana: filtros.campana ?? campanaId,
          area: filtros.area ?? areaId,
          centro: filtros.centro ?? centroId,
          meses: filtros.meses ?? meses,
        });
        setPanelData(data);
        return { success: true, data };
      } catch (err) {
        const msg = err.response?.data || err.message;
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [campanaId, areaId, centroId, meses]
  );

  // Carga resultados por campaña o por campaña + área
  const fetchResultados = useCallback(
    async (cId = campanaId, aId = areaId) => {
      if (!cId) {
        setResultados([]);
        return [];
      }
      try {
        setLoading(true);
        setError(null);
        const data = aId
          ? await riesgosService.listByAreaCampana(cId, aId)
          : await riesgosService.listByCampana(cId);

        const lista = Array.isArray(data) ? data : data?.results || [];
        setResultados(lista);
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
    if (!autoFetch) return;
    fetchPanelRiesgos();
  }, [autoFetch, fetchPanelRiesgos]);

  useEffect(() => {
    if (!autoFetch || !campanaId) return;
    fetchResultados(campanaId, areaId);
  }, [autoFetch, campanaId, areaId, fetchResultados]);

  const createResultadoRiesgo = async (payload) => {
    try {
      const data = await riesgosService.createResultadoRiesgo(payload);
      const targetCampana = payload.campana || payload.campana_evaluacion || campanaId;
      const targetArea = payload.area || areaId;
      if (targetCampana) {
        await fetchResultados(targetCampana, targetArea);
      }
      await fetchPanelRiesgos();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  return {
    panelData,
    resultados,
    loading,
    error,
    fetchPanelRiesgos,
    fetchResultados,
    createResultadoRiesgo,
  };
}