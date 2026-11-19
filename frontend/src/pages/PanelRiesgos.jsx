// src/pages/panelRiesgos.jsx
import { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useRiesgos } from '../hooks/useRiesgos';
import { useCentrosTrabajo } from '../hooks/useCentrosTrabajo';
import { useAreas } from '../hooks/useAreas';

const PERIODOS = [
  { label: 'Últimos 6 meses', value: '6' },
  { label: 'Últimos 3 meses', value: '3' },
  { label: 'Último mes', value: '1' },
];

const COLORES_NIVEL = {
  bajo: '#16a34a',
  nulo: '#16a34a',
  medio: '#f59e0b',
  moderado: '#f59e0b',
  alto: '#dc2626',
  'muy alto': '#991b1b',
};

function TarjetaIndicador({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  color,
  tendencia,
  positivo,
}) {
  return (
    <article className="bg-white p-5 rounded-2xl shadow-lg border border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{titulo}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-800">{valor}</p>
        </div>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icono size={22} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        {tendencia && (
          <span
            className={`flex items-center gap-1 font-semibold ${
              positivo ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {positivo ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}
            {tendencia}
          </span>
        )}
        <span className="text-slate-500">{descripcion}</span>
      </div>
    </article>
  );
}

function TarjetaGrafica({ titulo, descripcion, children }) {
  return (
    <section className="min-w-0 bg-white p-6 rounded-2xl shadow-lg border border-white/10">
      {(titulo || descripcion) && (
        <div className="mb-5">
          {titulo && <h2 className="font-bold text-slate-800">{titulo}</h2>}
          {descripcion && <p className="mt-1 text-sm text-slate-500">{descripcion}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((obj) => Object.values(obj).join(','));
  const csvContent = [headers, ...rows].join('\n');

  const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function PanelRiesgos() {
  const [periodo, setPeriodo] = useState('6');
  const [centroId, setCentroId] = useState('');
  const [areaId, setAreaId] = useState('');

  const { centros } = useCentrosTrabajo();
  const { areas } = useAreas();

  // Hook conectado al endpoint real de PanelRiesgosView
  const { panelData, loading, error } = useRiesgos({
    centroId: centroId || null,
    areaId: areaId || null,
    meses: periodo || null,
    autoFetch: true,
  });

  // Áreas filtradas por el centro de trabajo seleccionado
  const areasFiltradas = useMemo(() => {
    if (!centroId) return areas;
    return areas.filter((a) => {
      const cId = typeof a.centro_trabajo === 'object' ? a.centro_trabajo?.id : a.centro_trabajo;
      return String(cId) === String(centroId);
    });
  }, [areas, centroId]);

  // Normalización de estructuras provenientes del backend
  const tendencias = useMemo(() => {
    const raw = panelData?.tendencias || panelData?.tendencia || [];
    return raw.map((item) => ({
      periodo: item.periodo || item.mes || item.fecha || 'N/A',
      riesgo: Number(item.riesgo ?? item.indice_riesgo ?? item.valor ?? 0),
      estres: Number(item.estres ?? item.nivel_estres ?? 0),
    }));
  }, [panelData]);

  const factoresVisibles = useMemo(() => {
    const raw = panelData?.factores || panelData?.factores_riesgo || panelData?.categorias || [];
    return raw.map((item) => ({
      nombre: item.nombre || item.categoria || item.factor || 'Factor',
      valor: Number(item.valor ?? item.porcentaje ?? item.indice ?? 0),
    }));
  }, [panelData]);

  const nivelesRiesgo = useMemo(() => {
    const raw = panelData?.niveles_riesgo || panelData?.distribucion || [];
    return raw.map((item) => {
      const nombre = item.nombre || item.nivel || 'Bajo';
      const key = nombre.toLowerCase();
      return {
        nombre,
        valor: Number(item.valor ?? item.porcentaje ?? item.cantidad ?? 0),
        color: item.color || COLORES_NIVEL[key] || '#3b82f6',
      };
    });
  }, [panelData]);

  const departamentosVisibles = useMemo(() => {
    const raw = panelData?.departamentos || panelData?.areas || panelData?.riesgo_por_area || [];
    return raw.map((item) => ({
      id: item.id,
      nombre: item.nombre || item.area || item.departamento || 'Área',
      riesgo: Number(item.riesgo ?? item.indice ?? item.porcentaje ?? 0),
      nivel_texto: item.nivel || item.clasificacion || null,
    }));
  }, [panelData]);

  // Indicadores principales (KPIs)
  const promedioRiesgo = useMemo(() => {
    if (panelData?.promedio_riesgo !== undefined) return Math.round(Number(panelData.promedio_riesgo));
    if (panelData?.kpis?.promedio_riesgo !== undefined) return Math.round(Number(panelData.kpis.promedio_riesgo));
    if (departamentosVisibles.length === 0) return 0;
    return Math.round(
      departamentosVisibles.reduce((acc, item) => acc + item.riesgo, 0) / departamentosVisibles.length
    );
  }, [panelData, departamentosVisibles]);

  const porcentajeNivelAlto = useMemo(() => {
    if (panelData?.nivel_alto !== undefined) return Math.round(Number(panelData.nivel_alto));
    if (panelData?.kpis?.nivel_alto !== undefined) return Math.round(Number(panelData.kpis.nivel_alto));
    const alto = nivelesRiesgo.find((n) => n.nombre.toLowerCase().includes('alto'));
    return alto ? alto.valor : 0;
  }, [panelData, nivelesRiesgo]);

  const totalFactores =
    panelData?.total_factores ?? panelData?.kpis?.factores_evaluados ?? factoresVisibles.length;

  const totalDepartamentos =
    panelData?.total_departamentos ?? panelData?.kpis?.departamentos ?? departamentosVisibles.length;

  const handleCentroChange = (nuevoCentroId) => {
    setCentroId(nuevoCentroId);
    setAreaId('');
  };

  function exportarResumen() {
    const sedeNombre = centroId
      ? centros.find((c) => String(c.id) === String(centroId))?.nombre || `Centro #${centroId}`
      : 'Todas las sedes';
    const areaNombre = areaId
      ? areas.find((a) => String(a.id) === String(areaId))?.nombre || `Área #${areaId}`
      : 'Todos los departamentos';

    const contenido = [
      'WORKSPACE PULSE - RESUMEN ANALITICO DE RIESGOS (NOM-035)',
      `Periodo seleccionado: Últimos ${periodo} mes(es)`,
      `Centro de trabajo: ${sedeNombre}`,
      `Departamento / Área: ${areaNombre}`,
      `Nivel de riesgo promedio: ${promedioRiesgo}%`,
      `Incidencia nivel alto: ${porcentajeNivelAlto}%`,
      '',
      'Riesgo por departamento / área:',
      ...(departamentosVisibles.length > 0
        ? departamentosVisibles.map((item) => `- ${item.nombre}: ${item.riesgo}%`)
        : ['Sin resultados registrados para los filtros seleccionados.']),
    ].join('\n');

    const archivo = new Blob(['\uFEFF', contenido], {
      type: 'text/plain;charset=utf-8;',
    });

    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'resumen-riesgos-nom035.txt';
    enlace.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="space-y-6 animate-in fade-in duration-300 -mx-6 sm:-mx-8 lg:-mx-10 px-6 sm:px-8 lg:px-10">
      {/* ENCABEZADO */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Panel de riesgos psicosociales</h1>
          <p className="text-slate-300 text-base">
            Analiza los factores de riesgo, identifica tendencias y detecta las áreas que requieren atención prioritaria.
          </p>
        </div>

        <button
          type="button"
          onClick={exportarResumen}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#172A47] shadow-lg border border-white/10"
        >
          <Download size={17} />
          Exportar resumen
        </button>
      </header>

      {/* FILTROS */}
      <section className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-slate-300" />
          <h2 className="font-semibold text-white">Filtros de análisis</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* FILTRO DE PERIODO */}
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
              <CalendarDays size={16} />
              Periodo
            </span>
            <select
              value={periodo}
              onChange={(event) => setPeriodo(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/90 px-3 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 cursor-pointer"
            >
              {PERIODOS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {/* FILTRO DE CENTRO DE TRABAJO */}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Centro de trabajo
            </span>
            <select
              value={centroId}
              onChange={(event) => handleCentroChange(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/90 px-3 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 cursor-pointer"
            >
              <option value="">Todas las sedes</option>
              {centros.map((centro) => (
                <option key={centro.id} value={centro.id}>
                  {centro.nombre}
                </option>
              ))}
            </select>
          </label>

          {/* FILTRO DE DEPARTAMENTO / ÁREA */}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Departamento
            </span>
            <select
              value={areaId}
              onChange={(event) => setAreaId(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/90 px-3 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 cursor-pointer"
            >
              <option value="">Todos los departamentos</option>
              {areasFiltradas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* ERROR DE CARGA */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          Error al consultar el panel de riesgos: {typeof error === 'object' ? JSON.stringify(error) : error}
        </div>
      )}

      {/* INDICADORES PRINCIPALES */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaIndicador
          titulo="Riesgo promedio"
          valor={loading ? '...' : `${promedioRiesgo}%`}
          descripcion="Índice general NOM-035"
          icono={Activity}
          color="bg-blue-50 text-blue-700"
        />

        <TarjetaIndicador
          titulo="Nivel alto"
          valor={loading ? '...' : `${porcentajeNivelAlto}%`}
          descripcion="Evaluaciones en riesgo alto"
          icono={ShieldAlert}
          color="bg-red-50 text-red-700"
          tendencia={panelData?.tendencia_alto || null}
          positivo={false}
        />

        <TarjetaIndicador
          titulo="Factores evaluados"
          valor={loading ? '...' : totalFactores}
          descripcion="Categorías analizadas"
          icono={CheckCircle2}
          color="bg-emerald-50 text-emerald-700"
        />

        <TarjetaIndicador
          titulo="Departamentos"
          valor={loading ? '...' : totalDepartamentos}
          descripcion="Áreas con resultados"
          icono={Users}
          color="bg-violet-50 text-violet-700"
        />
      </section>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500 gap-3 shadow-lg">
          <Loader2 className="animate-spin text-[#1E3A5F]" size={32} />
          <p className="text-sm font-medium">Calculando indicadores de riesgo desde la base de datos...</p>
        </div>
      ) : (
        <>
          {/* GRÁFICAS DE TENDENCIA Y DISTRIBUCIÓN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* TENDENCIA TEMPORAL */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Tendencia de riesgo psicosocial</h3>
                <button
                  type="button"
                  onClick={() => exportToCSV(tendencias, 'tendencia_riesgo_estres')}
                  className="text-xs font-medium text-[#1E3A5F] hover:text-[#172A47] flex items-center gap-1 transition-colors"
                >
                  <Download size={14} /> Exportar CSV
                </button>
              </div>
              <div className="h-[300px] w-full">
                {tendencias.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tendencias}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="periodo" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="riesgo" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} name="Riesgo %" />
                      <Line type="monotone" dataKey="estres" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Estrés" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    Sin datos históricos de tendencia para el periodo seleccionado.
                  </div>
                )}
              </div>
            </div>

            {/* DISTRIBUCIÓN DE RIESGO */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-white/10 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-slate-800">Distribución de Riesgos Psicosociales</h3>
                <button
                  type="button"
                  onClick={() => exportToCSV(nivelesRiesgo, 'distribucion_nivel_riesgo')}
                  className="text-xs font-medium text-[#1E3A5F] hover:text-[#172A47] flex items-center gap-1 transition-colors"
                >
                  <Download size={14} /> Exportar CSV
                </button>
              </div>
              <div className="flex-1 min-h-[200px]">
                {nivelesRiesgo.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={nivelesRiesgo}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="valor"
                      >
                        {nivelesRiesgo.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    Sin distribución registrada.
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {nivelesRiesgo.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.nombre} ({item.valor}%)
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GRÁFICAS COMPARATIVAS */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {/* RIESGO POR DEPARTAMENTO */}
            <TarjetaGrafica>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Riesgo por departamento</h3>
                <button
                  type="button"
                  onClick={() => exportToCSV(departamentosVisibles, 'riesgo_por_departamento')}
                  className="text-xs font-medium text-[#1E3A5F] hover:text-[#172A47] flex items-center gap-1 transition-colors"
                >
                  <Download size={14} /> Exportar CSV
                </button>
              </div>
              <div className="h-72 w-full">
                {departamentosVisibles.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departamentosVisibles}
                      layout="vertical"
                      margin={{ top: 0, right: 20, left: 15, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis type="category" dataKey="nombre" width={115} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <Tooltip formatter={(value) => [`${value}%`, 'Riesgo']} />
                      <Bar dataKey="riesgo" name="Riesgo" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={26} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    Sin evaluaciones por departamento disponibles.
                  </div>
                )}
              </div>
            </TarjetaGrafica>

            {/* FACTORES DE RIESGO */}
            <TarjetaGrafica>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Factores de riesgo</h3>
                <button
                  type="button"
                  onClick={() => exportToCSV(factoresVisibles, 'factores_riesgo')}
                  className="text-xs font-medium text-[#1E3A5F] hover:text-[#172A47] flex items-center gap-1 transition-colors"
                >
                  <Download size={14} /> Exportar CSV
                </button>
              </div>
              <div className="h-72 w-full">
                {factoresVisibles.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={factoresVisibles}
                      margin={{ top: 10, right: 10, left: -15, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="nombre" interval={0} angle={-20} textAnchor="end" height={65} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip formatter={(value) => [`${value}%`, 'Índice']} />
                      <Bar dataKey="valor" name="Índice" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    Sin datos de factores evaluados para esta selección.
                  </div>
                )}
              </div>
            </TarjetaGrafica>
          </section>

          {/* TABLA DE ÁREAS PRIORITARIAS */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-lg mb-6">
            <div className="border-b border-slate-100 p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Áreas que requieren seguimiento
              </h2>
              <p className="text-sm text-slate-500">
                Priorización basada en los resultados registrados de la NOM-035.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Departamento</th>
                    <th className="px-6 py-4 font-semibold">Índice</th>
                    <th className="px-6 py-4 font-semibold">Nivel NOM-035</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {departamentosVisibles.length > 0 ? (
                    [...departamentosVisibles]
                      .sort((a, b) => b.riesgo - a.riesgo)
                      .map((item, idx) => {
                        const nivel =
                          item.riesgo >= 60
                            ? { texto: item.nivel_texto || 'Alto', estilo: 'bg-red-100 text-red-700' }
                            : item.riesgo >= 40
                              ? { texto: item.nivel_texto || 'Medio', estilo: 'bg-amber-100 text-amber-700' }
                              : { texto: item.nivel_texto || 'Bajo', estilo: 'bg-emerald-100 text-emerald-700' };

                        return (
                          <tr key={item.id || `${item.nombre}-${idx}`} className="transition hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-700">{item.nombre}</td>
                            <td className="px-6 py-4 text-slate-600">{item.riesgo}%</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${nivel.estilo}`}>
                                {nivel.texto}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-slate-400">
                        No hay áreas con evaluaciones registradas para los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}