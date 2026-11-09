import { useEffect, useRef, useState } from 'react';

import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Download,
  Filter,
  Loader2,
  ShieldAlert,
  Users,
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import api from '../api/axios';
import { exportarElementoAPdf } from '../lib/exportPdf';

const periodos = [
  { label: 'Últimos 12 meses', value: '12' },
  { label: 'Últimos 6 meses', value: '6' },
  { label: 'Últimos 3 meses', value: '3' },
  { label: 'Mes actual', value: '1' },
];

const COLOR_NIVEL = {
  Nulo: '#0ea5e9',
  Bajo: '#16a34a',
  Medio: '#f59e0b',
  Alto: '#dc2626',
  'Muy alto': '#7f1d1d',
};

const COLOR_NIVEL_DEFAULT = '#64748b';

function clasificarPuntuacion(puntuacion) {
  if (puntuacion >= 60) {
    return { texto: 'Alto', estilo: 'bg-red-50 text-red-700' };
  }
  if (puntuacion >= 40) {
    return { texto: 'Medio', estilo: 'bg-amber-50 text-amber-700' };
  }
  return { texto: 'Bajo', estilo: 'bg-emerald-50 text-emerald-700' };
}

function TarjetaIndicador({ titulo, valor, descripcion, icono: Icono, color }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{titulo}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-800">{valor}</p>
        </div>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icono size={22} />
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{descripcion}</p>
    </article>
  );
}

function TarjetaGrafica({ titulo, descripcion, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-bold text-slate-800">{titulo}</h2>
        <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
      </div>
      {children}
    </section>
  );
}

function SinDatos({ mensaje = 'No hay datos para los filtros seleccionados.' }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-xl bg-slate-50 px-4 text-center text-sm text-slate-500">
      {mensaje}
    </div>
  );
}

export default function PanelRiesgos() {
  const [periodo, setPeriodo] = useState('6');
  const [sede, setSede] = useState('');
  const [departamento, setDepartamento] = useState('');

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const reporteRef = useRef(null);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarDatos() {
      setCargando(true);
      setError('');

      try {
        const params = { meses: periodo };
        if (sede) params.centro_trabajo = sede;
        if (departamento) params.area = departamento;

        // INCLUYE 'v1/' PARA COINCIDIR CON LA RUTA DEL BACKEND
        const { data } = await api.get('v1/panel-riesgos/', {
          params,
          signal: controlador.signal,
        });

        setDatos(data);
      } catch (err) {
        if (err.code === 'ERR_CANCELED') return;

        console.error('Error al cargar el panel de riesgos:', err);
        setError(
          err.response?.status === 401
            ? 'Tu sesión expiró. Vuelve a iniciar sesión.'
            : 'No se pudieron cargar los datos del panel.',
        );
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    cargarDatos();

    return () => controlador.abort();
  }, [periodo, sede, departamento]);

  const indicadores = datos?.indicadores ?? {};
  const tendencia = datos?.tendencia ?? [];
  const distribucion = (datos?.distribucion ?? []).map((item) => ({
    ...item,
    color: COLOR_NIVEL[item.nombre] ?? COLOR_NIVEL_DEFAULT,
  }));
  const areas = datos?.areas ?? [];
  const factores = datos?.factores ?? [];
  const centros = datos?.catalogos?.centros ?? [];
  const areasCatalogo = datos?.catalogos?.areas ?? [];

  const hayTendencia = tendencia.some(
    (item) => item.riesgo !== null || item.rotacion !== null,
  );

  function cambiarSede(valor) {
    setSede(valor);
    setDepartamento('');
  }

  async function exportarPdf() {
    if (!reporteRef.current || exportando || cargando) return;

    setExportando(true);

    try {
      const periodoTexto =
        periodos.find((item) => item.value === periodo)?.label ?? periodo;

      const sedeTexto =
        centros.find((item) => String(item.id) === sede)?.nombre ??
        'Todas las sedes';

      const areaTexto =
        areasCatalogo.find((item) => String(item.id) === departamento)
          ?.nombre ?? 'Todas las áreas';

      const fecha = new Date().toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      await exportarElementoAPdf(
        reporteRef.current,
        'panel-riesgos.pdf',
        'Workspace Pulse - Panel de riesgos psicosociales',
        `${periodoTexto} | ${sedeTexto} | ${areaTexto} | Generado el ${fecha}`,
      );
    } catch (err) {
      console.error('No se pudo generar el PDF:', err);
      alert('No se pudo generar el PDF. Revisa la consola para más detalles.');
    } finally {
      setExportando(false);
    }
  }

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Activity size={17} />
            <span>Análisis organizacional</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Panel de riesgos psicosociales
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Analiza los factores de riesgo, identifica tendencias
            y detecta las áreas que requieren atención prioritaria.
          </p>
        </div>

        <button
          type="button"
          onClick={exportarPdf}
          disabled={exportando || cargando || !datos}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download size={17} />
          {exportando ? 'Generando PDF...' : 'Exportar PDF'}
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      <div ref={reporteRef} className="space-y-6 bg-white">
        <section data-pdf-block className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-600" />
              <h2 className="font-semibold text-slate-800">Filtros de análisis</h2>
            </div>

            {cargando && (
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 size={14} className="animate-spin" />
                Actualizando...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <CalendarDays size={16} />
                Periodo
              </span>

              <select
                value={periodo}
                onChange={(event) => setPeriodo(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {periodos.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">
                Centro de trabajo
              </span>

              <select
                value={sede}
                onChange={(event) => cambiarSede(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Todas las sedes</option>
                {centros.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">
                Área
              </span>

              <select
                value={departamento}
                onChange={(event) => setDepartamento(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Todas las áreas</option>
                {areasCatalogo.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section data-pdf-block className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TarjetaIndicador
            titulo="Puntuación promedio"
            valor={indicadores.riesgo_promedio ?? '-'}
            descripcion="Promedio de resultados de riesgo (0-100)"
            icono={Activity}
            color="bg-blue-50 text-blue-700"
          />

          <TarjetaIndicador
            titulo="Riesgo alto o muy alto"
            valor={`${indicadores.nivel_alto_porcentaje ?? 0}%`}
            descripcion={`De ${indicadores.total_resultados ?? 0} resultados calculados`}
            icono={ShieldAlert}
            color="bg-red-50 text-red-700"
          />

          <TarjetaIndicador
            titulo="Factores evaluados"
            valor={indicadores.factores_evaluados ?? 0}
            descripcion="Dominios con respuestas en el periodo"
            icono={CheckCircle2}
            color="bg-emerald-50 text-emerald-700"
          />

          <TarjetaIndicador
            titulo="Áreas evaluadas"
            valor={indicadores.areas_evaluadas ?? 0}
            descripcion="Con resultados en la selección actual"
            icono={Users}
            color="bg-violet-50 text-violet-700"
          />
        </section>

        <section data-pdf-block className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <TarjetaGrafica
              titulo="Tendencia de riesgo psicosocial"
              descripcion="Puntuación promedio de riesgo y tasa de rotación por mes"
            >
              {hayTendencia ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={tendencia}
                      margin={{ top: 10, right: 12, left: -15, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="periodo" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="riesgo"
                        name="Puntuación de riesgo"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        connectNulls
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="rotacion"
                        name="Rotación (%)"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        connectNulls
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <SinDatos />
              )}
            </TarjetaGrafica>
          </div>

          <TarjetaGrafica
            titulo="Distribución de riesgo"
            descripcion="Porcentaje de resultados por nivel"
          >
            {distribucion.length > 0 ? (
              <>
                <div className="relative h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribucion}
                        dataKey="valor"
                        nameKey="nombre"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        stroke="none"
                        isAnimationActive={false}
                      >
                        {distribucion.map((item) => (
                          <Cell key={item.nombre} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {distribucion.map((item) => (
                    <div key={item.nombre} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.nombre}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {item.valor}%{' '}
                        <span className="font-normal text-slate-400">({item.cantidad})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <SinDatos />
            )}
          </TarjetaGrafica>
        </section>

        <section data-pdf-block className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <TarjetaGrafica
            titulo="Riesgo por área"
            descripcion="Puntuación promedio de riesgo por área"
          >
            {areas.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={areas}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis type="category" dataKey="nombre" width={115} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip formatter={(value) => [value, 'Puntuación']} />
                    <Bar
                      dataKey="riesgo"
                      name="Puntuación"
                      fill="#3b82f6"
                      radius={[0, 6, 6, 0]}
                      barSize={26}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <SinDatos />
            )}
          </TarjetaGrafica>

          <TarjetaGrafica
            titulo="Factores de riesgo"
            descripcion="Índice (0-100) por dominio, según las respuestas del periodo"
          >
            {factores.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={factores} margin={{ top: 10, right: 10, left: -15, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="nombre"
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={65}
                      tick={{ fontSize: 10 }}
                      stroke="#94a3b8"
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip formatter={(value) => [value, 'Índice']} />
                    <Bar
                      dataKey="valor"
                      name="Índice"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                      barSize={32}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <SinDatos />
            )}
          </TarjetaGrafica>
        </section>

        <section data-pdf-block className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold text-slate-800">Áreas que requieren seguimiento</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ordenadas de mayor a menor puntuación promedio de riesgo.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Área</th>
                  <th className="px-5 py-4 font-semibold">Centro de trabajo</th>
                  <th className="px-5 py-4 font-semibold">Puntuación</th>
                  <th className="px-5 py-4 font-semibold">Nivel (referencia)</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {areas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                      No hay resultados para los filtros seleccionados.
                    </td>
                  </tr>
                )}

                {areas.map((item) => {
                  const nivel = clasificarPuntuacion(item.riesgo);

                  return (
                    <tr key={item.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-700">{item.nombre}</td>
                      <td className="px-5 py-4 text-slate-600">{item.centro}</td>
                      <td className="px-5 py-4 text-slate-600">{item.riesgo}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${nivel.estilo}`}>
                          {nivel.texto}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}