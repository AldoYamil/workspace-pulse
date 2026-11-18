// src/pages/AppliedSurveys.jsx
import { useState, useEffect } from 'react';
import {
  Search, Filter, QrCode, Link as LinkIcon,
  CheckCircle2, Clock, CalendarDays, BarChart3,
  AlertCircle, X, Download, Plus, Trash2, Loader2, Eye
} from 'lucide-react';
import { useEncuesta } from '../hooks/useEncuesta';
import { useCampanaEvaluacion } from '../hooks/useCampanaEvaluacion';
import { useRespuestaEvaluacion } from '../hooks/useRespuestaEvaluacion';
import { useCentrosTrabajo } from '../hooks/useCentrosTrabajo';
import { useAreas } from '../hooks/useAreas';

export default function AppliedSurveys() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Selectores requeridos por la ruta v1/campana/list/<guia_id>/<centro_id>
  const [selectedGuiaId, setSelectedGuiaId] = useState('');
  const [selectedCentroId, setSelectedCentroId] = useState('');

  // Hooks reales conectados al backend
  const { guias, loading: loadingGuias } = useEncuesta({ autoFetchGuias: true });
  const { centros } = useCentrosTrabajo();
  const { areas } = useAreas();

  const {
    campanas,
    loading: loadingCampanas,
    error: errorCampanas,
    createCampana,
    deleteCampana,
  } = useCampanaEvaluacion(selectedGuiaId || null, selectedCentroId || null);

  // Estado para consultar respuestas de una campaña específica (useRespuestaEvaluacion)
  const [selectedCampanaResp, setSelectedCampanaResp] = useState(null);
  const [selectedAreaResp, setSelectedAreaResp] = useState('');
  const {
    respuestas,
    loading: loadingRespuestas,
  } = useRespuestaEvaluacion(selectedCampanaResp?.id || null, selectedAreaResp || null);

  // Estados para Modal de QR
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedSurveyForQr, setSelectedSurveyForQr] = useState(null);

  // Estados para Modal de Nueva Campaña
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'Activa',
    guia_referencia: '',
    centro_trabajo: '',
  });

  // Seleccionar automáticamente la primera guía y el primer centro disponibles
  useEffect(() => {
    if (!selectedGuiaId && guias.length > 0) {
      setSelectedGuiaId(String(guias[0].id));
    }
  }, [guias, selectedGuiaId]);

  useEffect(() => {
    if (!selectedCentroId && centros.length > 0) {
      setSelectedCentroId(String(centros[0].id));
    }
  }, [centros, selectedCentroId]);

  const areasDelCentro = areas.filter((a) => {
    const cId = typeof a.centro_trabajo === 'object' ? a.centro_trabajo?.id : a.centro_trabajo;
    return !selectedCentroId || String(cId) === String(selectedCentroId);
  });

  // Normaliza el estatus del backend ('Activa', 'Finalizada', 'Programada')
  const normalizeStatus = (estadoRaw = '') => {
    const val = String(estadoRaw).toLowerCase();
    if (val.includes('activ')) return 'active';
    if (val.includes('program') || val.includes('pend')) return 'scheduled';
    return 'finished';
  };

  const getGuiaNombre = (guiaVal) => {
    if (guiaVal && typeof guiaVal === 'object') return guiaVal.nombre || guiaVal.titulo || `Guía #${guiaVal.id}`;
    const encontrada = guias.find((g) => String(g.id) === String(guiaVal || selectedGuiaId));
    return encontrada ? (encontrada.nombre || encontrada.titulo) : `Guía #${guiaVal || selectedGuiaId}`;
  };

  const getEncuestaDirectUrl = (campanaId) => {
    const areaParam = areasDelCentro[0]?.id ? `&area=${areasDelCentro[0].id}` : '';
    return `${window.location.origin}/encuesta?campana=${campanaId}${areaParam}`;
  };

  const handleCopyLink = (campanaId) => {
    navigator.clipboard.writeText(getEncuestaDirectUrl(campanaId));
    setCopiedId(campanaId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openQrModal = (campana) => {
    setSelectedSurveyForQr(campana);
    setShowQrModal(true);
  };

  const openRespuestasModal = (campana) => {
    setSelectedCampanaResp(campana);
    setSelectedAreaResp(areasDelCentro[0]?.id ? String(areasDelCentro[0].id) : '');
  };

  const handleOpenCreateModal = () => {
    setFormError(null);
    setFormData({
      nombre: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '',
      estado: 'Activa',
      guia_referencia: selectedGuiaId || (guias[0]?.id ? String(guias[0].id) : ''),
      centro_trabajo: selectedCentroId || (centros[0]?.id ? String(centros[0].id) : ''),
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload = {
      nombre: formData.nombre,
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
      estado: formData.estado,
      guia_referencia: parseInt(formData.guia_referencia, 10),
      centro_trabajo: parseInt(formData.centro_trabajo, 10),
    };

    const res = await createCampana(payload);
    if (res.success) {
      setSelectedGuiaId(String(payload.guia_referencia));
      setSelectedCentroId(String(payload.centro_trabajo));
      setShowCreateModal(false);
    } else {
      setFormError(res.error);
    }
    setSubmitting(false);
  };

  const handleDeleteCampana = async (campana) => {
    if (!window.confirm(`¿Deseas eliminar la campaña "${campana.nombre}"?`)) return;
    const gId = typeof campana.guia_referencia === 'object' ? campana.guia_referencia.id : (campana.guia_referencia || selectedGuiaId);
    const cId = typeof campana.centro_trabajo === 'object' ? campana.centro_trabajo.id : (campana.centro_trabajo || selectedCentroId);
    const res = await deleteCampana(gId, cId);
    if (!res.success) {
      alert('Error al eliminar campaña: ' + JSON.stringify(res.error));
    }
  };

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
        {status === 'active' && <Clock size={12} />}
        {status === 'finished' && <CheckCircle2 size={12} />}
        {status === 'scheduled' && <CalendarDays size={12} />}
        {labels[status] || status}
      </span>
    );
  };

  const filteredSurveys = campanas.filter((campana) => {
    const nombre = campana.nombre || `Campaña #${campana.id}`;
    const matchesSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const normalized = normalizeStatus(campana.estado);
    const matchesStatus = filterStatus === 'all' || normalized === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const loading = loadingGuias || loadingCampanas;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* HEADER DE SECCIÓN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Encuestas Aplicadas</h1>
          <p className="text-slate-300 text-base">Registro histórico, monitoreo de participación y generación de enlaces de distribución.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#162c4a] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Nueva Campaña
        </button>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
        {/* Filtro Guía de Referencia */}
        <div>
          <select
            value={selectedGuiaId}
            onChange={(e) => setSelectedGuiaId(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#1E3A5F] outline-none cursor-pointer"
          >
            <option value="">Selecciona Guía de Referencia...</option>
            {guias.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre || g.titulo || `Guía #${g.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Centro de Trabajo */}
        <div>
          <select
            value={selectedCentroId}
            onChange={(e) => setSelectedCentroId(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#1E3A5F] outline-none cursor-pointer"
          >
            <option value="">Selecciona Centro de Trabajo...</option>
            {centros.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar campaña..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-[#1E3A5F] outline-none transition-all"
          />
        </div>

        {/* Filtro Estatus */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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

      {/* MENSAJE DE ERROR SI FALLA LA API */}
      {errorCampanas && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          Error al cargar campañas: {typeof errorCampanas === 'object' ? JSON.stringify(errorCampanas) : errorCampanas}
        </div>
      )}

      {/* TABLA DE REGISTRO HISTÓRICO */}
      <div className="bg-white rounded-2xl shadow-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500 gap-3">
            <Loader2 className="animate-spin text-[#1E3A5F]" size={32} />
            <p className="text-sm font-medium">Cargando campañas desde el servidor...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-xs border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nombre de Campaña</th>
                  <th className="px-6 py-4">Guía NOM-035</th>
                  <th className="px-6 py-4">Fecha Inicio</th>
                  <th className="px-6 py-4">Participación</th>
                  <th className="px-6 py-4">Estatus</th>
                  <th className="px-6 py-4 text-right">Acciones / Distribución</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSurveys.length > 0 ? (
                  filteredSurveys.map((campana) => {
                    const statusNorm = normalizeStatus(campana.estado);
                    const totalResp = campana.total_respuestas ?? campana.respuestas_count ?? 0;
                    const totalAsig = campana.total_asignados ?? 0;
                    const participacion = campana.participacion ?? (totalAsig > 0 ? Math.min(100, Math.round((totalResp / totalAsig) * 100)) : (totalResp > 0 ? 100 : 0));

                    return (
                      <tr key={campana.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{campana.nombre || `Campaña #${campana.id}`}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Cierre: {campana.fecha_fin || 'Sin fecha límite'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                            {getGuiaNombre(campana.guia_referencia)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{campana.fecha_inicio || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                              <div
                                className={`h-full rounded-full ${participacion >= 80 ? 'bg-emerald-500' : participacion >= 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                style={{ width: `${participacion}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right">
                              {participacion}%
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {totalAsig > 0 ? `${totalResp} de ${totalAsig} asignados` : `${totalResp} respuestas registradas`}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={statusNorm} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openRespuestasModal(campana)}
                              title="Ver respuestas recibidas por área"
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() => openQrModal(campana)}
                              title="Ver QR de acceso directo"
                              className="p-2 text-slate-400 hover:text-[#1E3A5F] hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <QrCode size={18} />
                            </button>

                            <button
                              onClick={() => handleCopyLink(campana.id)}
                              title={copiedId === campana.id ? '¡Copiado!' : 'Copiar enlace directo'}
                              className={`p-2 rounded-lg transition-colors ${copiedId === campana.id ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-[#1E3A5F] hover:bg-blue-50'}`}
                            >
                              {copiedId === campana.id ? <CheckCircle2 size={18} /> : <LinkIcon size={18} />}
                            </button>

                            <button
                              onClick={() => handleDeleteCampana(campana)}
                              title="Eliminar campaña"
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
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
                      {!selectedGuiaId || !selectedCentroId
                        ? 'Selecciona una Guía de Referencia y un Centro de Trabajo para consultar sus campañas.'
                        : 'No hay campañas registradas para esta Guía y Centro de Trabajo.'}
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
        <BarChart3 className="w-5 h-5 text-slate-300 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-300 leading-relaxed">
          Los porcentajes de participación se actualizan en tiempo real conforme los colaboradores envían sus respuestas. Para campañas activas por debajo del umbral configurado, el sistema enviará una alerta automática al Gerente de RH vía Resend.
        </p>
      </div>

      {/* MODAL DE NUEVA CAMPAÑA */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Nueva Campaña de Evaluación</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {typeof formError === 'object' ? JSON.stringify(formError) : String(formError)}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de Campaña *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. Evaluación NOM-035 Q4 2026"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Guía de Referencia *</label>
                <select
                  required
                  value={formData.guia_referencia}
                  onChange={(e) => setFormData({ ...formData, guia_referencia: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                >
                  <option value="">Selecciona una guía...</option>
                  {guias.map((g) => (
                    <option key={g.id} value={g.id}>{g.nombre || g.titulo || `Guía #${g.id}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Centro de Trabajo *</label>
                <select
                  required
                  value={formData.centro_trabajo}
                  onChange={(e) => setFormData({ ...formData, centro_trabajo: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                >
                  <option value="">Selecciona un centro...</option>
                  {centros.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Fin *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                >
                  <option value="Activa">Activa</option>
                  <option value="Programada">Programada</option>
                  <option value="Finalizada">Finalizada</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#162c4a] text-sm flex items-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={15} />}
                  Crear Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONSULTA DE RESPUESTAS POR ÁREA (useRespuestaEvaluacion) */}
      {selectedCampanaResp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Respuestas: {selectedCampanaResp.nombre}</h3>
                <p className="text-xs text-slate-500">Consulta anónima por área / departamento</p>
              </div>
              <button onClick={() => setSelectedCampanaResp(null)} className="text-slate-400 hover:text-slate-600">
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Filtrar por Área</label>
                <select
                  value={selectedAreaResp}
                  onChange={(e) => setSelectedAreaResp(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                >
                  <option value="">Selecciona un área...</option>
                  {areasDelCentro.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>

              {loadingRespuestas ? (
                <div className="py-8 flex justify-center text-slate-400">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {respuestas.length > 0 ? (
                    respuestas.map((r) => (
                      <div key={r.id} className="p-3 text-xs flex justify-between items-center hover:bg-slate-50">
                        <div>
                          <p className="font-semibold text-slate-700">Evaluación Anónima #{r.id}</p>
                          <p className="text-slate-400">{r.fecha_respuesta ? new Date(r.fecha_respuesta).toLocaleString() : 'Registrada'}</p>
                        </div>
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded font-medium">
                          Completada
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="p-6 text-center text-xs text-slate-400">
                      No hay respuestas registradas para esta área en esta campaña.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedCampanaResp(null)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE GENERACIÓN DE QR */}
      {showQrModal && selectedSurveyForQr && (() => {
        const encuestaUrl = getEncuestaDirectUrl(selectedSurveyForQr.id);
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(encuestaUrl)}`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800">Acceso Directo: {selectedSurveyForQr.nombre}</h3>
                <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <div className="w-44 h-44 bg-white p-2 rounded-lg shadow-sm mb-3 flex items-center justify-center">
                    <img src={qrApiUrl} alt="QR Encuesta" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-sm text-slate-600 text-center font-medium">Escanea para responder la campaña</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1 break-all text-center">{encuestaUrl}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCopyLink(selectedSurveyForQr.id)}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    <LinkIcon size={16} />
                    {copiedId === selectedSurveyForQr.id ? '¡Copiado!' : 'Copiar URL'}
                  </button>
                  <button
                    onClick={() => window.open(qrApiUrl, '_blank')}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#1E3A5F] text-white hover:bg-[#162c4a] transition-colors text-sm font-medium"
                  >
                    <Download size={16} />
                    Descargar PNG
                  </button>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setShowQrModal(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}