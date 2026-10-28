// src/pages/AppliedSurveys.jsx
import { useState } from 'react';
import { 
  Search, Filter, QrCode, Link as LinkIcon, Copy, 
  CheckCircle2, Clock, CalendarDays, BarChart3, AlertCircle 
} from 'lucide-react';

// --- DATOS MOCK (Simulando Backend) ---
const MOCK_SURVEYS = [
  { 
    id: 1, 
    name: 'Guía de Referencia I - NOM-035', 
    type: 'NOM-035', 
    date: '01 Oct 2026', 
    status: 'active', 
    participation: 78, 
    totalAssigned: 450,
    deadline: '15 Oct 2026'
  },
  { 
    id: 2, 
    name: 'Encuesta de Clima Laboral Q3', 
    type: 'Clima', 
    date: '15 Sep 2026', 
    status: 'finished', 
    participation: 92, 
    totalAssigned: 450,
    deadline: '30 Sep 2026'
  },
  { 
    id: 3, 
    name: 'Evaluación Cultura Organizacional', 
    type: 'Cultura', 
    date: '20 Oct 2026', 
    status: 'scheduled', 
    participation: 0, 
    totalAssigned: 450,
    deadline: '05 Nov 2026'
  },
  { 
    id: 4, 
    name: 'Sondeo Rápido: Carga de Trabajo', 
    type: 'Ad-hoc', 
    date: '05 Oct 2026', 
    status: 'active', 
    participation: 12, 
    totalAssigned: 85,
    deadline: '10 Oct 2026'
  },
];

export default function AppliedSurveys() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Función para copiar enlace simulado
  const handleCopyLink = (id) => {
    navigator.clipboard.writeText(`https://workspace-pulse.app/survey/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Renderizado de Badge de Estatus
  const StatusBadge = ({ status }) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      finished: 'bg-slate-100 text-slate-600 border-slate-200',
      scheduled: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    
    const labels = {
      active: 'Activa',
      finished: 'Finalizada',
      scheduled: 'Programada',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.finished}`}>
        {status === 'active' && <Clock size={12}/>}
        {status === 'finished' && <CheckCircle2 size={12}/>}
        {status === 'scheduled' && <CalendarDays size={12}/>}
        {labels[status]}
      </span>
    );
  };

  // Filtrado de datos
  const filteredSurveys = MOCK_SURVEYS.filter(survey => {
    const matchesSearch = survey.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || survey.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    // CONTENIDO PARA DASHBOARDLAYOUT (Fondo azul manejado por el Layout padre)
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER DE SECCIÓN */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Encuestas Aplicadas</h1>
        <p className="text-slate-300 text-base">Registro histórico, monitoreo de participación y generación de enlaces de distribución.</p>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA (Glassmorphism) */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Buscar encuesta por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-[#1E3A5F] outline-none transition-all"
          />
        </div>
        
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#1E3A5F] outline-none appearance-none cursor-pointer hover:bg-white transition-colors"
          >
            <option value="all">Todos los estatus</option>
            <option value="active">Activas</option>
            <option value="finished">Finalizadas</option>
            <option value="scheduled">Programadas</option>
          </select>
        </div>
      </div>

      {/* TABLA DE REGISTRO HISTÓRICO */}
      <div className="bg-white rounded-2xl shadow-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-xs border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Nombre de Encuesta</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Fecha Aplicación</th>
                <th className="px-6 py-4">Participación</th>
                <th className="px-6 py-4">Estatus</th>
                <th className="px-6 py-4 text-right">Distribución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSurveys.length > 0 ? (
                filteredSurveys.map((survey) => (
                  <tr key={survey.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{survey.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Vence: {survey.deadline}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {survey.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{survey.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                          <div 
                            className={`h-full rounded-full ${survey.participation >= 80 ? 'bg-emerald-500' : survey.participation >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${survey.participation}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-10 text-right">
                          {survey.participation}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{survey.totalAssigned} asignados</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={survey.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Botón Generar QR */}
                        <button 
                          title="Generar Código QR"
                          className="p-2 text-slate-400 hover:text-[#1E3A5F] hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <QrCode size={18} />
                        </button>
                        
                        {/* Botón Copiar Enlace */}
                        <button 
                          onClick={() => handleCopyLink(survey.id)}
                          title={copiedId === survey.id ? "¡Copiado!" : "Copiar enlace directo"}
                          className={`p-2 rounded-lg transition-colors ${copiedId === survey.id ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-[#1E3A5F] hover:bg-blue-50'}`}
                        >
                          {copiedId === survey.id ? <CheckCircle2 size={18}/> : <LinkIcon size={18}/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300"/>
                    No se encontraron encuestas con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NOTA LEGAL / PIE DE PÁGINA INFORMATIVO */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-start gap-3">
        <BarChart3 className="w-5 h-5 text-slate-300 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-300 leading-relaxed">
          Los porcentajes de participación se actualizan en tiempo real. Para encuestas activas con menos del 50% de participación faltando 48 horas para el cierre, el sistema enviará una alerta automática al Gerente de RH vía Resend.
        </p>
      </div>

    </div>
  );
}