// frontend/src/components/RecomendacionesIA.jsx
//
// Sugerencias de planes de acción generadas con IA (Groq).
// La IA se consulta desde el BACKEND; la clave nunca llega al navegador.
//
// Props:
//   onUsar(recomendacion, resultadoRiesgoId) -> se llama al pulsar "Crear plan".
//   La página decide qué hacer (abrir su formulario ya rellenado).

import { useEffect, useState } from 'react';
import { AlertCircle, CalendarDays, Loader2, Sparkles, Plus } from 'lucide-react';

import api from '../api/axios';

const periodos = [
  { label: 'Últimos 3 meses', value: '3' },
  { label: 'Últimos 6 meses', value: '6' },
  { label: 'Últimos 12 meses', value: '12' },
];

const coloresPrioridad = {
  Alta: 'bg-red-100 text-red-700',
  Media: 'bg-amber-100 text-amber-700',
  Baja: 'bg-emerald-100 text-emerald-700',
};

function describirError(err) {
  if (err.response) {
    const { status, data } = err.response;
    if (data?.detail) return data.detail;
    if (status === 404) return 'Error 404: Django no tiene registrada la ruta v1/planes-accion/recomendaciones/.';
    if (status === 401 || status === 403) return `Error ${status}: tu sesión no es válida. Cierra sesión y vuelve a entrar.`;
    if (status >= 500) return `Error ${status}: falló algo dentro de Django. Revisa la terminal del servidor.`;
    return `El servidor respondió con el error ${status}.`;
  }
  return 'No hay conexión con el servidor. Revisa que Django esté corriendo en el puerto 8000.';
}

export default function RecomendacionesIA({ onUsar }) {
  const [areas, setAreas] = useState([]);
  const [areaId, setAreaId] = useState('');
  const [meses, setMeses] = useState('6');

  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  // Áreas de la empresa (endpoint propio de planes de acción, filtrado por empresa)
  useEffect(() => {
    api
      .get('v1/planes-accion/areas/')
      .then(({ data }) => setAreas(Array.isArray(data) ? data : data?.results ?? []))
      .catch(() => setAreas([]));
  }, []);

  async function pedirRecomendaciones() {
    if (!areaId) return;

    setCargando(true);
    setError('');
    setResultado(null);

    try {
      const { data } = await api.post('v1/planes-accion/recomendaciones/', {
        area: Number(areaId),
        meses: Number(meses),
      });
      setResultado(data);
    } catch (err) {
      console.error('Error al pedir recomendaciones:', err);
      setError(describirError(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-[#1E3A5F]" />
        <h2 className="font-bold text-slate-800">Recomendaciones sugeridas</h2>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Elige un área y se propondrán medidas según los factores de riesgo detectados en sus evaluaciones.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_auto]">
        <select
          value={areaId}
          onChange={(e) => setAreaId(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
        >
          <option value="">
            {areas.length ? 'Selecciona un área' : 'No se pudieron cargar las áreas'}
          </option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.nombre}
              {area.centro_trabajo?.nombre ? ` · ${area.centro_trabajo.nombre}` : ''}
            </option>
          ))}
        </select>

        <select
          value={meses}
          onChange={(e) => setMeses(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
        >
          {periodos.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={pedirRecomendaciones}
          disabled={!areaId || cargando}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#294d78] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cargando ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Analizando...
            </>
          ) : (
            <>
              <Sparkles size={16} /> Sugerir con IA
            </>
          )}
        </button>
      </div>

      {error && (
        <div role="alert" className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {resultado && (
        <div className="mt-5 space-y-4">
          {/* Resumen del área */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-[#1E3A5F]">
              {resultado.area.nombre} · {resultado.area.centro_trabajo}
            </span>
            {resultado.puntuacion_promedio !== null && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                Puntuación {resultado.puntuacion_promedio}
              </span>
            )}
            {resultado.nivel_actual && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                Nivel {resultado.nivel_actual}
              </span>
            )}
            {resultado.factores.slice(0, 3).map((factor) => (
              <span key={factor.dominio} className="rounded-full bg-violet-50 px-3 py-1 font-semibold text-violet-700">
                {factor.dominio}: {factor.indice}
              </span>
            ))}
          </div>

          {resultado.aviso && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {resultado.aviso}
            </div>
          )}

          {resultado.recomendaciones.length === 0 && (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No hay recomendaciones disponibles para esta área.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {resultado.recomendaciones.map((rec, indice) => (
              <article key={indice} className="flex flex-col rounded-xl border border-slate-200 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${coloresPrioridad[rec.prioridad] || 'bg-slate-100 text-slate-600'}`}>
                    Prioridad {rec.prioridad}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                    {rec.origen === 'ia' ? 'Generado con IA' : 'Catálogo'}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-800">{rec.titulo}</h3>
                <p className="mt-1 flex-1 text-sm text-slate-600">{rec.descripcion}</p>

                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  {rec.dominio && <p>Dominio: {rec.dominio}</p>}
                  <p className="flex items-center gap-1">
                    <CalendarDays size={13} /> Plazo sugerido: {rec.plazo_dias} días · {rec.responsable_sugerido}
                  </p>
                  <p>{rec.referencia_normativa}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onUsar(rec, resultado.resultado_riesgo_id)}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-[#1E3A5F] px-4 py-2 text-sm font-semibold text-[#1E3A5F] transition hover:bg-[#1E3A5F] hover:text-white"
                >
                  <Plus size={16} /> Crear plan
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
