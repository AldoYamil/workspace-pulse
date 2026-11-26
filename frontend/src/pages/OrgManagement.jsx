// src/pages/OrgManagement.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Building2, Users, MapPin, Briefcase, Plus, Search, 
  Edit2, Trash2, XCircle, Loader2, RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; 
import api from '../api/axios';
import { useCentrosTrabajo } from '../hooks/useCentrosTrabajo';
import { useAreas } from '../hooks/useAreas';
import { useUsuarios } from '../hooks/useUsuarios';

export default function OrgManagement() {
  const [activeTab, setActiveTab] = useState('sedes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  
  const [currentEmpresaId, setCurrentEmpresaId] = useState(null);

  const {
    centros,
    loading: loadingCentros,
    error: errorCentros,
    createCentro,
    updateCentro,
    deleteCentro,
    refetch: refetchCentros,
  } = useCentrosTrabajo();

  const {
    areas,
    loading: loadingAreas,
    error: errorAreas,
    createArea,
    updateArea,
    deleteArea,
    refetch: refetchAreas,
  } = useAreas();

  const {
    usuarios,
    loading: loadingUsuarios,
    error: errorUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    refetch: refetchUsuarios,
  } = useUsuarios();

  // Estado local para Puestos de Trabajo (CRUD conectado directamente a /api/v1/puesto/...)
  const [puestos, setPuestos] = useState([]);
  const [loadingPuestos, setLoadingPuestos] = useState(false);
  const [errorPuestos, setErrorPuestos] = useState(null);

  const [formSede, setFormSede] = useState({
    nombre: '',
    direccion: '',
    num_empleados: 1,
    codigo_postal: '',
  });

  const [formDepto, setFormDepto] = useState({
    nombre: '',
    descripcion: '',
    centro_trabajo: '',
  });

  const [formPuesto, setFormPuesto] = useState({
    nombre: '',
    area: '',
  });

  const [formEmpleado, setFormEmpleado] = useState({
    nombre: '',
    email: '',
    password_hash: '',
    rol: 'empleado',
    puesto: '',
    centro_trabajo: '',
    area: '',
  });

  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Obtiene la empresa del usuario logueado desde /me/ y Supabase
  useEffect(() => {
    const fetchEmpresaUsuario = async () => {
      try {
        const res = await api.get('me/');
        const empFromMe =
          res.data?.empresa_id ??
          (typeof res.data?.empresa === 'object' ? res.data.empresa?.id : res.data?.empresa);

        if (empFromMe) {
          setCurrentEmpresaId(Number(empFromMe));
          return;
        }
      } catch (err) {
        console.warn('No se pudo obtener empresa desde /me/, intentando metadata:', err);
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const empId = user.user_metadata?.empresa_id || user.user_metadata?.empresa;
          if (empId) setCurrentEmpresaId(Number(empId));
        }
      } catch (err) {
        console.error('Error al obtener sesión de usuario en Supabase:', err);
      }
    };

    fetchEmpresaUsuario();
  }, []);

  // Carga los puestos de trabajo desde el backend
  const fetchPuestos = useCallback(async () => {
    setLoadingPuestos(true);
    setErrorPuestos(null);
    try {
      const res = await api.get('v1/puesto/list/');
      setPuestos(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch (err) {
      // Si el usuario aún no tiene centro_trabajo en su perfil, mostramos lista vacía sin romper la vista
      if (err.response?.status === 400) {
        setPuestos([]);
      } else {
        setErrorPuestos(err.response?.data || err.message);
      }
    } finally {
      setLoadingPuestos(false);
    }
  }, []);

  useEffect(() => {
    fetchPuestos();
  }, [fetchPuestos]);

  // Extrae el ID de empresa de cualquier registro
  const getRecordEmpresaId = (record) => {
    if (!record) return null;
    if (record.empresa_id != null) return Number(record.empresa_id);
    if (typeof record.empresa === 'object' && record.empresa !== null) {
      return Number(record.empresa.id);
    }
    if (record.empresa != null) return Number(record.empresa);
    return null;
  };

  // Listas filtradas estrictamente por la empresa del administrador actual
  const centrosEmpresa = useMemo(() => {
    if (!currentEmpresaId) return centros;
    return centros.filter((c) => getRecordEmpresaId(c) === currentEmpresaId);
  }, [centros, currentEmpresaId]);

  const centrosIdsEmpresa = useMemo(
    () => new Set(centrosEmpresa.map((c) => Number(c.id))),
    [centrosEmpresa]
  );

  const areasEmpresa = useMemo(() => {
    if (!currentEmpresaId) return areas;
    return areas.filter((a) => {
      const empId = getRecordEmpresaId(a);
      if (empId != null) return empId === currentEmpresaId;
      const centroId =
        typeof a.centro_trabajo === 'object' ? a.centro_trabajo?.id : a.centro_trabajo;
      return centroId != null && centrosIdsEmpresa.has(Number(centroId));
    });
  }, [areas, currentEmpresaId, centrosIdsEmpresa]);

  const areasIdsEmpresa = useMemo(
    () => new Set(areasEmpresa.map((a) => Number(a.id))),
    [areasEmpresa]
  );

  const puestosEmpresa = useMemo(() => {
    if (!currentEmpresaId) return puestos;
    return puestos.filter((p) => {
      const areaObj = typeof p.area === 'object' ? p.area : null;
      const centroObj =
        areaObj && typeof areaObj.centro_trabajo === 'object' ? areaObj.centro_trabajo : null;
      const empId = getRecordEmpresaId(centroObj);
      if (empId != null) return empId === currentEmpresaId;

      const areaId = areaObj ? areaObj.id : p.area;
      return areaId != null && areasIdsEmpresa.has(Number(areaId));
    });
  }, [puestos, currentEmpresaId, areasIdsEmpresa]);

  const usuariosEmpresa = useMemo(() => {
    if (!currentEmpresaId) return usuarios;
    return usuarios.filter((u) => {
      const empId = getRecordEmpresaId(u);
      if (empId != null) return empId === currentEmpresaId;
      const centroId =
        typeof u.centro_trabajo === 'object' ? u.centro_trabajo?.id : u.centro_trabajo;
      return centroId != null && centrosIdsEmpresa.has(Number(centroId));
    });
  }, [usuarios, currentEmpresaId, centrosIdsEmpresa]);

  const resetForms = () => {
    setFormSede({ nombre: '', direccion: '', num_empleados: 1, codigo_postal: '' });
    setFormDepto({ nombre: '', descripcion: '', centro_trabajo: '' });
    setFormPuesto({ nombre: '', area: '' });
    setFormEmpleado({
      nombre: '',
      email: '',
      password_hash: '',
      rol: 'empleado',
      puesto: '',
      centro_trabajo: '',
      area: '',
    });
    setEditingItem(null);
    setFormError(null);
  };

  const handleOpenCreateModal = () => {
    resetForms();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setFormError(null);
    setEditingItem(item);

    if (activeTab === 'sedes') {
      setFormSede({
        nombre: item.nombre || '',
        direccion: item.direccion || '',
        num_empleados: item.num_empleados ?? item.numero_empleados ?? 1,
        codigo_postal: item.codigo_postal || '',
      });
    } else if (activeTab === 'deptos') {
      const centroId =
        typeof item.centro_trabajo === 'object' ? item.centro_trabajo?.id : item.centro_trabajo;
      setFormDepto({
        nombre: item.nombre || '',
        descripcion: item.descripcion || '',
        centro_trabajo: centroId ? String(centroId) : '',
      });
    } else if (activeTab === 'puestos') {
      const areaId = typeof item.area === 'object' ? item.area?.id : item.area;
      setFormPuesto({
        nombre: item.nombre || '',
        area: areaId ? String(areaId) : '',
      });
    } else if (activeTab === 'empleados') {
      const centroId =
        typeof item.centro_trabajo === 'object' ? item.centro_trabajo?.id : item.centro_trabajo;
      const areaId = typeof item.area === 'object' ? item.area?.id : item.area;
      setFormEmpleado({
        nombre: item.nombre || '',
        email: item.email || '',
        password_hash: '',
        rol: item.rol || 'empleado',
        puesto: item.puesto || item.puesto_trabajo || item.cargo || '',
        centro_trabajo: centroId ? String(centroId) : '',
        area: areaId ? String(areaId) : '',
      });
    }

    setIsModalOpen(true);
  };

  // Ejecuta PATCH intentando primero la URL exacta y reintentando con/sin barra final si da 404
  const smartPatch = async (basePathWithoutSlash, payload) => {
    try {
      await api.patch(basePathWithoutSlash, payload);
      return { success: true };
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          await api.patch(`${basePathWithoutSlash}/`, payload);
          return { success: true };
        } catch (err2) {
          return { success: false, error: err2.response?.data || err2.message };
        }
      }
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const smartDelete = async (basePathWithoutSlash) => {
    try {
      await api.delete(basePathWithoutSlash);
      return { success: true };
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          await api.delete(`${basePathWithoutSlash}/`);
          return { success: true };
        } catch (err2) {
          return { success: false, error: err2.response?.data || err2.message };
        }
      }
      return { success: false, error: err.response?.data || err.message };
    }
  };

  const handleRefreshData = async () => {
    if (activeTab === 'sedes' && typeof refetchCentros === 'function') await refetchCentros();
    if (activeTab === 'deptos' && typeof refetchAreas === 'function') await refetchAreas();
    if (activeTab === 'puestos') await fetchPuestos();
    if (activeTab === 'empleados' && typeof refetchUsuarios === 'function') await refetchUsuarios();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    let result = { success: false };
    const empresaIdAEnviar = currentEmpresaId || 1;
    const isEditing = Boolean(editingItem);

    if (activeTab === 'sedes') {
      const payload = {
        ...formSede,
        empresa: empresaIdAEnviar,
      };
      if (isEditing) {
        result =
          typeof updateCentro === 'function'
            ? await updateCentro(editingItem.id, payload)
            : await smartPatch(`v1/centrotrabajo/update/${editingItem.id}`, payload);
        if (result.success && typeof refetchCentros === 'function') await refetchCentros();
      } else {
        result = await createCentro(payload);
      }
    } else if (activeTab === 'deptos') {
      const payload = {
        ...formDepto,
        centro_trabajo: Number(formDepto.centro_trabajo),
        empresa: empresaIdAEnviar,
      };
      if (isEditing) {
        result =
          typeof updateArea === 'function'
            ? await updateArea(editingItem.id, payload)
            : await smartPatch(`v1/area/update/${editingItem.id}`, payload);
        if (result.success && typeof refetchAreas === 'function') await refetchAreas();
      } else {
        result = await createArea(payload);
      }
    } else if (activeTab === 'puestos') {
      const payload = {
        nombre: formPuesto.nombre.trim(),
        area: Number(formPuesto.area),
      };
      if (isEditing) {
        result = await smartPatch(`v1/puesto/update/${editingItem.id}`, payload);
      } else {
        try {
          await api.post('v1/puesto/create/', payload);
          result = { success: true };
        } catch (err) {
          result = { success: false, error: err.response?.data || err.message };
        }
      }
      if (result.success) await fetchPuestos();
    } else if (activeTab === 'empleados') {
      const payload = {
        nombre: formEmpleado.nombre.trim(),
        email: formEmpleado.email.trim().toLowerCase(),
        rol: formEmpleado.rol,
        puesto: formEmpleado.puesto.trim(),
        centro_trabajo: Number(formEmpleado.centro_trabajo),
        area: formEmpleado.area ? Number(formEmpleado.area) : null,
        empresa: empresaIdAEnviar,
      };

      if (formEmpleado.password_hash) {
        payload.password_hash = formEmpleado.password_hash;
      }

      if (isEditing) {
        result =
          typeof updateUsuario === 'function'
            ? await updateUsuario(editingItem.id, payload)
            : await smartPatch(`v1/usuario/update/${editingItem.id}`, payload);
        if (result.success && typeof refetchUsuarios === 'function') await refetchUsuarios();
      } else {
        result = await createUsuario(payload);
      }
    }

    if (result.success) {
      resetForms();
      setIsModalOpen(false);
    } else {
      setFormError(result.error);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desea eliminar este registro?')) return;

    let result;
    if (activeTab === 'sedes') result = await deleteCentro(id);
    if (activeTab === 'deptos') result = await deleteArea(id);
    if (activeTab === 'puestos') {
      result = await smartDelete(`v1/puesto/delete/${id}`);
      if (result?.success) await fetchPuestos();
    }
    if (activeTab === 'empleados') result = await deleteUsuario(id);

    if (!result?.success) {
      alert('Error al eliminar: ' + JSON.stringify(result?.error));
    }
  };

  const renderErrorBox = () => {
    if (!formError) return null;
    const isHtml = typeof formError === 'string' && formError.trim().startsWith('<!DOCTYPE');
    return (
      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
        {isHtml ? (
          <p>Error del servidor: ruta o método no encontrado (404/405).</p>
        ) : typeof formError === 'object' ? (
          <ul className="list-disc pl-4 space-y-1">
            {Object.entries(formError).map(([key, value]) => (
              <li key={key}>
                <strong className="capitalize">{key}:</strong>{' '}
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </li>
            ))}
          </ul>
        ) : (
          <p>{String(formError)}</p>
        )}
      </div>
    );
  };

  const areasDisponiblesParaEmpleado = useMemo(() => {
    if (!formEmpleado.centro_trabajo) return areasEmpresa;
    return areasEmpresa.filter((a) => {
      const centroId =
        typeof a.centro_trabajo === 'object' ? a.centro_trabajo?.id : a.centro_trabajo;
      return Number(centroId) === Number(formEmpleado.centro_trabajo);
    });
  }, [areasEmpresa, formEmpleado.centro_trabajo]);

  const puestosDisponiblesParaEmpleado = useMemo(() => {
    if (!formEmpleado.area) return puestosEmpresa;
    return puestosEmpresa.filter((p) => {
      const areaId = typeof p.area === 'object' ? p.area?.id : p.area;
      return Number(areaId) === Number(formEmpleado.area);
    });
  }, [puestosEmpresa, formEmpleado.area]);

  const renderTable = () => {
    const currentLoading =
      activeTab === 'sedes'
        ? loadingCentros
        : activeTab === 'deptos'
        ? loadingAreas
        : activeTab === 'puestos'
        ? loadingPuestos
        : loadingUsuarios;

    const currentError =
      activeTab === 'sedes'
        ? errorCentros
        : activeTab === 'deptos'
        ? errorAreas
        : activeTab === 'puestos'
        ? errorPuestos
        : errorUsuarios;

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
          <p className="text-sm">
            {typeof currentError === 'object' ? JSON.stringify(currentError) : currentError}
          </p>
        </div>
      );
    }

    const sedesFiltradas = centrosEmpresa.filter((c) =>
      c.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const areasFiltradas = areasEmpresa.filter((a) =>
      a.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const puestosFiltrados = puestosEmpresa.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof p.area === 'object' ? p.area?.nombre : '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const empleadosFiltrados = usuariosEmpresa.filter(
      (u) =>
        u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.puesto || u.puesto_trabajo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTituloTabla = () => {
      if (activeTab === 'deptos') return 'Áreas / Departamentos';
      if (activeTab === 'puestos') return 'Puestos de Trabajo';
      if (activeTab === 'empleados') return 'Empleados';
      return 'Sedes';
    };

    const getPlaceholderBuscador = () => {
      if (activeTab === 'deptos') return 'Buscar áreas...';
      if (activeTab === 'puestos') return 'Buscar puestos por nombre o área...';
      if (activeTab === 'empleados') return 'Buscar empleados por nombre, correo o puesto...';
      return 'Buscar sedes...';
    };

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-white/10 overflow-hidden">
        {/* Header de Tabla */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold text-[#1E293B]">
            Gestión de {getTituloTabla()}
          </h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleRefreshData}
              title="Actualizar lista"
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <RefreshCw size={16} />
              <span className="hidden md:inline">Actualizar</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#172A47] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md flex-1 sm:flex-initial justify-center"
            >
              <Plus size={16} /> Nuevo Registro
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={getPlaceholderBuscador()}
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
                {activeTab === 'puestos' && (
                  <>
                    <th className="px-6 py-4">Nombre del Puesto</th>
                    <th className="px-6 py-4">Área / Departamento</th>
                    <th className="px-6 py-4">Centro de Trabajo</th>
                  </>
                )}
                {activeTab === 'empleados' && (
                  <>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Correo</th>
                    <th className="px-6 py-4">Puesto de Trabajo</th>
                    <th className="px-6 py-4">Centro de Trabajo</th>
                    <th className="px-6 py-4">Rol</th>
                  </>
                )}
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* RENDERIZADO TABLA SEDES */}
              {activeTab === 'sedes' &&
                sedesFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{item.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.nombre}</td>
                    <td className="px-6 py-4 text-slate-600">{item.direccion || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">{item.codigo_postal || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.num_empleados ?? item.numero_empleados ?? 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          title="Editar sede"
                          className="p-2 text-slate-600 hover:text-[#1E3A5F] bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          title="Eliminar sede"
                          className="p-2 text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* RENDERIZADO TABLA ÁREAS */}
              {activeTab === 'deptos' &&
                areasFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{item.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.nombre}</td>
                    <td className="px-6 py-4 text-slate-600">{item.descripcion || 'Sin descripción'}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {typeof item.centro_trabajo === 'object'
                        ? item.centro_trabajo?.nombre
                        : item.centro_trabajo_nombre || item.centro_trabajo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          title="Editar área"
                          className="p-2 text-slate-600 hover:text-[#1E3A5F] bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          title="Eliminar área"
                          className="p-2 text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* RENDERIZADO TABLA PUESTOS */}
              {activeTab === 'puestos' &&
                puestosFiltrados.map((item) => {
                  const areaObj = typeof item.area === 'object' ? item.area : null;
                  const centroNombre =
                    areaObj && typeof areaObj.centro_trabajo === 'object'
                      ? areaObj.centro_trabajo?.nombre
                      : 'N/A';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">#{item.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{item.nombre}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {areaObj ? areaObj.nombre : item.area || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{centroNombre}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            title="Editar puesto"
                            className="p-2 text-slate-600 hover:text-[#1E3A5F] bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            title="Eliminar puesto"
                            className="p-2 text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {/* RENDERIZADO TABLA EMPLEADOS */}
              {activeTab === 'empleados' &&
                empleadosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{item.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.nombre}</td>
                    <td className="px-6 py-4 text-slate-600">{item.email}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {typeof item.puesto === 'object'
                        ? item.puesto?.nombre
                        : item.puesto || item.puesto_trabajo || 'Sin puesto asignado'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {typeof item.centro_trabajo === 'object'
                        ? item.centro_trabajo?.nombre
                        : item.centro_trabajo_nombre || item.centro_trabajo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 capitalize">
                      {item.rol || 'empleado'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          title="Editar empleado"
                          className="p-2 text-slate-600 hover:text-[#1E3A5F] bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          title="Eliminar empleado"
                          className="p-2 text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* ESTADO VACÍO */}
              {((activeTab === 'sedes' && sedesFiltradas.length === 0) ||
                (activeTab === 'deptos' && areasFiltradas.length === 0) ||
                (activeTab === 'puestos' && puestosFiltrados.length === 0) ||
                (activeTab === 'empleados' && empleadosFiltrados.length === 0)) && (
                <tr>
                  <td
                    colSpan={activeTab === 'empleados' ? 7 : activeTab === 'sedes' ? 6 : 5}
                    className="px-6 py-10 text-center text-slate-400 text-sm"
                  >
                    No se encontraron registros para esta empresa.
                  </td>
                </tr>
              )}
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
        <p className="text-slate-300 text-base">
          Administra sedes, áreas, puestos de trabajo y colaboradores de tu empresa.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-xl inline-flex flex-wrap gap-1 border border-white/10">
        {[
          { id: 'sedes', label: 'Centros de Trabajo', icon: MapPin },
          { id: 'deptos', label: 'Áreas / Departamentos', icon: Building2 },
          { id: 'puestos', label: 'Puestos de Trabajo', icon: Briefcase },
          { id: 'empleados', label: 'Empleados / Usuarios', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchTerm('');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 
              ${
                activeTab === tab.id
                  ? 'bg-white text-[#1E3A5F] shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido Tabla */}
      {renderTable()}

      {/* Modal Dinámico de Creación / Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-[#1E293B]">
                {editingItem ? 'Actualizar ' : 'Nuevo '}
                {activeTab === 'sedes' && 'Centro de Trabajo'}
                {activeTab === 'deptos' && 'Área / Departamento'}
                {activeTab === 'puestos' && 'Puesto de Trabajo'}
                {activeTab === 'empleados' && 'Empleado'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  resetForms();
                  setIsModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {renderErrorBox()}

                {/* FORMULARIO DE SEDES */}
                {activeTab === 'sedes' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Nombre del Centro
                      </label>
                      <input
                        type="text"
                        required
                        value={formSede.nombre}
                        onChange={(e) => setFormSede({ ...formSede, nombre: e.target.value })}
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder="Ej. Planta Monterrey"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Dirección Completa
                      </label>
                      <input
                        type="text"
                        required
                        value={formSede.direccion}
                        onChange={(e) => setFormSede({ ...formSede, direccion: e.target.value })}
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder="Ej. Av. Reforma 123"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Total Empleados
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formSede.num_empleados}
                        onChange={(e) =>
                          setFormSede({ ...formSede, num_empleados: parseInt(e.target.value) || 0 })
                        }
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        required
                        value={formSede.codigo_postal}
                        onChange={(e) =>
                          setFormSede({ ...formSede, codigo_postal: e.target.value })
                        }
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
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Nombre del Área
                      </label>
                      <input
                        type="text"
                        required
                        value={formDepto.nombre}
                        onChange={(e) => setFormDepto({ ...formDepto, nombre: e.target.value })}
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder="Ej. Recursos Humanos"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={formDepto.descripcion}
                        onChange={(e) =>
                          setFormDepto({ ...formDepto, descripcion: e.target.value })
                        }
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder="Ej. Gestión del talento humano"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Centro de Trabajo
                      </label>
                      <select
                        required
                        value={formDepto.centro_trabajo}
                        onChange={(e) =>
                          setFormDepto({ ...formDepto, centro_trabajo: e.target.value })
                        }
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                      >
                        <option value="">Seleccione un Centro...</option>
                        {centrosEmpresa.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* FORMULARIO DE PUESTOS DE TRABAJO */}
                {activeTab === 'puestos' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Nombre del Puesto
                      </label>
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={150}
                        value={formPuesto.nombre}
                        onChange={(e) =>
                          setFormPuesto({ ...formPuesto, nombre: e.target.value })
                        }
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder="Ej. Analista de Reclutamiento"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Área / Departamento
                      </label>
                      <select
                        required
                        value={formPuesto.area}
                        onChange={(e) =>
                          setFormPuesto({ ...formPuesto, area: e.target.value })
                        }
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                      >
                        <option value="">Seleccione un Área...</option>
                        {areasEmpresa.map((a) => {
                          const centroNombre =
                            typeof a.centro_trabajo === 'object' ? a.centro_trabajo?.nombre : '';
                          return (
                            <option key={a.id} value={a.id}>
                              {a.nombre} {centroNombre ? `(${centroNombre})` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </>
                )}

                {/* FORMULARIO DE EMPLEADOS */}
                {activeTab === 'empleados' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={formEmpleado.nombre}
                        onChange={(e) =>
                          setFormEmpleado({ ...formEmpleado, nombre: e.target.value })
                        }
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        required
                        value={formEmpleado.email}
                        onChange={(e) =>
                          setFormEmpleado({ ...formEmpleado, email: e.target.value })
                        }
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder="ejemplo@empresa.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        {editingItem ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                      </label>
                      <input
                        type="password"
                        required={!editingItem}
                        minLength={8}
                        value={formEmpleado.password_hash}
                        onChange={(e) =>
                          setFormEmpleado({ ...formEmpleado, password_hash: e.target.value })
                        }
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        placeholder={
                          editingItem ? 'Dejar vacío para mantener la actual' : 'Mínimo 8 caracteres'
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Rol en el Sistema
                      </label>
                      <select
                        required
                        value={formEmpleado.rol}
                        onChange={(e) =>
                          setFormEmpleado({ ...formEmpleado, rol: e.target.value })
                        }
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                      >
                        <option value="">Seleccione un Rol...</option>
                        <option value="empleado">Empleado</option>
                        <option value="administrador">Administrador</option>
                        <option value="supervisor">Supervisor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Centro de Trabajo
                      </label>
                      <select
                        required
                        value={formEmpleado.centro_trabajo}
                        onChange={(e) =>
                          setFormEmpleado({
                            ...formEmpleado,
                            centro_trabajo: e.target.value,
                            area: '',
                          })
                        }
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                      >
                        <option value="">Seleccione un Centro...</option>
                        {centrosEmpresa.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Área / Departamento
                      </label>
                      <select
                        value={formEmpleado.area}
                        onChange={(e) =>
                          setFormEmpleado({ ...formEmpleado, area: e.target.value })
                        }
                        className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                      >
                        <option value="">Seleccione un Área (opcional)...</option>
                        {areasDisponiblesParaEmpleado.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                        Puesto de Trabajo
                      </label>
                      {puestosDisponiblesParaEmpleado.length > 0 ? (
                        <select
                          value={formEmpleado.puesto}
                          onChange={(e) =>
                            setFormEmpleado({ ...formEmpleado, puesto: e.target.value })
                          }
                          className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                        >
                          <option value="">Seleccione un Puesto...</option>
                          {puestosDisponiblesParaEmpleado.map((p) => (
                            <option key={p.id} value={p.nombre}>
                              {p.nombre}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={formEmpleado.puesto}
                          onChange={(e) =>
                            setFormEmpleado({ ...formEmpleado, puesto: e.target.value })
                          }
                          className="w-full border p-2.5 rounded-xl text-sm border-slate-200 focus:outline-none focus:border-[#1E3A5F]"
                          placeholder="Ej. Analista de Calidad / Operador"
                        />
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForms();
                    setIsModalOpen(false);
                  }}
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
                  {editingItem ? 'Actualizar Datos' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}