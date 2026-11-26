// src/hooks/usePoliticasPrevencion.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { politicaPrevencionService } from '../services/politicaPrevencionService';
import api from '../api/axios';

const parseIsVigente = (item) => {
  const rawVal = item.vigente ?? item.estado ?? item.estatus;
  if (typeof rawVal === 'boolean') return rawVal;
  if (typeof rawVal === 'number') return rawVal === 1;
  if (typeof rawVal === 'string') {
    return ['true', '1', 'vigente', 'activo', 'activa'].includes(rawVal.trim().toLowerCase());
  }
  return true;
};

export function usePoliticasPrevencion() {
  const [politicas, setPoliticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPoliticas = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await politicaPrevencionService.getAll(params);
      setPoliticas(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data ||
          err.message ||
          'Error al cargar las políticas de prevención.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoliticas();
  }, [fetchPoliticas]);

  const createPolitica = async (payload) => {
    try {
      const created = await politicaPrevencionService.create(payload);
      await fetchPoliticas();
      return { success: true, data: created };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const updatePolitica = async (id, payload) => {
    try {
      const updated = await politicaPrevencionService.update(id, payload);
      await fetchPoliticas();
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const deletePolitica = async (id) => {
    try {
      await politicaPrevencionService.remove(id);
      setPoliticas((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const normalizedPoliticas = useMemo(() => {
    const serverOrigin = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

    return politicas.map((item) => {
      const title = String(item.titulo || item.nombre || `Política #${item.id}`);
      const workplace =
        typeof item.centro_trabajo === 'object' && item.centro_trabajo !== null
          ? String(item.centro_trabajo.nombre || `Sede #${item.centro_trabajo.id}`)
          : String(
              item.centro_trabajo_nombre ||
                (item.centro_trabajo ? `Sede #${item.centro_trabajo}` : 'Todas las sedes')
            );

      const company =
        typeof item.centro_trabajo === 'object' &&
        item.centro_trabajo !== null &&
        typeof item.centro_trabajo.empresa === 'object'
          ? String(item.centro_trabajo.empresa?.nombre || workplace)
          : String(item.empresa_nombre || workplace);

      const effectiveDate = String(
        item.fecha_vigencia || item.fecha_publicacion || item.fecha_inicio || 'Sin fecha'
      );
      const reviewDate = String(
        item.fecha_revision || item.fecha_vencimiento || 'Revisión anual'
      );

      const isVigente = parseIsVigente(item);
      const rawPdf =
        item.archivo_pdf || item.documento_pdf || item.pdf_file || item.archivo || item.url_documento || '';

      const fileUrl =
        typeof rawPdf === 'string' && rawPdf
          ? rawPdf.startsWith('http')
            ? rawPdf
            : `${serverOrigin}${rawPdf.startsWith('/') ? '' : '/'}${rawPdf}`
          : '';

      return {
        raw: item,
        id: item.id,
        title,
        descripcion: String(item.contenido_texto || item.descripcion || item.contenido || ''),
        company,
        workplace,
        version: String(item.version || 'v1.0'),
        effectiveDate,
        reviewDate,
        status: isVigente ? 'vigente' : 'por_revisar',
        fileUrl,
      };
    });
  }, [politicas]);

  return {
    politicas,
    normalizedPoliticas,
    loading,
    error,
    createPolitica,
    updatePolitica,
    deletePolitica,
    refetch: fetchPoliticas,
  };
}