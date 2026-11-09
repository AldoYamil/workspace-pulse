// src/pages/OrgManagement.jsx
import { useState } from 'react';
import { 
  Building2, Users, MapPin, Plus, Search, 
  Edit2, Trash2, CheckCircle2, XCircle, Loader2 
} from 'lucide-react';
import { useCentrosTrabajo } from '../hooks/useCentrosTrabajo';
import { useAreas } from '../hooks/useAreas';
import { useUsuarios } from '../hooks/useUsuarios';

export default function OrgManagement() {
  const [activeTab, setActiveTab] = useState('sedes'); // 'sedes' | 'deptos' | 'empleados'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom Hooks para API Real
  const { centros, loading: loadingCentros, error: errorCentros, createCentro, deleteCentro } = useCentrosTrabajo();
  const { areas, loading: loadingAreas, error: errorAreas, createArea, deleteArea } = useAreas();
  const { usuarios, loading: loadingUsuarios, error: errorUsuarios, createUsuario, deleteUsuario } = useUsuarios();

  // Estados de formularios
  const [formSede, setFormSede] = useState({ nombre: '', direccion: '', num_empleados: 0, codigo_postal: '' });
  const [formDepto, setFormDepto] = useState({ nombre: '', descripcion: '', centro_trabajo: '' });
  const [formEmpleado, setFormEmpleado] = useState({ nombre: '', email: '', rol: '', centro_trabajo: '', area: '' });

  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Abrir Modal Limpio
  const handleOpenModal = () => {
    setFormError(null);
    setIsModalOpen(true);
  };

  // Manejador centralizado para guardar registros según la pestaña activa
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    let result = { success: false };

    if (activeTab === 'sedes') {
      result = await createCentro(formSede);
      if (result.success) setFormSede({ nombre: '', direccion: '', num_empleados: 0, codigo_postal: '' });
    } else if (activeTab === 'deptos') {
      result = await createArea(formDepto);
      if (result.success) setFormDepto({ nombre: '', descripcion: '', centro_trabajo: '' });
    } else if (activeTab === 'empleados') {
      result = await createUsuario(formEmpleado);
      if (result.success) setFormEmpleado({ nombre: '', email: '', rol: '', centro_trabajo: '', area: '' });
    }

    if (result.success) {
      setIsModalOpen(false);
    } else {
      setFormError(result.error);
    }
    setSubmitting(false);
  };

  // Eliminar registro activo
  const handleDelete = async (id) => {
    if (!window.confirm('¿Desea eliminar este registro?')) return;

    let result;
    if (activeTab === 'sedes') result = await deleteCentro(id);
    if (activeTab === 'deptos') result = await deleteArea(id);
    if (activeTab === 'empleados') result = await deleteUsuario(id);

    if (!result?.success) {
      alert('Error al eliminar: ' + JSON.stringify(result?.error));
    }
  };

  // Helper para renderizar mensajes de error del backend ordenadamente
  const renderErrorBox = () => {
    if (!formError) return null;
    return (
      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
        {typeof formError === 'object' ? (
          <ul className="list-disc pl-4 space-y-1">
            {Object.entries(formError).map(([key, value]) => (
              <li key={key}>
                <strong className="capitalize">{key}:</strong> {Array.isArray(value) ? value.join(', ') : String(value)}
              </li>
            ))}
          </ul>
        ) : (
          <p>{String(formError)}</p>
        )}
      </div>
    );
  };

  const renderTable = () => {
    const currentLoading = activeTab === 'sedes' ? loadingCentros : activeTab === 'deptos' ? loadingAreas : loadingUsuarios;
    const currentError = activeTab === 'sedes' ? errorCentros : activeTab === 'deptos' ? errorAreas : errorUsuarios;

    if (currentLoading) {
      return (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3 bg-white rounded-2xl shadow-xl">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm font-medium">Cargando datos desde el servidor...</p>
        </div>
      );
    }

    if (currentError) {
      return (
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-6">
          <p className="font-bold">Error de conexión</p>
          <p className="text-sm">{typeof currentError === 'object' ? JSON.stringify(currentError) : currentError}</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-white/10 overflow-hidden">
        {/* Header de Tabla */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold text-[#1E293B]">
            Gestión de {activeTab === 'deptos' ? 'Áreas / Departamentos' : activeTab === 'empleados' ? 'Empleados' : 'Sedes'}
          </h3>
          <button 
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#172A47] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
          >
            <Plus size={16} /> Nuevo Registro
          </button>
        </div>

        {/* Buscador */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Buscar ${activeTab === 'deptos' ? 'áreas' : activeTab === 'empleados' ? 'empleados' : 'sedes'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] outline-none transition-all"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">ID</th>
                {activeTab === 'sedes' && (
                  <>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Dirección</th>
                    <th className="px-6 py-4">CP</th>
                    <th className="px-6 py-4">Empleados</th>
                  </>
                )}
                {activeTab === 'deptos' && (
                  <>
                    <th className="px-6 py-4">Área / Departamento</th>
                    <th className="px-6 py-4">Descripción</th>
                    <th className="px-6 py-4">Centro de Trabajo</th>
                  </>
                )}
                {activeTab === 'empleados' && (
                  <>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Correo</th>
                    <th className="px-6 py-4">Área</th>
                    <th className="px-6 py-4">Rol</th>
                  </>
                )}
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* RENDERIZADO TABLA SEDES */}
              {activeTab === 'sedes' && centros
                .filter(c => c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{item.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.nombre}</td>
                    <td className="px-6 py-4 text-slate-600">{item.direccion || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">{item.codigo_postal || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">{item.num_empleados ?? item.numero_empleados ?? 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-[#1E3A5F] hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* RENDERIZADO TABLA ÁREAS */}
              {activeTab === 'deptos' && areas
                .filter(a => a.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{item.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.nombre}</td>
                    <td className="px-6 py-4 text-slate-600">{item.descripcion || 'Sin descripción'}</td>

                    {/* CORRECCIÓN AQUÍ: extraer .nombre si centro_trabajo es un objeto */}
                    <td className="px-6 py-4 text-slate-600">
                      {typeof item.centro_trabajo === 'object' 
                        ? item.centro_trabajo?.nombre 
                        : (item.centro_trabajo_nombre || item.centro_trabajo || 'N/A')}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-[#1E3A5F] hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* RENDERIZADO TABLA EMPLEADOS */}
              {activeTab === 'empleados' && usuarios
                .filter(u => u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{item.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.nombre}</td>
                    <td className="px-6 py-4 text-slate-600">{item.email}</td>
                    <td className="px-6 py-4 text-slate-600">{item.area_nombre || item.area || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">{item.rol || 'Colaborador'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-[#1E3A5F] hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
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
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Estructura Organizacional</h1>
        <p className="text-slate-300 text-base">Administra sedes, áreas y colaboradores sincronizados con el backend.</p>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-xl inline-flex gap-1 border border-white/10">
        {[
          { id: 'sedes', label: 'Centros de Trabajo', icon: MapPin },
          { id: 'deptos', label: 'Áreas / Departamentos', icon: Building2 },
          { id: 'empleados', label: 'Empleados / Usuarios', icon: Users }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
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

      {/* Contenido Tabla */}
      {renderTable()}

      {/* Modal Dinámico de Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-[#1E293B]">
                {activeTab === 'sedes' && 'Nuevo Centro de Trabajo'}
                {activeTab === 'deptos' && 'Nueva Área / Departamento'}
                {activeTab === 'empleados' && 'Nuevo Empleado'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle size={20}/>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {renderErrorBox()}

                {/* FORMULARIO DE SEDES */}
                {activeTab === 'sedes' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nombre del Centro</label>
                      <input 
                        type="text" required value={formSede.nombre}
                        onChange={(e) => setFormSede({ ...formSede, nombre: e.target.value })}
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder="Ej. Planta Monterrey"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Dirección Completa</label>
                      <input 
                        type="text" required value={formSede.direccion}
                        onChange={(e) => setFormSede({ ...formSede, direccion: e.target.value })}
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder="Ej. Av. Reforma 123"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Total Empleados</label>
                      <input 
                        type="number" min="1" required value={formSede.num_empleados}
                        onChange={(e) => setFormSede({ ...formSede, num_empleados: parseInt(e.target.value) || 0 })}
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Código Postal</label>
                      <input 
                        type="text" required value={formSede.codigo_postal}
                        onChange={(e) => setFormSede({ ...formSede, codigo_postal: e.target.value })}
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder="Ej. 64000"
                      />
                    </div>
                  </>
                )}

                {/* FORMULARIO DE ÁREAS */}
                {activeTab === 'deptos' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nombre del Área</label>
                      <input 
                        type="text" required value={formDepto.nombre}
                        onChange={(e) => setFormDepto({ ...formDepto, nombre: e.target.value })}
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder="Ej. Recursos Humanos"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Descripción</label>
                      <input 
                        type="text" value={formDepto.descripcion}
                        onChange={(e) => setFormDepto({ ...formDepto, descripcion: e.target.value })}
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder="Ej. Gestión del talento humano"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Centro de Trabajo</label>
                      <select 
                        required value={formDepto.centro_trabajo}
                        onChange={(e) => setFormDepto({ ...formDepto, centro_trabajo: e.target.value })}
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                      >
                        <option value="">Seleccione un Centro...</option>
                        {centros.map((c) => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* FORMULARIO DE EMPLEADOS */}
                {activeTab === 'empleados' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nombre Completo</label>
                      <input 
                        type="text" required value={formEmpleado.nombre}
                        onChange={(e) => setFormEmpleado({ ...formEmpleado, nombre: e.target.value })}
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Correo Electrónico</label>
                      <input 
                        type="email" required value={formEmpleado.email}
                        onChange={(e) => setFormEmpleado({ ...formEmpleado, email: e.target.value })}
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder="ejemplo@empresa.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Centro de Trabajo</label>
                      <select 
                        required value={formEmpleado.centro_trabajo}
                        onChange={(e) => setFormEmpleado({ ...formEmpleado, centro_trabajo: e.target.value })}
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                      >
                        <option value="">Seleccione un Centro...</option>
                        {centros.map((c) => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Área / Departamento</label>
                      <select 
                        required value={formEmpleado.area}
                        onChange={(e) => setFormEmpleado({ ...formEmpleado, area: e.target.value })}
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                      >
                        <option value="">Seleccione un Área...</option>
                        {areas.map((a) => (
                          <option key={a.id} value={a.id}>{a.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={submitting}
                  className="px-4 py-2 text-sm font-bold text-white bg-[#1E3A5F] hover:bg-[#172A47] rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={14} />}
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}