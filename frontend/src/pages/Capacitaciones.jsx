// src/pages/Capacitaciones.jsx
import { useState, useEffect } from 'react';
import {
  GraduationCap, Calendar, Users, FileText,
  Search, Filter, Plus, CheckCircle2, Clock, AlertCircle,
  Printer, Loader2, Trash2, Edit2, X
} from 'lucide-react';
import api from '../api/axios';
import { useCapacitaciones } from '../hooks/useCapacitaciones';
import { useCentrosTrabajo } from '../hooks/useCentrosTrabajo';

export default function Capacitaciones() {
  const {
    normalizedCapacitaciones,
    stats,
    loading,
    error: errorMsg,
    createCapacitacion,
    updateCapacitacion,
    deleteCapacitacion,
  } = useCapacitaciones();

  const { centros } = useCentrosTrabajo();
  const [planeaciones, setPlaneaciones] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    nombre_taller: '',
    descripcion: '',
    fecha_taller: '',
    horas_duracion: 2,
    instructor: '',
    centro_trabajo: '',
    planeacion: '',
    asistentes: 0,
    total_asignados: 10,
    estado: 'programado',
    evidencia_url: '',
  });

  useEffect(() => {
    const fetchPlaneaciones = async () => {
      try {
        const res = await api.get('v1/planeacion/list/');
        setPlaneaciones(Array.isArray(res.data) ? res.data : res.data?.results || []);
      } catch {
        setPlaneaciones([]);
      }
    };
    fetchPlaneaciones();
  }, []);

  const resetForm = () => {
    setFormData({
      nombre_taller: '',
      descripcion: '',
      fecha_taller: '',
      horas_duracion: 2,
      instructor: '',
      centro_trabajo: centros[0]?.id ? String(centros[0].id) : '',
      planeacion: '',
      asistentes: 0,
      total_asignados: 10,
      estado: 'programado',
      evidencia_url: '',
    });
    setEditingItem(null);
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    const raw = item.raw;
    const centroId =
      typeof raw.centro_trabajo === 'object' ? raw.centro_trabajo?.id : raw.centro_trabajo;
    const planId = typeof raw.planeacion === 'object' ? raw.planeacion?.id : raw.planeacion;

    setEditingItem(raw);
    setFormError(null);
    setFormData({
      nombre_taller: raw.nombre_taller || raw.titulo || raw.nombre || '',
      descripcion: raw.descripcion || '',
      fecha_taller: (raw.fecha_taller || raw.fecha || '').slice(0, 10),
      horas_duracion: raw.horas_duracion ?? 2,
      instructor: raw.instructor || raw.facilitador || '',
      centro_trabajo: centroId ? String(centroId) : '',
      planeacion: planId ? String(planId) : '',
      asistentes: raw.asistentes ?? raw.num_asistentes ?? 0,
      total_asignados: raw.total_asignados ?? raw.cupo ?? 10,
      estado: item.status === 'completed' ? 'completado' : 'programado',
      evidencia_url: raw.evidencia_url || '',
    });
    setShowModal(true);
  };

  const handleSaveTraining = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload = {
      nombre_taller: formData.nombre_taller.trim(),
      fecha_taller: formData.fecha_taller,
      horas_duracion: Number(formData.horas_duracion) || 1,
      descripcion: formData.descripcion.trim(),
      instructor: formData.instructor.trim(),
      asistentes: Number(formData.asistentes) || 0,
      total_asignados: Number(formData.total_asignados) || 1,
      estado: formData.estado,
      centro_trabajo: formData.centro_trabajo ? Number(formData.centro_trabajo) : null,
      planeacion: formData.planeacion ? Number(formData.planeacion) : null,
    };

    if (formData.evidencia_url.trim()) {
      payload.evidencia_url = formData.evidencia_url.trim();
    }

    const result = editingItem
      ? await updateCapacitacion(editingItem.id, payload)
      : await createCapacitacion(payload);

    if (result.success) {
      setShowModal(false);
      resetForm();
    } else {
      setFormError(result.error);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar este registro de capacitación?')) return;
    const result = await deleteCapacitacion(id);
    if (!result.success) {
      alert('No se pudo eliminar: ' + JSON.stringify(result.error));
    }
  };

  const handleDownloadEvidence = (training) => {
    if (training.raw?.evidencia_url) {
      window.open(training.raw.evidencia_url, '_blank', 'noopener,noreferrer');
      return;
    }

    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>Constancia NOM-035 - ${training.title}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 32px; color: #1e293b;">
          <h2 style="color: #1E3A5F; margin-bottom: 4px;">Evidencia Documental de Capacitación (NOM-035-STPS-2018)</h2>
          <p style="color: #64748b; margin-top: 0;">Folio: #CAP-${training.id}</p>
          <hr />
          <p><strong>Curso / Taller:</strong> ${training.title}</p>
          <p><strong>Vinculación:</strong> ${training.type}</p>
          <p><strong>Centro de Trabajo:</strong> ${training.centroNombre || 'General'}</p>
          <p><strong>Fecha de Impartición:</strong> ${training.date}</p>
          <p><strong>Duración:</strong> ${training.horas || 0} horas</p>
          <p><strong>Instructor / Facilitador:</strong> ${training.instructor}</p>
          <p><strong>Asistencia Registrada:</strong> ${training.attendees} de ${training.totalAssigned} colaboradores</p>
          <br /><br />
          <div style="display:flex; justify-content:space-between; margin-top:60px;">
            <div style="border-top:1px solid #334155; width:40%; text-align:center; padding-top:8px;">Firma del Instructor</div>
            <div style="border-top:1px solid #334155; width:40%; text-align:center; padding-top:8px;">Responsable de Recursos Humanos</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

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
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
          styles[status] || styles.scheduled
        }`}
      >
        {status === 'completed' && <CheckCircle2 size={12} />}
        {status === 'scheduled' && <Clock size={12} />}
        {labels[status]}
      </span>
    );
  };

  const handlePlanChange = (planId) => {
      const planSeleccionado = planeaciones.find((p) => String(p.id) === String(planId));
      const centroDelPlan =
        planSeleccionado?.centro_trabajo?.id ||
        planSeleccionado?.centro_trabajo ||
        planSeleccionado?.resultado_riesgo?.usuario?.centro_trabajo?.id ||
        planSeleccionado?.resultado_riesgo?.usuario?.centro_trabajo;

      setFormData((prev) => ({
        ...prev,
        planeacion: planId,
        centro_trabajo: centroDelPlan ? String(centroDelPlan) : prev.centro_trabajo,
      }));
    };

  const filteredTrainings = normalizedCapacitaciones.filter((training) => {
    const matchesSearch =
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || training.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Registro de Capacitaciones</h1>
          <p className="text-slate-300 text-base">
            Seguimiento de talleres, cursos y evidencia de asistencia vinculados a planes de acción.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#162c4a] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl active:scale-95 border border-white/15"
        >
          <Plus size={18} />
          Registrar Nueva Capacitación
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-400/40 text-red-100 text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg}</span>
        </div>
      )}

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-300">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-slate-300 text-sm">Capacitaciones Completadas</p>
            <p className="text-2xl font-bold text-white">{stats.completadas}</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-300">
            <Users size={24} />
          </div>
          <div>
            <p className="text-slate-300 text-sm">Asistencia Promedio</p>
            <p className="text-2xl font-bold text-white">{stats.promedioAsistencia}%</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-lg text-amber-300">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-slate-300 text-sm">Próximas Sesiones</p>
            <p className="text-2xl font-bold text-white">{stats.programadas}</p>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de taller o instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-[#1E3A5F] outline-none transition-all"
          />
        </div>

        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm font-medium">Cargando capacitaciones...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-xs border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nombre de la Capacitación</th>
                  <th className="px-6 py-4">Tipo / Vinculación</th>
                  <th className="px-6 py-4">Fecha, Duración e Instructor</th>
                  <th className="px-6 py-4">Asistencia</th>
                  <th className="px-6 py-4">Estatus</th>
                  <th className="px-6 py-4 text-right">Evidencia y Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrainings.length > 0 ? (
                  filteredTrainings.map((training) => {
                    const porcentaje = Math.min(
                      100,
                      Math.round((training.attendees / training.totalAssigned) * 100)
                    );
                    return (
                      <tr key={training.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{training.title}</p>
                          {training.centroNombre && (
                            <p className="text-xs text-slate-400 mt-0.5">{training.centroNombre}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                            {training.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-700 font-medium">
                            {training.date} {training.horas ? `(${training.horas} hrs)` : ''}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Imparte: {training.instructor}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                              <div
                                className={`h-full rounded-full ${
                                  porcentaje >= 80
                                    ? 'bg-emerald-500'
                                    : porcentaje >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${porcentaje}%` }}
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
                          <div className="flex justify-end gap-1.5">
                            {training.evidenceAvailable && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadEvidence(training)}
                                  title="Ver / Descargar Evidencia"
                                  className="p-2 text-slate-500 hover:text-[#1E3A5F] hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <FileText size={17} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadEvidence(training)}
                                  title="Imprimir Lista de Asistencia"
                                  className="p-2 text-slate-500 hover:text-[#1E3A5F] hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Printer size={17} />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(training)}
                              title="Editar capacitación"
                              className="p-2 text-slate-500 hover:text-[#1E3A5F] hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(training.id)}
                              title="Eliminar capacitación"
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No se encontraron capacitaciones con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NOTA LEGAL */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-start gap-3">
        <GraduationCap className="w-5 h-5 text-slate-300 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-300 leading-relaxed">
          Según la NOM-035-STPS-2018, toda capacitación preventiva debe contar con evidencia documental
          (lista de asistencia firmada, material didáctico y fotografías). Estos registros son obligatorios
          para auditorías de la STPS y deben conservarse por al menos 5 años.
        </p>
      </div>

      {/* MODAL DE REGISTRO / EDICIÓN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">
                {editingItem ? 'Actualizar Capacitación' : 'Registrar Nueva Capacitación'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTraining}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {formError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {typeof formError === 'object' ? JSON.stringify(formError) : String(formError)}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre del Taller / Curso
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre_taller}
                    onChange={(e) => setFormData({ ...formData, nombre_taller: e.target.value })}
                    placeholder="Ej. Manejo de Estrés Laboral"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Fecha del Taller
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fecha_taller}
                      onChange={(e) => setFormData({ ...formData, fecha_taller: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Duración (Horas)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      required
                      value={formData.horas_duracion}
                      onChange={(e) => setFormData({ ...formData, horas_duracion: e.target.value })}
                      placeholder="Ej. 2"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Instructor</label>
                    <input
                      type="text"
                      required
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      placeholder="Nombre del facilitador"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Centro de Trabajo
                    </label>
                    <select
                      required
                      value={formData.centro_trabajo}
                      onChange={(e) =>
                        setFormData({ ...formData, centro_trabajo: e.target.value })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white text-sm text-slate-800"
                    >
                      <option value="">Seleccionar sede...</option>
                      {centros.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estatus</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white text-sm text-slate-800"
                    >
                      <option value="programado">Programado</option>
                      <option value="completado">Completado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Asistentes
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.asistentes}
                      onChange={(e) => setFormData({ ...formData, asistentes: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Convocados
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.total_asignados}
                      onChange={(e) =>
                        setFormData({ ...formData, total_asignados: e.target.value })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Vinculación a Plan de Acción
                  </label>
                 <select
                    required
                    value={formData.planeacion}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white text-sm text-slate-800"
                  >
                    <option value="">Selecciona un Plan de Acción...</option>
                    {planeaciones.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.titulo || `Plan de Acción #${plan.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Enlace de Evidencia / Lista de Asistencia (Opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.evidencia_url}
                    onChange={(e) => setFormData({ ...formData, evidencia_url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#162c4a] transition-colors text-sm flex items-center gap-2"
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {editingItem ? 'Actualizar Capacitación' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}