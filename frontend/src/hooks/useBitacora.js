// src/hooks/useBitacora.js
import { useState, useEffect, useCallback } from 'react';
import { bitacoraService } from '../services/bitacoraService';

export function useBitacora() {
  const [bitacoras, setBitacoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener todos los registros de la bitácora
  const fetchBitacoras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bitacoraService.getAll();
      setBitacoras(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setError(err.response?.data || err.message || 'Error al cargar la bitácora');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBitacoras();
  }, [fetchBitacoras]);

  // Obtener detalle de un registro de bitácora por ID
  const getBitacoraById = async (id) => {
    try {
      const data = await bitacoraService.getById(id);
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Error al obtener el detalle de la bitácora',
      };
    }
  };

  // Crear nuevo registro en la bitácora
  const createBitacora = async (nuevoRegistro) => {
    try {
      const created = await bitacoraService.create(nuevoRegistro);
      await fetchBitacoras();
      return { success: true, data: created };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || err.message || 'Error al registrar en la bitácora',
      };
    }
  };

  return {
    bitacoras,
    loading,
    error,
    fetchBitacoras,
    getBitacoraById,
    createBitacora,
  };
}