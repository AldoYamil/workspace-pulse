// src/pages/OrgManagement.jsx
import { useState } from 'react';
import { 
  Building2, Users, MapPin, Plus, Search, 
  Edit2, Trash2, CheckCircle2, XCircle 
} from 'lucide-react';

// --- DATOS MOCK (Simulando Backend) ---
const MOCK_SEDES = [
  { id: 1, name: 'Sede Central CDMX', address: 'Av. Reforma 222, CDMX', employees: 450, status: 'active' },
  { id: 2, name: 'Planta Monterrey', address: 'Parque Industrial Apodaca, NL', employees: 320, status: 'active' },
  { id: 3, name: 'Oficina Guadalajara', address: 'Providencia, GDL', employees: 85, status: 'inactive' },
];

const MOCK_DEPTS = [
  { id: 1, name: 'Recursos Humanos', sede: 'Sede Central CDMX', head: 'María González', status: 'active' },
  { id: 2, name: 'Logística y Almacén', sede: 'Planta Monterrey', head: 'Carlos Ruiz', status: 'active' },
  { id: 3, name: 'Atención al Cliente', sede: 'Oficina Guadalajara', head: 'Ana López', status: 'active' },
];

const MOCK_EMPLOYEES = [
  { id: 1, name: 'Juan Pérez', email: 'juan.perez@empresa.com', dept: 'Recursos Humanos', role: 'Gerente RH', status: 'active' },
  { id: 2, name: 'Laura Sánchez', email: 'laura.sanchez@empresa.com', dept: 'Logística', role: 'Supervisora', status: 'active' },
  { id: 3, name: 'Roberto Díaz', email: 'roberto.diaz@empresa.com', dept: 'Atención al Cliente', role: 'Analista', status: 'inactive' },
];

export default function OrgManagement() {
  const [activeTab, setActiveTab] = useState('sedes'); // 'sedes' | 'deptos' | 'empleados'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para renderizar la tabla según la pestaña activa
  const renderTable = () => {
    let data = [];
    let columns = [];

    if (activeTab === 'sedes') {
      data = MOCK_SEDES;
      columns = ['Nombre', 'Dirección', 'Empleados', 'Estado'];
    } else if (activeTab === 'deptos') {
      data = MOCK_DEPTS;
      columns = ['Departamento', 'Sede Asignada', 'Responsable', 'Estado'];
    } else {
      data = MOCK_EMPLOYEES;
      columns = ['Nombre', 'Correo', 'Departamento', 'Rol', 'Estado'];
    }

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-white/10 overflow-hidden">
        {/* Header de Tabla */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold text-[#1E293B] capitalize">
            Gestión de {activeTab === 'deptos' ? 'Departamentos' : activeTab === 'empleados' ? 'Empleados' : 'Sedes'}
          </h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#172A47] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
          >
            <Plus size={16} /> Nuevo Registro
          </button>
        </div>

        {/* Buscador Interno */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Buscar ${activeTab === 'deptos' ? 'departamentos' : activeTab === 'empleados' ? 'empleados' : 'sedes'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] outline-none transition-all"
            />
          </div>
        </div>

        {/* Tabla de Datos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-xs">
              <tr>
                {columns.map((col, idx) => <th key={idx} className="px-6 py-4">{col}</th>)}
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Renderizado dinámico de celdas según tipo */}
                  {activeTab === 'sedes' && (
                    <>
                      <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                      <td className="px-6 py-4 text-slate-600">{item.address}</td>
                      <td className="px-6 py-4 text-slate-600">{item.employees}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${item.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {item.status === 'active' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                          {item.status === 'active' ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                    </>
                  )}
                  {activeTab === 'deptos' && (
                    <>
                      <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                      <td className="px-6 py-4 text-slate-600">{item.sede}</td>
                      <td className="px-6 py-4 text-slate-600">{item.head}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                          <CheckCircle2 size={12}/> Activo
                        </span>
                      </td>
                    </>
                  )}
                  {activeTab === 'empleados' && (
                    <>
                      <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                      <td className="px-6 py-4 text-slate-600">{item.email}</td>
                      <td className="px-6 py-4 text-slate-600">{item.dept}</td>
                      <td className="px-6 py-4 text-slate-600">{item.role}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${item.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {item.status === 'active' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                          {item.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </>
                  )}
                  
                  {/* Columna de Acciones */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-[#1E3A5F] hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    // CONTENIDO PARA DASHBOARDLAYOUT (Fondo azul manejado por el Layout padre)
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER DE SECCIÓN (Texto claro para contraste sobre azul) */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Estructura Organizacional</h1>
        <p className="text-slate-300 text-base">Administra sedes, departamentos y la plantilla de colaboradores para mapear el contexto de las evaluaciones.</p>
      </div>

      {/* TABS DE NAVEGACIÓN INTERNA (Estilo Glassmorphism para integrarse con el azul) */}
      <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-xl inline-flex gap-1 border border-white/10">
        {[
          { id: 'sedes', label: 'Sedes', icon: MapPin },
          { id: 'deptos', label: 'Departamentos', icon: Building2 },
          { id: 'empleados', label: 'Empleados', icon: Users }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 
              ${activeTab === tab.id 
                ? 'bg-white text-[#1E3A5F] shadow-md' 
                : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO DINÁMICO (TABLA) */}
      {renderTable()}

      {/* MODAL SIMULADO (Placeholder para formulario de alta) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-[#1E293B]">Nuevo Registro</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><XCircle size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Aquí iría el formulario específico para crear una nueva {activeTab.slice(0, -1)}.</p>
              <div className="h-32 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                Campos del formulario...
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button className="px-4 py-2 text-sm font-bold text-white bg-[#1E3A5F] hover:bg-[#172A47] rounded-lg shadow-sm transition-colors">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}