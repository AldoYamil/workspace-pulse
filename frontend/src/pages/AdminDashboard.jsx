// src/pages/AdminDashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Users, AlertTriangle, TrendingUp, Filter, Download, FileText, Loader2
} from 'lucide-react';
import { useRiesgos } from '../hooks/useRiesgos';
import { useEncuesta } from '../hooks/useEncuesta';
import { useCentrosTrabajo } from '../hooks/useCentrosTrabajo';

const COLORES_RIESGO = {
  bajo: '#10B981',
  nulo: '#10B981',
  medio: '#F59E0B',
  moderado: '#F59E0B',
  alto: '#EF4444',
  'muy alto': '#991B1B',
};

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedCentroId, setSelectedCentroId] = useState('');
  const [selectedGuiaId, setSelectedGuiaId] = useState('');

  // Catálogos y datos reales desde los hooks
  const { centros } = useCentrosTrabajo();
  const { guias, campanas } = useEncuesta({
    guiaId: selectedGuiaId || null,
    centroId: selectedCentroId || null,
    autoFetchGuias: true,
  });

  const { panelData, loading, error } = useRiesgos({
    centroId: selectedCentroId || null,
    autoFetch: true,
  });

  useEffect(() => {
    if (!selectedGuiaId && guias.length > 0) {
      setSelectedGuiaId(String(guias[0].id));
    }
  }, [guias, selectedGuiaId]);

  // Tendencia temporal normalizada desde panelData
  const trendData = useMemo(() => {
    const raw = panelData?.tendencias || panelData?.tendencia || [];
    return raw.map((item) => {
      const riskVal = Number(item.riesgo ?? item.indice_riesgo ?? item.valor ?? 0);
      const satVal =
        item.satisfaccion !== undefined || item.sat !== undefined
          ? Number(item.satisfaccion ?? item.sat)
          : Math.max(0, Math.min(100, 100 - riskVal));

      return {
        name: item.periodo || item.mes || item.fecha || 'N/A',
        sat: satVal,
        risk: riskVal,
      };
    });
  }, [panelData]);

  // Distribución de riesgo (PieChart)
  const riskDistribution = useMemo(() => {
    const raw = panelData?.niveles_riesgo || panelData?.distribucion || [];
    return raw.map((item) => {
      const name = item.nombre || item.nivel || 'Bajo';
      return {
        name,
        value: Number(item.valor ?? item.porcentaje ?? item.cantidad ?? 0),
        color: item.color || COLORES_RIESGO[name.toLowerCase()] || '#3B82F6',
      };
    });
  }, [panelData]);

  // Áreas con alerta activa (riesgo medio/alto ordenadas descendentemente)
  const areasCriticas = useMemo(() => {
    const raw = panelData?.departamentos || panelData?.areas || panelData?.riesgo_por_area || [];
    return raw
      .map((item) => {
        const riesgo = Number(item.riesgo ?? item.indice ?? item.porcentaje ?? 0);
        const nivelTexto =
          item.nivel || item.clasificacion || (riesgo >= 60 ? 'Crítico' : riesgo >= 40 ? 'Precaución' : 'Bajo');
        return {
          id: item.id,
          area: item.nombre || item.area || item.departamento || 'Área',
          factor: item.factor_principal || item.factor || 'Evaluación psicosocial NOM-035',
          ultimaEvaluacion: item.ultima_evaluacion || item.fecha || 'Reciente',
          riesgo,
          nivelTexto,
        };
      })
      .filter((item) => item.riesgo >= 40 || ['alto', 'muy alto', 'crítico', 'critico', 'medio', 'moderado', 'precaución'].includes(item.nivelTexto.toLowerCase()))
      .sort((a, b) => b.riesgo - a.riesgo);
  }, [panelData]);

  // Métricas de campañas reales
  const metricasCampanas = useMemo(() => {
    const activas = campanas.filter((c) => String(c.estado || '').toLowerCase().includes('activ')).length;
    const totalRespuestas = campanas.reduce(
      (acc, c) => acc + Number(c.total_respuestas ?? c.respuestas_count ?? 0),
      0
    );
    const totalAsignados = campanas.reduce((acc, c) => acc + Number(c.total_asignados ?? 0), 0);
    return { activas, totalRespuestas, totalAsignados };
  }, [campanas]);

  // Tarjetas KPI alimentadas con datos reales
  const kpiData = useMemo(() => {
    const promedioRiesgo =
      panelData?.promedio_riesgo !== undefined
        ? Math.round(Number(panelData.promedio_riesgo))
        : panelData?.kpis?.promedio_riesgo !== undefined
          ? Math.round(Number(panelData.kpis.promedio_riesgo))
          : 0;

    const indiceSalud =
      panelData?.indice_satisfaccion !== undefined
        ? Math.round(Number(panelData.indice_satisfaccion))
        : Math.max(0, 100 - promedioRiesgo);

    const completadas =
      panelData?.encuestas_completadas ??
      panelData?.total_evaluaciones ??
      metricasCampanas.totalRespuestas;

    const asignadas = panelData?.encuestas_asignadas ?? metricasCampanas.totalAsignados;

    const pendientes =
      asignadas > 0
        ? Math.max(0, asignadas - completadas)
        : metricasCampanas.activas;

    const riesgoAlto =
      panelData?.nivel_alto !== undefined
        ? Math.round(Number(panelData.nivel_alto))
        : riskDistribution.find((r) => r.name.toLowerCase().includes('alto'))?.value ?? 0;

    return [
      {
        title: 'Índice de Salud Laboral',
        value: loading ? '...' : `${indiceSalud}%`,
        sub: `Riesgo promedio: ${promedioRiesgo}%`,
        color: '#10B981',
      },
      {
        title: 'Encuestas Completadas',
        value: loading ? '...' : completadas.toLocaleString('es-MX'),
        sub: asignadas > 0 ? `de ${asignadas.toLocaleString('es-MX')} asignadas` : `${campanas.length} campaña(s) registrada(s)`,
        color: '#1E3A5F',
      },
      {
        title: asignadas > 0 ? 'Pendientes' : 'Campañas Activas',
        value: loading ? '...' : pendientes.toLocaleString('es-MX'),
        sub: asignadas > 0 ? 'Por responder en sede' : 'En curso actualmente',
        color: '#F59E0B',
      },
      {
        title: 'Riesgo Alto',
        value: loading ? '...' : `${riesgoAlto}%`,
        sub: `${areasCriticas.filter((a) => a.riesgo >= 60).length} área(s) en nivel crítico`,
        color: '#EF4444',
      },
    ];
  }, [panelData, metricasCampanas, riskDistribution, areasCriticas, campanas.length, loading]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* FILTRO GLOBAL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
        <h2 className="text-lg font-bold text-white">Salud Organizacional en Tiempo Real</h2>
        <div className="relative w-full sm:w-auto">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={selectedCentroId}
            onChange={(e) => setSelectedCentroId(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-8 py-2 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#1E3A5F] outline-none appearance-none cursor-pointer hover:bg-white transition-colors"
          >
            <option value="">Todas las sedes</option>
            {centros.map((centro) => (
              <option key={centro.id} value={centro.id}>
                {centro.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* GESTIÓN RÁPIDA CON TÍTULO */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3 px-1">Gestión Rápida</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/encuestas-aplicadas')}
            className="bg-white p-4 rounded-xl shadow-lg border border-white/10 hover:border-[#1E3A5F] hover:shadow-xl transition-all flex items-center gap-3 group text-left"
          >
            <div className="w-10 h-10 bg-blue-50 text-[#1E3A5F] rounded-lg flex items-center justify-center group-hover:bg-[#1E3A5F] group-hover:text-white transition-colors">
              <Users size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Asignar Encuestas</p>
              <p className="text-xs text-slate-500">NOM-035 o Clima Laboral</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/reportes-auditoria')}
            className="bg-white p-4 rounded-xl shadow-lg border border-white/10 hover:border-[#1E3A5F] hover:shadow-xl transition-all flex items-center gap-3 group text-left"
          >
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FileText size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Generar Reporte Oficial</p>
              <p className="text-xs text-slate-500">Evidencia para auditoría STPS</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/planes-accion')}
            className="bg-[#1E3A5F] p-4 rounded-xl shadow-lg hover:bg-[#172A47] transition-all flex items-center gap-3 text-white border border-white/10 cursor-pointer text-left"
          >
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">Analizar Factores de Riesgo</p>
              <p className="text-xs text-blue-200">Detalle por área y tendencia</p>
            </div>
          </button>
        </div>
      </div>

      {/* SEPARADOR VISUAL */}
      <div className="border-t border-white/20 my-2"></div>

      {/* MENSAJE DE ERROR SI FALLA LA API */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          Error al cargar indicadores: {typeof error === 'object' ? JSON.stringify(error) : error}
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-lg border border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: kpi.color }}></div>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-1">{kpi.value}</h3>
            {kpi.sub && <p className="text-xs text-slate-400">{kpi.sub}</p>}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500 gap-3 shadow-lg">
          <Loader2 className="animate-spin text-[#1E3A5F]" size={32} />
          <p className="text-sm font-medium">Cargando métricas organizacionales...</p>
        </div>
      ) : (
        <>
          {/* GRÁFICOS PRINCIPALES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* TENDENCIA TEMPORAL */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Tendencia de Salud Laboral y Riesgo</h3>
                <button
                  type="button"
                  onClick={() => exportToCSV(trendData, 'tendencias_salud_riesgo')}
                  className="text-xs font-medium text-[#1E3A5F] hover:text-[#172A47] flex items-center gap-1 transition-colors"
                >
                  <Download size={14} /> Exportar CSV
                </button>
              </div>
              <div className="h-[300px] w-full">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="sat" stroke="#1E3A5F" strokeWidth={3} dot={{ r: 4, fill: '#1E3A5F' }} activeDot={{ r: 6 }} name="Salud Laboral %" />
                      <Line type="monotone" dataKey="risk" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Nivel de Riesgo %" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    Sin datos históricos de tendencia disponibles para esta selección.
                  </div>
                )}
              </div>
            </div>

            {/* DISTRIBUCIÓN DE RIESGO */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-white/10 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-slate-800">Distribución de Riesgo</h3>
                <button
                  type="button"
                  onClick={() => exportToCSV(riskDistribution, 'distribucion_riesgo')}
                  className="text-xs font-medium text-[#1E3A5F] hover:text-[#172A47] flex items-center gap-1 transition-colors"
                >
                  <Download size={14} /> Exportar CSV
                </button>
              </div>
              <div className="flex-1 min-h-[200px]">
                {riskDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
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
                {riskDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name} ({item.value}%)
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TABLA DE ÁREAS CRÍTICAS - ANCHO COMPLETO */}
          <div className="bg-white rounded-2xl shadow-lg border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Áreas con Alerta Activa
              </h3>
              <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-bold">
                {areasCriticas.length} {areasCriticas.length === 1 ? 'Alerta' : 'Alertas'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Área / Departamento</th>
                    <th className="px-6 py-3">Factor / Evaluación</th>
                    <th className="px-6 py-3">Índice de Riesgo</th>
                    <th className="px-6 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {areasCriticas.length > 0 ? (
                    areasCriticas.map((item, idx) => {
                      const esCritico = item.riesgo >= 60;
                      return (
                        <tr key={item.id || `${item.area}-${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-800">{item.area}</td>
                          <td className="px-6 py-4 text-slate-600">{item.factor}</td>
                          <td className="px-6 py-4 text-slate-600 font-semibold">{item.riesgo}%</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-bold ${
                                esCritico
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {item.nivelTexto}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                        No se detectaron áreas con riesgo medio o alto para la sede seleccionada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}