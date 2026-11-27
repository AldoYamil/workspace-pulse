// src/pages/CampanasEvaluacion.jsx
import { useState, useEffect } from 'react';
import {
  Megaphone, Calendar, FileText, Plus, Search,
  Filter, Clock, CheckCircle2, AlertCircle, ChevronRight, Users, Loader2, X
} from 'lucide-react';
import { useCampanaEvaluacion } from '../hooks/useCampanaEvaluacion';
import { useEncuesta } from '../hooks/useEncuesta';
import { useCentrosTrabajo } from '../hooks/useCentrosTrabajo';

export default function CampanasEvaluacion() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filtros requeridos por v1/campana/list/<guia_id>/<centro_id>
  const [selectedGuiaId, setSelectedGuiaId] = useState('');
  const [selectedCentroId, setSelectedCentroId] = useState('');

  // Hooks conectados al backend
  const { guias, loading: loadingGuias } = useEncuesta({ autoFetchGuias: true });
  const { centros } = useCentrosTrabajo();
  const {
    campanas,
    loading: loadingCampanas,
    error: errorCampanas,
    createCampana,
    updateCampana,
  } = useCampanaEvaluacion(selectedGuiaId || null, selectedCentroId || null);

  // Estados para Modal de Creación
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    guia_referencia: '',
    centro_trabajo: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'Activa',
  });

  // Estado para Modal de Detalles
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState(null);

  // Autoseleccionar la primera guía y centro disponibles
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

  const normalizeStatus = (estadoRaw) => {
      if (typeof estadoRaw === 'boolean') {
        return estadoRaw ? 'active' : 'finished';
      }
      const val = String(estadoRaw ?? '').toLowerCase().trim();
      if (val === 'true' || val === '1' || val.includes('activ')) return 'active';
      if (val.includes('program') || val.includes('pend') || val.includes('paus')) return 'scheduled';
      return 'finished';
    };

  const getGuiaNombre = (guiaVal) => {
    if (guiaVal && typeof guiaVal === 'object') {
      return guiaVal.nombre || guiaVal.titulo || `Guía #${guiaVal.id}`;
    }
    const encontrada = guias.find((g) => String(g.id) === String(guiaVal || selectedGuiaId));
    return encontrada ? (encontrada.nombre || encontrada.titulo) : `Guía #${guiaVal || selectedGuiaId}`;
  };

  const getCentroNombre = (centroVal) => {
    if (centroVal && typeof centroVal === 'object') {
      return centroVal.nombre || `Centro #${centroVal.id}`;
    }
    const encontrado = centros.find((c) => String(c.id) === String(centroVal || selectedCentroId));
    return encontrado ? encontrado.nombre : `Centro #${centroVal || selectedCentroId}`;
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return 'Sin fecha';
    const d = new Date(`${fechaStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return fechaStr;
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleOpenCreateModal = () => {
    setFormError(null);
    setFormData({
      nombre: '',
      guia_referencia: selectedGuiaId || (guias[0]?.id ? String(guias[0].id) : ''),
      centro_trabajo: selectedCentroId || (centros[0]?.id ? String(centros[0].id) : ''),
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '',
      estado: 'Activa',
    });
    setShowModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload = {
      nombre: formData.nombre,
      guia_referencia: Number(formData.guia_referencia),
      centro_trabajo: Number(formData.centro_trabajo),
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
      estado: formData.estado,
    };

    const res = await createCampana(payload);
    if (res.success) {
      setSelectedGuiaId(String(payload.guia_referencia));
      setSelectedCentroId(String(payload.centro_trabajo));
      setShowModal(false);
    } else {
      setFormError(res.error);
    }
    setSubmitting(false);
  };

  const handleToggleEstado = async (campaign) => {
      const statusNorm = normalizeStatus(campaign.estado);
      const nuevoEstado = statusNorm === 'active' ? 'Finalizada' : 'Activa';
      const gId = typeof campaign.guia_referencia === 'object'
        ? campaign.guia_referencia.id
        : (campaign.guia_referencia || selectedGuiaId);
      const cId = typeof campaign.centro_trabajo === 'object'
        ? campaign.centro_trabajo.id
        : (campaign.centro_trabajo || selectedCentroId);

      const res = await updateCampana(
        gId,
        cId,
        { estado: nuevoEstado, campana_id: campaign.id },
        'patch'
      );
      if (!res.success) {
        alert('No se pudo actualizar el estado de la campaña: ' + JSON.stringify(res.error));
      }
    };

  // Renderizado de Badge de Estatus
  const StatusBadge = ({ status }) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      finished: 'bg-slate-100 text-slate-600 border-slate-200',
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
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
        {status === 'scheduled' && <Calendar size={12} />}
        {labels[status] || status}
      </span>
    );
  };

  // Filtrado de datos reales
  const filteredCampaigns = campanas.filter((campaign) => {
    const nombre = campaign.nombre || `Campaña #${campaign.id}`;
    const matchesSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const statusNorm = normalizeStatus(campaign.estado);
    const matchesStatus = filterStatus === 'all' || statusNorm === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const loading = loadingGuias || loadingCampanas;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* HEADER DE SECCIÓN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Campañas</h1>
          <p className="text-slate-300 text-base">Programa, configura y monitorea las evaluaciones de clima laboral y riesgo psicosocial.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#162c4a] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Plus size={18} />
          Nueva Campaña
        </button>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
        {/* Selector de Guía */}
        <div>
          <select
            value={selectedGuiaId}
            onChange={(e) => setSelectedGuiaId(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#1E3A5F] outline-none cursor-pointer hover:bg-white transition-colors"
          >
            <option value="">Selecciona Guía de Referencia...</option>
            {guias.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre || g.titulo || `Guía #${g.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Centro de Trabajo */}
        <div>
          <select
            value={selectedCentroId}
            onChange={(e) => setSelectedCentroId(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#1E3A5F] outline-none cursor-pointer hover:bg-white transition-colors"
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
            placeholder="Buscar campaña por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-[#1E3A5F] outline-none transition-all"
          />
        </div>

        {/* Filtro de Estatus */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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

      {/* ERROR DE CARGA */}
      {errorCampanas && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          Error al cargar campañas: {typeof errorCampanas === 'object' ? JSON.stringify(errorCampanas) : errorCampanas}
        </div>
      )}

      {/* GRID DE TARJETAS DE CAMPAÑAS */}
      {loading ? (
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-white gap-3">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm font-medium">Cargando campañas desde el servidor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => {
              const statusNorm = normalizeStatus(campaign.estado);
              const completed = Number(campaign.total_respuestas ?? campaign.respuestas_count ?? 0);
              const assigned = Number(campaign.total_asignados ?? 0);
              const progress =
                campaign.participacion !== undefined
                  ? Number(campaign.participacion)
                  : assigned > 0
                    ? Math.min(100, Math.round((completed / assigned) * 100))
                    : completed > 0
                      ? 100
                      : 0;

              return (
                <div key={campaign.id} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col justify-between">

                  {/* Header de Tarjeta */}
                  <div className="p-6 pb-4 border-b border-slate-50">
                    <div className="flex justify-between items-start mb-3">
                      <StatusBadge status={statusNorm} />
                      <button
                        type="button"
                        onClick={() => setSelectedCampaignDetail(campaign)}
                        className="text-slate-400 hover:text-[#1E3A5F] transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">
                      {campaign.nombre || `Campaña #${campaign.id}`}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-2">
                      <FileText size={14} />
                      {getGuiaNombre(campaign.guia_referencia)}
                    </div>
                  </div>

                  {/* Cuerpo de Tarjeta con Progreso */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span className="flex items-center gap-2">
                        <Users size={14} />
                        {assigned > 0 ? `Asignados: ${assigned} (${completed} resp.)` : `Respuestas: ${completed}`}
                      </span>
                      <span className="font-bold text-[#1E3A5F]">{progress}%</span>
                    </div>

                    {/* Barra de Progreso */}
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress >= 80 ? 'bg-emerald-500' :
                          progress >= 50 ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                      <Calendar size={14} />
                      {formatFecha(campaign.fecha_inicio)} — {formatFecha(campaign.fecha_fin)}
                    </div>
                  </div>

                  {/* Footer de Acciones Rápidas */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCampaignDetail(campaign)}
                      className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-colors"
                    >
                      Ver Detalles
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleEstado(campaign)}
                      className={`flex-1 py-2 text-xs font-bold text-white rounded-lg transition-colors ${
                        statusNorm === 'active'
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {statusNorm === 'active' ? 'Pausar / Finalizar' : 'Activar Campaña'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-300 font-medium">
                {!selectedGuiaId || !selectedCentroId
                  ? 'Selecciona una Guía de Referencia y un Centro de Trabajo para visualizar las campañas.'
                  : 'No se encontraron campañas con los filtros actuales.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE DETALLES DE CAMPAÑA */}
      {selectedCampaignDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">{selectedCampaignDetail.nombre}</h3>
              <button
                type="button"
                onClick={() => setSelectedCampaignDetail(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Guía de Referencia:</span>
                <span className="font-semibold text-slate-800">{getGuiaNombre(selectedCampaignDetail.guia_referencia)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Centro de Trabajo:</span>
                <span className="font-semibold text-slate-800">{getCentroNombre(selectedCampaignDetail.centro_trabajo)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Periodo:</span>
                <span className="font-semibold text-slate-800">
                  {formatFecha(selectedCampaignDetail.fecha_inicio)} — {formatFecha(selectedCampaignDetail.fecha_fin)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Estatus:</span>
                <StatusBadge status={normalizeStatus(selectedCampaignDetail.estado)} />
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Respuestas registradas:</span>
                <span className="font-bold text-[#1E3A5F]">
                  {selectedCampaignDetail.total_respuestas ?? selectedCampaignDetail.respuestas_count ?? 0}
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCampaignDetail(null)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN DE CAMPAÑA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Crear Nueva Campaña</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {typeof formError === 'object' ? JSON.stringify(formError) : String(formError)}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Nombre de la Campaña *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Evaluación Clima Q4 2026"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Guía de Referencia / Instrumento *</label>
                  <select
                    required
                    value={formData.guia_referencia}
                    onChange={(e) => setFormData({ ...formData, guia_referencia: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white"
                  >
                    <option value="">Seleccionar instrumento...</option>
                    {guias.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nombre || g.titulo || `Guía #${g.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Centro de Trabajo *</label>
                  <select
                    required
                    value={formData.centro_trabajo}
                    onChange={(e) => setFormData({ ...formData, centro_trabajo: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white"
                  >
                    <option value="">Seleccionar centro de trabajo...</option>
                    {centros.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha de Inicio *</label>
                    <input
                      type="date"
                      required
                      value={formData.fecha_inicio}
                      onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha de Cierre *</label>
                    <input
                      type="date"
                      required
                      value={formData.fecha_fin}
                      onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Estado Inicial</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white"
                  >
                    <option value="Activa">Activa</option>
                    <option value="Programada">Programada</option>
                    <option value="Finalizada">Finalizada</option>
                  </select>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex gap-2 items-start">
                  <Megaphone size={16} className="shrink-0 mt-0.5" />
                  <p>Las campañas activas enviarán notificaciones automáticas a los colaboradores asignados vía correo electrónico y recordatorios semanales si no han respondido.</p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#162c4a] transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={16} />}
                  Crear Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}