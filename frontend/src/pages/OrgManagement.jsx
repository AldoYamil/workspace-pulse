// src/pages/OrgManagement.jsx
import { useState } from 'react';
import { 
  Building2, Users, MapPin, Plus, Search, 
  Edit2, Trash2, CheckCircle2, XCircle, Loader2 
} from 'lucide-react';
import { useCentrosTrabajo } from '../hooks/useCentrosTrabajo';

// Mocks temporales solo para Departamentos y Empleados (se reemplazarán cuando conectes sus APIs)
const MOCK_DEPTS = [
  { id: 1, name: 'Recursos Humanos', sede: 'Sede Central CDMX', head: 'María González', status: 'active' },
  { id: 2, name: 'Logística y Almacén', sede: 'Planta Monterrey', head: 'Carlos Ruiz', status: 'active' },
];

const MOCK_EMPLOYEES = [
  { id: 1, name: 'Juan Pérez', email: 'juan.perez@empresa.com', dept: 'Recursos Humanos', role: 'Gerente RH', status: 'active' },
];

export default function OrgManagement() {
  const [activeTab, setActiveTab] = useState('sedes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom Hook para API de Backend
  const { centros, loading, error, createCentro, deleteCentro } = useCentrosTrabajo();

  // Estado del formulario de creación para Centro de Trabajo
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    num_empleados: 0,
    codigo_postal: '',
    empresa: 1, // ID de la empresa por defecto o contexto
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const result = await createCentro(formData);
    
    if (result.success) {
      setIsModalOpen(false);
      setFormData({ nombre: '', direccion: '', num_empleados: 0, codigo_postal: '', empresa: 1 });
    } else {
      setFormError(result.error);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Desea eliminar este Centro de Trabajo?')) {
      const result = await deleteCentro(id);
      if (!result.success) {
        alert('Error al eliminar: ' + JSON.stringify(result.error));
      }
    }
  };

  const renderTable = () => {
    if (activeTab === 'sedes') {
      if (loading) {
        return (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm font-medium">Cargando centros de trabajo desde el servidor...</p>
          </div>
        );
      }

      if (error) {
        return (
          <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-6">
            <p className="font-bold">Error de conexión</p>
            <p className="text-sm">{typeof error === 'object' ? JSON.stringify(error) : error}</p>
          </div>
        );
      }

      const filteredCentros = centros.filter(c => 
        c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return (
        <div className="bg-white rounded-2xl shadow-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-bold text-[#1E293B]">Gestión de Sedes (Centros de Trabajo)</h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#172A47] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
            >
              <Plus size={16} /> Nuevo Centro
            </button>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] outline-none transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Dirección</th>
                  <th className="px-6 py-4">Empleados</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCentros.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{item.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.nombre}</td>
                    <td className="px-6 py-4 text-slate-600">{item.direccion || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">{item.num_empleados || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-[#1E3A5F] hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
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
    }

    // Pestañas secundarias (Mocks)
    return (
      <div className="bg-white p-8 rounded-2xl shadow border text-center text-slate-500">
        Pestaña en desarrollo ({activeTab})
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Estructura Organizacional</h1>
        <p className="text-slate-300 text-base">Administra centros de trabajo y estructura interna en sincronía con el backend.</p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-xl inline-flex gap-1 border border-white/10">
        {[
          { id: 'sedes', label: 'Centros de Trabajo', icon: MapPin },
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

      {renderTable()}

      {/* Modal de Alta Conectado con POST */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-[#1E293B]">Nuevo Centro de Trabajo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle size={20}/>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">
                    {JSON.stringify(formError)}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nombre del Centro</label>
                  <input 
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                    placeholder="Ej. Planta Monterrey"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Dirección Completa</label>
                  <input 
                    type="text"
                    required
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                    placeholder="Ej. Av. Reforma 123"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Total Empleados</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={formData.num_empleados}
                    onChange={(e) => setFormData({ ...formData, num_empleados: parseInt(e.target.value) || 0 })}
                    className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Codigo Postal</label>
                  <input 
                    type="text"
                    required
                    value={formData.codigo_postal}
                    onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                    className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                    placeholder=""
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-bold text-white bg-[#1E3A5F] hover:bg-[#172A47] rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={14} />}
                  Guardar Centro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}