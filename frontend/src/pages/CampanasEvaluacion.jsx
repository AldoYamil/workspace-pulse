// src/pages/CampanasEvaluacion.jsx
import { useState } from 'react';
import { 
  Megaphone, Calendar, FileText, BarChart3, Plus, Search, 
  Filter, Clock, CheckCircle2, AlertCircle, ChevronRight, Users 
} from 'lucide-react';

// --- DATOS MOCK (Simulando Backend) ---
const MOCK_CAMPAIGNS = [
  { 
    id: 1, 
    name: 'Evaluación Anual NOM-035 2026', 
    guide: 'Guía de Referencia I', 
    startDate: '01 Oct 2026', 
    endDate: '15 Nov 2026', 
    status: 'active', 
    progress: 68,
    assigned: 450,
    completed: 306
  },
  { 
    id: 2, 
    name: 'Clima Laboral Q3 - Sede Norte', 
    guide: 'Encuesta Adicional', 
    startDate: '15 Sep 2026', 
    endDate: '30 Sep 2026', 
    status: 'finished', 
    progress: 100,
    assigned: 120,
    completed: 120
  },
  { 
    id: 3, 
    name: 'Sondeo Rápido: Carga Mental', 
    guide: 'Guía de Referencia II', 
    startDate: '10 Nov 2026', 
    endDate: '20 Nov 2026', 
    status: 'scheduled', 
    progress: 0,
    assigned: 85,
    completed: 0
  },
];

export default function CampanasEvaluacion() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // Renderizado de Badge de Estatus
  const StatusBadge = ({ status }) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      finished: 'bg-slate-100 text-slate-600 border-slate-200',
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    
    const labels = { active: 'Activa', finished: 'Finalizada', scheduled: 'Programada' };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
        {status === 'active' && <Clock size={12}/>}
        {status === 'finished' && <CheckCircle2 size={12}/>}
        {status === 'scheduled' && <Calendar size={12}/>}
        {labels[status]}
      </span>
    );
  };

  // Filtrado de datos
  const filteredCampaigns = MOCK_CAMPAIGNS.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER DE SECCIÓN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Campañas</h1>
          <p className="text-slate-300 text-base">Programa, configura y monitorea las evaluaciones de clima laboral y riesgo psicosocial.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#162c4a] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Plus size={18} />
          Nueva Campaña
        </button>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Buscar campaña por nombre..."
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
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="finished">Finalizadas</option>
            <option value="scheduled">Programadas</option>
          </select>
        </div>
      </div>

      {/* GRID DE TARJETAS DE CAMPAÑAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group">
              
              {/* Header de Tarjeta */}
              <div className="p-6 pb-4 border-b border-slate-50">
                <div className="flex justify-between items-start mb-3">
                  <StatusBadge status={campaign.status} />
                  <button className="text-slate-400 hover:text-[#1E3A5F] transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{campaign.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-2">
                  <FileText size={14} />
                  {campaign.guide}
                </div>
              </div>

              {/* Cuerpo de Tarjeta con Progreso */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span className="flex items-center gap-2"><Users size={14}/> Asignados: {campaign.assigned}</span>
                  <span className="font-bold text-[#1E3A5F]">{campaign.progress}%</span>
                </div>
                
                {/* Barra de Progreso */}
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      campaign.progress >= 80 ? 'bg-emerald-500' : 
                      campaign.progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${campaign.progress}%` }}
                  ></div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                  <Calendar size={14} />
                  {campaign.startDate} — {campaign.endDate}
                </div>
              </div>

              {/* Footer de Acciones Rápidas */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-colors">
                  Ver Detalles
                </button>
                {campaign.status === 'active' && (
                  <button className="flex-1 py-2 text-xs font-bold text-white bg-[#1E3A5F] rounded-lg hover:bg-[#162c4a] transition-colors">
                    Pausar
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-400"/>
            <p className="text-slate-300 font-medium">No se encontraron campañas con los filtros actuales.</p>
          </div>
        )}
      </div>

      {/* MODAL DE CREACIÓN DE CAMPAÑA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Crear Nueva Campaña</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nombre de la Campaña</label>
                <input type="text" placeholder="Ej. Evaluación Clima Q4 2026" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Guía de Referencia / Instrumento</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white">
                  <option value="">Seleccionar instrumento...</option>
                  <option value="I">Guía de Referencia I (Hasta 15 trabajadores)</option>
                  <option value="II">Guía de Referencia II (16 a 50 trabajadores)</option>
                  <option value="III">Guía de Referencia III (Más de 50 trabajadores)</option>
                  <option value="custom">Encuesta de Clima Personalizada</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha de Inicio</label>
                  <input type="date" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha de Cierre</label>
                  <input type="date" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Alcance de la Evaluación</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white">
                  <option>Toda la organización</option>
                  <option>Solo sedes seleccionadas</option>
                  <option>Departamentos específicos</option>
                </select>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex gap-2 items-start">
                <Megaphone size={16} className="shrink-0 mt-0.5" />
                <p>Las campañas activas enviarán notificaciones automáticas a los colaboradores asignados vía correo electrónico y recordatorios semanales si no han respondido.</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button onClick={() => { alert('Campaña creada exitosamente'); setShowModal(false); }} className="px-4 py-2 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#162c4a] transition-colors">Crear Campaña</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}