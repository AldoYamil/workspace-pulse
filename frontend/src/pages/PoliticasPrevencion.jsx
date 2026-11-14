// src/pages/PoliticasPrevencion.jsx
import { useState } from 'react';
import { 
  FileText, Download, Eye, Plus, Search, Filter, 
  ShieldCheck, Calendar, Building2, AlertCircle, Printer 
} from 'lucide-react';

// --- DATOS MOCK (Simulando Backend) ---
const MOCK_POLICIES = [
  { 
    id: 1, 
    title: 'Política de Prevención de Riesgos Psicosociales', 
    company: 'WorkSpace Pulse Demo Corp.', 
    workplace: 'Todas las sedes', 
    version: 'v3.2', 
    effectiveDate: '01 Ene 2026', 
    reviewDate: '01 Ene 2027', 
    status: 'vigente',
    fileSize: '2.4 MB'
  },
  { 
    id: 2, 
    title: 'Protocolo de Atención a Violencia Laboral', 
    company: 'WorkSpace Pulse Demo Corp.', 
    workplace: 'Sede Central CDMX', 
    version: 'v2.0', 
    effectiveDate: '15 Mar 2026', 
    reviewDate: '15 Mar 2027', 
    status: 'vigente',
    fileSize: '1.8 MB'
  },
  { 
    id: 3, 
    title: 'Lineamientos de Jornada Laboral y Descansos', 
    company: 'WorkSpace Pulse Demo Corp.', 
    workplace: 'Planta Industrial Monterrey', 
    version: 'v1.5', 
    effectiveDate: '10 Jun 2025', 
    reviewDate: '10 Jun 2026', 
    status: 'por_revisar',
    fileSize: '980 KB'
  },
];

export default function PoliticasPrevencion() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // Renderizado de Badge de Estatus
  const StatusBadge = ({ status }) => {
    const styles = {
      vigente: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      por_revisar: 'bg-amber-100 text-amber-700 border-amber-200',
      obsoleta: 'bg-slate-100 text-slate-500 border-slate-200',
    };
    
    const labels = { vigente: 'Vigente', por_revisar: 'Por Revisar', obsoleta: 'Obsoleta' };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
        {status === 'vigente' && <ShieldCheck size={12}/>}
        {status === 'por_revisar' && <AlertCircle size={12}/>}
        {labels[status]}
      </span>
    );
  };

  // Filtrado de datos
  const filteredPolicies = MOCK_POLICIES.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          policy.workplace.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER DE SECCIÓN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Políticas de Prevención</h1>
          <p className="text-slate-300 text-base">Repositorio oficial de documentos institucionales de cumplimiento NOM-035-STPS-2018.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#162c4a] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Plus size={18} />
          Nueva Política
        </button>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o centro de trabajo..."
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
            <option value="vigente">Vigentes</option>
            <option value="por_revisar">Por Revisar</option>
          </select>
        </div>
      </div>

      {/* GRID DE DOCUMENTOS (Diseño tipo repositorio, no tabla) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPolicies.length > 0 ? (
          filteredPolicies.map((policy) => (
            <div key={policy.id} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group">
              
              {/* Icono y Estatus */}
              <div className="p-6 pb-4 flex justify-between items-start">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#1E3A5F]">
                  <FileText size={24} />
                </div>
                <StatusBadge status={policy.status} />
              </div>

              {/* Contenido Principal */}
              <div className="px-6 pb-4 space-y-3">
                <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2">{policy.title}</h3>
                
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{policy.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span>Vigencia: {policy.effectiveDate} — {policy.reviewDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-slate-400 shrink-0" />
                    <span>{policy.version} • {policy.fileSize}</span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-colors">
                  <Eye size={14} />
                  Vista Previa
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-white bg-[#1E3A5F] rounded-lg hover:bg-[#162c4a] transition-colors">
                  <Download size={14} />
                  Descargar PDF
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-400"/>
            <p className="text-slate-300 font-medium">No se encontraron políticas con los filtros actuales.</p>
          </div>
        )}
      </div>

      {/* NOTA LEGAL OBLIGATORIA */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-slate-300 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-300 leading-relaxed">
          Según la NOM-035-STPS-2018, las políticas de prevención deben estar disponibles para todos los trabajadores, 
          actualizarse al menos cada año o cuando cambien las condiciones laborales, y conservarse por 5 años. 
          Este repositorio cumple con el requisito de disponibilidad documental ante auditorías STPS.
        </p>
      </div>

      {/* MODAL DE CREACIÓN (Simulado) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Nueva Política de Prevención</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nombre de la Política</label>
                <input type="text" placeholder="Ej. Política de Prevención de Acoso Laboral" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Empresa / Razón Social</label>
                  <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white">
                    <option>WorkSpace Pulse Demo Corp.</option>
                    <option>Sucursal Norte S.A. de C.V.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Centro de Trabajo</label>
                  <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white">
                    <option>Todas las sedes</option>
                    <option>Sede Central CDMX</option>
                    <option>Planta Industrial Monterrey</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha de Vigencia</label>
                  <input type="date" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha de Revisión</label>
                  <input type="date" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Archivo PDF</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#1E3A5F] transition-colors cursor-pointer">
                  <FileText size={24} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">Arrastra el archivo o haz clic para seleccionar</p>
                  <p className="text-xs text-slate-400 mt-1">PDF máximo 10MB</p>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex gap-2 items-start">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>Al publicar esta política, se notificará automáticamente a todos los colaboradores del centro de trabajo seleccionado y quedará disponible en su portal de empleado.</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button onClick={() => { alert('Política publicada exitosamente'); setShowModal(false); }} className="px-4 py-2 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#162c4a] transition-colors">Publicar Política</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}