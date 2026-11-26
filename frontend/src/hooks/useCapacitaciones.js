// src/hooks/useCapacitaciones.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { capacitacionService } from '../services/capacitacionService';

export const normalizeCapacitacionStatus = (rawStatus) => {
  const val = (rawStatus || '').toString().toLowerCase();
  if (['completed', 'completado', 'completada', 'realizado', 'realizada', 'finalizado'].includes(val)) {
    return 'completed';
  }
  if (['cancelled', 'cancelado', 'cancelada'].includes(val)) {
    return 'cancelled';
  }
  return 'scheduled';
};

export function useCapacitaciones() {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCapacitaciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await capacitacionService.getAll();
      setCapacitaciones(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data ||
          err.message ||
          'Error al cargar las capacitaciones.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCapacitaciones();
  }, [fetchCapacitaciones]);

  const createCapacitacion = async (payload) => {
    try {
      const created = await capacitacionService.create(payload);
      await fetchCapacitaciones();
      return { success: true, data: created };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const updateCapacitacion = async (id, payload) => {
    try {
      const updated = await capacitacionService.update(id, payload);
      await fetchCapacitaciones();
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const deleteCapacitacion = async (id) => {
    try {
      await capacitacionService.remove(id);
      setCapacitaciones((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const normalizedCapacitaciones = useMemo(() => {
    return capacitaciones.map((item) => {
      const title = item.nombre_taller || item.titulo || item.nombre || `Capacitación #${item.id}`;
      const instructor = item.instructor || item.facilitador || item.expositor || 'Por asignar';
      const date = item.fecha_taller || item.fecha || item.fecha_programada || 'Sin fecha';
      const horas = Number(item.horas_duracion ?? item.duracion ?? 0);
      const attendees = Number(item.asistentes ?? item.num_asistentes ?? 0);
      const totalAssigned = Number(item.total_asignados ?? item.cupo ?? 0);
      const status = normalizeCapacitacionStatus(item.estado || item.estatus || item.status);

      const type =
        typeof item.planeacion === 'object' && item.planeacion !== null
          ? item.planeacion.titulo
          : item.tipo || (item.planeacion ? `Plan #${item.planeacion}` : 'NOM-035 Preventivo');

      const centroNombre =
        typeof item.centro_trabajo === 'object' && item.centro_trabajo !== null
          ? item.centro_trabajo.nombre
          : '';

      const evidenceAvailable = Boolean(
        item.evidencia_url || item.evidencia || item.constancia || status === 'completed'
      );

      return {
        raw: item,
        id: item.id,
        title,
        type,
        centroNombre,
        date,
        horas,
        instructor,
        attendees,
        totalAssigned: totalAssigned > 0 ? totalAssigned : Math.max(attendees, 1),
        status,
        evidenceAvailable,
      };
    });
  }, [capacitaciones]);

  const stats = useMemo(() => {
    const completadas = normalizedCapacitaciones.filter((t) => t.status === 'completed').length;
    const programadas = normalizedCapacitaciones.filter((t) => t.status === 'scheduled').length;

    const conCupo = normalizedCapacitaciones.filter(
      (t) => t.totalAssigned > 0 && t.status === 'completed'
    );
    const promedioAsistencia =
      conCupo.length > 0
        ? Math.round(
            conCupo.reduce(
              (acc, t) => acc + Math.min(100, (t.attendees / t.totalAssigned) * 100),
              0
            ) / conCupo.length
          )
        : 0;

    return { completadas, programadas, promedioAsistencia };
  }, [normalizedCapacitaciones]);

  return {
    capacitaciones,
    normalizedCapacitaciones,
    stats,
    loading,
    error,
    createCapacitacion,
    updateCapacitacion,
    deleteCapacitacion,
    refetch: fetchCapacitaciones,
  };
}