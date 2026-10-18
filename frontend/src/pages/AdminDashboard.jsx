// src/pages/AdminDashboard.jsx
import { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { 
  Users, CheckCircle, AlertTriangle, TrendingUp, Filter, Download, 
  FileText, Bell, Search 
} from 'lucide-react';

// --- DATOS MOCK (Simulando Backend) ---
const kpiData = [
  { title: 'Índice de Satisfacción', value: '82%', change: '+4.5%', trend: 'up', color: '#10B981' },
  { title: 'Encuestas Completadas', value: '1,240', sub: 'de 1,500 asignadas', color: '#1E3A5F' },
  { title: 'Pendientes', value: '260', sub: 'Vencen en 5 días', color: '#F59E0B' },
  { title: 'Riesgo Alto', value: '12%', change: '-2.1%', trend: 'down', color: '#EF4444' },
];

const trendData = [
  { name: 'Lun', sat: 75, risk: 20 }, { name: 'Mar', sat: 78, risk: 18 },
  { name: 'Mié', sat: 82, risk: 15 }, { name: 'Jue', sat: 80, risk: 16 },
  { name: 'Vie', sat: 85, risk: 12 }, { name: 'Sáb', sat: 88, risk: 10 },
  { name: 'Dom', sat: 82, risk: 14 },
];

const riskDistribution = [
  { name: 'Bajo', value: 65, color: '#10B981' },
  { name: 'Medio', value: 23, color: '#F59E0B' },
  { name: 'Alto', value: 12, color: '#EF4444' },
];

export default function AdminDashboard() {
  const [filterSede, setFilterSede] = useState('Todas');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1E3A5F] to-slate-900">
      
      {/* HEADER ADMINISTRATIVO */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1E3A5F] rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <h1 className="text-xl font-bold text-[#1E293B]">WorkSpace Pulse <span className="text-xs font-normal text-slate-500 ml-2">Panel Administrativo</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Filtro Global (RF07) */}
            <div className="relative hidden md:block">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={filterSede} 
                onChange={(e) => setFilterSede(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1E3A5F] outline-none appearance-none cursor-pointer"
              >
                <option>Todas las sedes</option>
                <option>Sede Central CDMX</option>
                <option>Planta Monterrey</option>
                <option>Oficina Guadalajara</option>
              </select>
            </div>
            
            <button className="p-2 text-slate-500 hover:text-[#1E3A5F] transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">RH</div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* KPI CARDS (RF06) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: kpi.color }}></div>
              </div>
              <h3 className="text-3xl font-bold text-[#1E293B] mb-1">{kpi.value}</h3>
              {kpi.sub && <p className="text-xs text-slate-400">{kpi.sub}</p>}
              {kpi.change && (
                <p className={`text-xs font-semibold flex items-center gap-1 ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {kpi.trend === 'up' ? <TrendingUp size={12}/> : <TrendingUp size={12} className="rotate-180"/>}
                  {kpi.change} vs mes anterior
                </p>
              )}
            </div>
          ))}
        </div>

        {/* GRÁFICOS PRINCIPALES (RF06 / RF07) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TENDENCIA TEMPORAL (2/3 del ancho) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#1E293B]">Tendencia de Satisfacción y Riesgo</h3>
              <button className="text-xs font-medium text-[#1E3A5F] hover:underline flex items-center gap-1">
                <Download size={14}/> Exportar CSV
              </button>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="sat" stroke="#1E3A5F" strokeWidth={3} dot={{r: 4, fill: '#1E3A5F'}} activeDot={{r: 6}} name="Satisfacción %" />
                  <Line type="monotone" dataKey="risk" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Nivel de Riesgo" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DISTRIBUCIÓN DE RIESGO (1/3 del ancho) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-lg font-bold text-[#1E293B] mb-2">Distribución de Riesgo Psicosocial</h3>
            <p className="text-xs text-slate-500 mb-4">Basado en Guía de Referencia I NOM-035</p>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
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
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {riskDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></span>
                  {item.name} ({item.value}%)
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ALERTAS Y ACCESOS RÁPIDOS (RF10 / 4.1) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TABLA DE ÁREAS CRÍTICAS */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500"/> Áreas con Alerta Activa
              </h3>
              <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-bold">3 Críticas</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Área / Departamento</th>
                    <th className="px-6 py-3">Factor de Riesgo</th>
                    <th className="px-6 py-3">Última Evaluación</th>
                    <th className="px-6 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">Logística y Almacén</td>
                    <td className="px-6 py-4 text-slate-600">Carga de trabajo excesiva</td>
                    <td className="px-6 py-4 text-slate-500">Hace 2 días</td>
                    <td className="px-6 py-4"><span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold">Crítico</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">Atención al Cliente</td>
                    <td className="px-6 py-4 text-slate-600">Falta de reconocimiento</td>
                    <td className="px-6 py-4 text-slate-500">Hace 5 días</td>
                    <td className="px-6 py-4"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold">Precaución</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ACCESOS RÁPIDOS (4.1 Menú Principal) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white/90 px-1">Gestión Rápida</h3>
            <button className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-[#1E3A5F] hover:shadow-md transition-all flex items-center gap-3 group text-left">
              <div className="w-10 h-10 bg-blue-50 text-[#1E3A5F] rounded-lg flex items-center justify-center group-hover:bg-[#1E3A5F] group-hover:text-white transition-colors">
                <Users size={20}/>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Asignar Encuestas</p>
                <p className="text-xs text-slate-500">NOM-035 o Clima Laboral</p>
              </div>
            </button>

            <button className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-[#1E3A5F] hover:shadow-md transition-all flex items-center gap-3 group text-left">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileText size={20}/>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Generar Reporte Oficial</p>
                <p className="text-xs text-slate-500">Evidencia para auditoría STPS</p>
              </div>
            </button>

            <button className="w-full bg-[#1E3A5F] p-4 rounded-xl shadow-md hover:bg-[#172A47] transition-all flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <TrendingUp size={20}/>
              </div>
              <div>
                <p className="font-bold text-sm">Ver Recomendaciones IA</p>
                <p className="text-xs text-blue-200">Plan de acción sugerido</p>
              </div>
            </button>
          </div>

        </div>

        {/* FOOTER LEGAL CONSISTENTE */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-slate-400/70">© 2026 WorkSpace Pulse · Cumplimiento NOM-035-STPS-2018</p>
        </div>

      </main>
    </div>
  );
}