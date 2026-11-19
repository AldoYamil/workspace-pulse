// src/pages/Capacitaciones.jsx
import { useState } from 'react';
import { 
  GraduationCap, Calendar, Users, FileText, Download, 
  Search, Filter, Plus, CheckCircle2, Clock, AlertCircle, Printer 
} from 'lucide-react';

// --- DATOS MOCK (Simulando Backend de Diego) ---
const MOCK_TRAININGS = [
  { 
    id: 1, 
    title: 'Taller: Prevención de Violencia Laboral', 
    type: 'Obligatorio NOM-035', 
    date: '15 Oct 2026', 
    instructor: 'Dra. Elena Ríos',
    attendees: 45,
    totalAssigned: 50,
    status: 'completed',
    evidenceAvailable: true
  },
  { 
    id: 2, 
    title: 'Curso: Manejo del Estrés y Burnout', 
    type: 'Plan de Acción Q3', 
    date: '28 Sep 2026', 
    instructor: 'Lic. Marco Vega',
    attendees: 38,
    totalAssigned: 40,
    status: 'completed',
    evidenceAvailable: true
  },
  { 
    id: 3, 
    title: 'Plática: Liderazgo Empático', 
    type: 'Desarrollo Directivo', 
    date: '10 Nov 2026', 
    instructor: 'Ext. Consultora RH',
    attendees: 12,
    totalAssigned: 15,
    status: 'scheduled',
    evidenceAvailable: false
  },
  { 
    id: 4, 
    title: 'Seminario: Ergonomía Cognitiva', 
    type: 'Bienestar Integral', 
    date: '05 Ago 2026', 
    instructor: 'Ing. Sara Luna',
    attendees: 20,
    totalAssigned: 25,
    status: 'completed',
    evidenceAvailable: true
  },
];

export default function Capacitaciones() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // Función simulada para descargar evidencia
  const handleDownloadEvidence = (id) => {
    alert(`Descargando lista de asistencia y evidencia fotográfica del taller #${id} en PDF...`);
  };

  // Renderizado de Badge de Estatus
  const StatusBadge = ({ status }) => {
    const styles = {
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    
    const labels = {
      completed: 'Completado',
      scheduled: 'Programado',
      cancelled: 'Cancelado',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.scheduled}`}>
        {status === 'completed' && <CheckCircle2 size={12}/>}
        {status === 'scheduled' && <Clock size={12}/>}
        {labels[status]}
      </span>
    );
  };

  // Filtrado de datos
  const filteredTrainings = MOCK_TRAININGS.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          training.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || training.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER DE SECCIÓN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Registro de Capacitaciones</h1>
          <p className="text-slate-300 text-base">Seguimiento de talleres, cursos y evidencia de asistencia vinculados a planes de acción.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#162c4a] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Plus size={18} />
          Registrar Nueva Capacitación
        </button>
      </div>

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-300">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-slate-300 text-sm">Capacitaciones Completadas</p>
            <p className="text-2xl font-bold text-white">12</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-300">
            <Users size={24} />
          </div>
          <div>
            <p className="text-slate-300 text-sm">Asistencia Promedio</p>
            <p className="text-2xl font-bold text-white">87%</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-lg text-amber-300">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-slate-300 text-sm">Próximas Sesiones</p>
            <p className="text-2xl font-bold text-white">3</p>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Buscar por nombre de taller o instructor..."
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
            <option value="completed">Completados</option>
            <option value="scheduled">Programados</option>
          </select>
        </div>
      </div>

      {/* TABLA DE REGISTRO HISTÓRICO */}
      <div className="bg-white rounded-2xl shadow-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-xs border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Nombre de la Capacitación</th>
                <th className="px-6 py-4">Tipo / Vinculación</th>
                <th className="px-6 py-4">Fecha e Instructor</th>
                <th className="px-6 py-4">Asistencia</th>
                <th className="px-6 py-4">Estatus</th>
                <th className="px-6 py-4 text-right">Evidencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrainings.length > 0 ? (
                filteredTrainings.map((training) => (
                  <tr key={training.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{training.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                        {training.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 font-medium">{training.date}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Imparte: {training.instructor}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                          <div 
                            className={`h-full rounded-full ${
                              (training.attendees / training.totalAssigned) >= 0.8 ? 'bg-emerald-500' : 
                              (training.attendees / training.totalAssigned) >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(training.attendees / training.totalAssigned) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-16 text-right">
                          {training.attendees}/{training.totalAssigned}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={training.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {training.evidenceAvailable ? (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDownloadEvidence(training.id)}
                            title="Descargar Evidencia PDF"
                            className="p-2 text-slate-400 hover:text-[#1E3A5F] hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FileText size={18} />
                          </button>
                          <button 
                            onClick={() => handleDownloadEvidence(training.id)}
                            title="Imprimir Lista de Asistencia"
                            className="p-2 text-slate-400 hover:text-[#1E3A5F] hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Printer size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Pendiente</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300"/>
                    No se encontraron capacitaciones con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NOTA LEGAL / PIE DE PÁGINA INFORMATIVO */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-start gap-3">
        <GraduationCap className="w-5 h-5 text-slate-300 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-300 leading-relaxed">
          Según la NOM-035-STPS-2018, toda capacitación preventiva debe contar con evidencia documental (lista de asistencia firmada, material didáctico y fotografías). 
          Estos registros son obligatorios para auditorías de la STPS y deben conservarse por al menos 5 años.
        </p>
      </div>

      {/* MODAL DE REGISTRO (Simulado) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Registrar Nueva Capacitación</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Taller/Curso</label>
                <input type="text" placeholder="Ej. Manejo de Estrés Laboral" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                  <input type="date" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Instructor</label>
                  <input type="text" placeholder="Nombre del facilitador" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vinculación a Plan de Acción</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white">
                  <option>Seleccionar plan relacionado...</option>
                  <option>Plan de Acción Q3 - Riesgo Alto</option>
                  <option>Medida Preventiva General</option>
                </select>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                Recuerda subir la lista de asistencia y evidencias fotográficas después de realizar la sesión.
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button onClick={() => { alert('Capacitación registrada'); setShowModal(false); }} className="px-4 py-2 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#162c4a] transition-colors">Guardar Registro</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}