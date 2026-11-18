// src/hooks/usePregunta.js
import { useState, useEffect, useCallback } from 'react';
import { preguntaService } from '../services/preguntaService';

export const usePregunta  = () => {
  const [pregunta, setPregunta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPregunta = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await preguntaService.getAll();
      setGuia(data);
    } catch (err) {
      console.error("Error cargando las preguntas:", err);
      setError(err.response?.data || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPregunta = async (newCentroData) => {
    try {
      const created = await preguntaService.create(newCentroData);
      await fetchPregunta();
      return { success: true, data: created };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  const deletePregunta = async (id) => {
    try {
      await preguntaService.delete(id);
      setPregunta((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  useEffect(() => {
    fetchPregunta();
  }, [fetchPregunta]);

  return {
    pregunta,
    loading,
    error,
    refetch: fetchPregunta,
    createPregunta,
    deletePregunta,
  };
};