// src/pages/CuestionarioActivo.jsx
import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useEncuesta } from '../hooks/useEncuesta';
import { useCampanaEvaluacion } from '../hooks/useCampanaEvaluacion';
import { useRespuestaEvaluacion } from '../hooks/useRespuestaEvaluacion';
import { useCentrosTrabajo } from '../hooks/useCentrosTrabajo';
import { useAreas } from '../hooks/useAreas';

export default function CuestionarioActivo() {
  // Selectores de contexto (Guía, Centro, Campaña activa y Área)
  const [selectedGuiaId, setSelectedGuiaId] = useState('');
  const [selectedCentroId, setSelectedCentroId] = useState('');
  const [selectedCampanaId, setSelectedCampanaId] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');

  // Hooks reales conectados al backend
  const { centros } = useCentrosTrabajo();
  const { areas } = useAreas();
  const {
    guias,
    preguntas,
    loading: loadingEncuesta,
    error: errorEncuesta,
  } = useEncuesta({
    guiaId: selectedGuiaId || null,
    autoFetchGuias: true,
  });

  const { campanas, loading: loadingCampanas } = useCampanaEvaluacion(
    selectedGuiaId || null,
    selectedCentroId || null
  );

  const { responderEncuestaPublica } = useRespuestaEvaluacion();

  // Opciones de respuesta estándar (Escala Likert NOM-035)
  const opcionesRespuesta = [
    { valor: 1, etiqueta: 'Nunca' },
    { valor: 2, etiqueta: 'Casi nunca' },
    { valor: 3, etiqueta: 'Algunas veces' },
    { valor: 4, etiqueta: 'Casi siempre' },
    { valor: 5, etiqueta: 'Siempre' },
  ];

  const [indiceActual, setIndiceActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Autoseleccionar primera guía y primer centro disponibles
  useEffect(() => {
    if (!selectedGuiaId && guias.length > 0) {
      setSelectedGuiaId(String(guias[0].id));
    }
  }, [guias, selectedGuiaId]);

  useEffect(() => {
    if (!selectedCentroId && centros.length > 0) {
      setSelectedCentroId(String(centros[0].id));
    }
  }, [centros, selectedCentroId]);

  // Autoseleccionar campaña activa (o la primera disponible) cuando cambian guía/centro
  useEffect(() => {
    if (campanas.length > 0) {
      const activa =
        campanas.find((c) => String(c.estado || '').toLowerCase().includes('activ')) ||
        campanas[0];
      setSelectedCampanaId(String(activa.id));
    } else {
      setSelectedCampanaId('');
    }
  }, [campanas]);

  const areasDelCentro = areas.filter((a) => {
    const cId = typeof a.centro_trabajo === 'object' ? a.centro_trabajo?.id : a.centro_trabajo;
    return !selectedCentroId || String(cId) === String(selectedCentroId);
  });

  // Autoseleccionar primera área del centro seleccionado
  useEffect(() => {
    if (areasDelCentro.length > 0) {
      const sigueValida = areasDelCentro.some((a) => String(a.id) === String(selectedAreaId));
      if (!sigueValida) {
        setSelectedAreaId(String(areasDelCentro[0].id));
      }
    } else {
      setSelectedAreaId('');
    }
  }, [selectedCentroId, areas]);

  // Reiniciar avance si cambia la guía seleccionada
  useEffect(() => {
    setIndiceActual(0);
    setRespuestas({});
    setEnviado(false);
    setSubmitError('');
  }, [selectedGuiaId]);

  // Manejar la selección de una opción
  const handleSeleccion = (idPregunta, valor) => {
    setRespuestas((prev) => ({
      ...prev,
      [idPregunta]: valor,
    }));
  };

  // Avanzar a la siguiente pregunta
  const handleSiguiente = () => {
    if (indiceActual < preguntas.length - 1) {
      setIndiceActual(indiceActual + 1);
    }
  };

  // Retroceder a la pregunta anterior
  const handleAnterior = () => {
    if (indiceActual > 0) {
      setIndiceActual(indiceActual - 1);
    }
  };

  // Enviar el cuestionario completo al backend real
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!selectedCampanaId || !selectedAreaId) {
      setSubmitError('Selecciona una campaña activa y tu área/departamento antes de enviar.');
      return;
    }

    setSubmitting(true);
    const payload = {
      campana_id: Number(selectedCampanaId),
      area_id: Number(selectedAreaId),
      respuestas: Object.entries(respuestas).map(([preguntaId, valor]) => ({
        pregunta_id: Number(preguntaId),
        valor: Number(valor),
      })),
    };

    const res = await responderEncuestaPublica(payload);
    if (res.success) {
      setEnviado(true);
    } else {
      setSubmitError(
        res.error?.detail ||
          (typeof res.error === 'object' ? JSON.stringify(res.error) : res.error) ||
          'Ocurrió un error al registrar tus respuestas.'
      );
    }
    setSubmitting(false);
  };

  const preguntaActual = preguntas[indiceActual];
  const textoPregunta = preguntaActual?.texto || preguntaActual?.pregunta || preguntaActual?.enunciado || '';
  const categoriaPregunta =
    preguntaActual?.categoria || preguntaActual?.dominio || preguntaActual?.dimension || 'Factor Psicosocial · NOM-035';

  const porcentajeProgreso =
    preguntas.length > 0 ? Math.round(((indiceActual + 1) / preguntas.length) * 100) : 0;
  const respuestaActualSeleccionada = preguntaActual ? respuestas[preguntaActual.id] : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1E3A5F] to-slate-900 px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">

        {/* HEADER */}
        <div className="px-8 pt-10 pb-6 text-center border-b border-slate-100">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold text-[#1E3A5F] bg-blue-50 rounded-full">
            Cuestionario Anónimo · NOM-035
          </span>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">
            WorkSpace Pulse
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Evaluación de Clima Laboral y Factores Psicosociales
          </p>

          {/* SELECTORES DE CONTEXTO (GUÍA, CENTRO, CAMPAÑA Y ÁREA) */}
          {!enviado && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Guía de Referencia
                </label>
                <select
                  value={selectedGuiaId}
                  onChange={(e) => setSelectedGuiaId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                >
                  <option value="">Selecciona guía...</option>
                  {guias.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre || g.titulo || `Guía #${g.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Centro de Trabajo
                </label>
                <select
                  value={selectedCentroId}
                  onChange={(e) => setSelectedCentroId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                >
                  <option value="">Selecciona centro...</option>
                  {centros.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Campaña Activa
                </label>
                <select
                  value={selectedCampanaId}
                  onChange={(e) => setSelectedCampanaId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                >
                  <option value="">
                    {loadingCampanas ? 'Cargando campañas...' : 'Selecciona campaña...'}
                  </option>
                  {campanas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.estado})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Área / Departamento
                </label>
                <select
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                >
                  <option value="">Selecciona tu área...</option>
                  {areasDelCentro.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {!enviado && preguntas.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>Pregunta {indiceActual + 1} de {preguntas.length}</span>
                <span>{porcentajeProgreso}% completado</span>
              </div>
              {/* Barra de progreso */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1E3A5F] h-full transition-all duration-300 ease-in-out"
                  style={{ width: `${porcentajeProgreso}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loadingEncuesta ? (
          <div className="px-8 py-16 flex flex-col items-center justify-center text-slate-500 gap-3">
            <Loader2 className="animate-spin text-[#1E3A5F]" size={32} />
            <p className="text-sm font-medium">Cargando preguntas desde el servidor...</p>
          </div>
        ) : errorEncuesta ? (
          <div className="px-8 py-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
            <p className="text-sm text-red-600 font-medium">
              Error al cargar cuestionario: {typeof errorEncuesta === 'object' ? JSON.stringify(errorEncuesta) : errorEncuesta}
            </p>
          </div>
        ) : !preguntaActual && !enviado ? (
          <div className="px-8 py-12 text-center text-slate-500 text-sm">
            No hay preguntas registradas para la Guía de Referencia seleccionada.
          </div>
        ) : !enviado ? (
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {submitError}
              </div>
            )}

            {/* BLOQUE DE PREGUNTA */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {categoriaPregunta}
              </span>
              <h2 className="text-xl font-bold text-[#1E293B] leading-snug">
                {textoPregunta}
              </h2>
            </div>

            {/* OPCIONES DE RESPUESTA */}
            <div className="space-y-3">
              {opcionesRespuesta.map((opcion) => {
                const seleccionada = respuestaActualSeleccionada === opcion.valor;
                return (
                  <label
                    key={opcion.valor}
                    onClick={() => handleSeleccion(preguntaActual.id, opcion.valor)}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                      seleccionada
                        ? 'border-[#1E3A5F] bg-blue-50/60 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                    }`}
                  >
                    <span className={`text-sm font-medium ${seleccionada ? 'text-[#1E3A5F] font-semibold' : 'text-slate-700'}`}>
                      {opcion.etiqueta}
                    </span>
                    <input
                      type="radio"
                      name={`pregunta-${preguntaActual.id}`}
                      checked={seleccionada}
                      onChange={() => handleSeleccion(preguntaActual.id, opcion.valor)}
                      className="w-4 h-4 accent-[#1E3A5F] cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            {/* BOTONES DE NAVEGACIÓN */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleAnterior}
                disabled={indiceActual === 0}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  indiceActual === 0
                    ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Anterior
              </button>

              {indiceActual < preguntas.length - 1 ? (
                <button
                  type="button"
                  onClick={handleSiguiente}
                  disabled={!respuestaActualSeleccionada}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md ${
                    !respuestaActualSeleccionada
                      ? 'opacity-50 cursor-not-allowed bg-slate-400'
                      : 'bg-[#1E3A5F] hover:bg-[#172A47] hover:shadow-lg'
                  }`}
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!respuestaActualSeleccionada || submitting}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md flex items-center gap-2 ${
                    !respuestaActualSeleccionada || submitting
                      ? 'opacity-50 cursor-not-allowed bg-slate-400'
                      : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'
                  }`}
                >
                  {submitting && <Loader2 className="animate-spin" size={16} />}
                  {submitting ? 'Enviando...' : 'Finalizar y Enviar'}
                </button>
              )}
            </div>

          </form>
        ) : (
          /* PANTALLA DE AGRADECIMIENTO ANÓNIMO */
          <div className="px-8 py-12 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">
              ✓
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#1E293B]">
                ¡Cuestionario enviado con éxito!
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Tus respuestas han sido registradas de forma totalmente anónima y se ha actualizado el nivel de riesgo del área. Agradecemos tu participación para mejorar el entorno laboral de la organización.
              </p>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  setIndiceActual(0);
                  setRespuestas({});
                  setEnviado(false);
                }}
                className="text-xs font-semibold text-[#1E3A5F] hover:underline"
              >
                Registrar otra evaluación
              </button>
            </div>
          </div>
        )}

        {/* FOOTER LEGAL */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 WorkSpace Pulse · Cumplimiento NOM-035-STPS-2018
          </p>
        </div>

      </div>
    </div>
  );
}