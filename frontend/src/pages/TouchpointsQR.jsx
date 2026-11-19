// src/pages/TouchpointsQR.jsx
import { useState, useEffect } from 'react';
import {
  QrCode, Download, Printer, Plus, Trash2,
  Search, Filter, Monitor, Smartphone, CheckCircle2, Loader2, ExternalLink, Copy, Check, FileText
} from 'lucide-react';
import { useTouchpoints } from '../hooks/useTouchpoints';
import { useCentrosTrabajo } from '../hooks/useCentrosTrabajo';
import { useAreas } from '../hooks/useAreas';
import { usePuesto } from '../hooks/usePuesto';
import { useEncuesta } from '../hooks/useEncuesta';
import { useCampanaEvaluacion } from '../hooks/useCampanaEvaluacion';

export default function TouchpointsQR() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCentro, setFilterCentro] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Hooks reales sincronizados con el backend
  const { touchpoints, loading, error, createTouchpoint, deleteTouchpoint } = useTouchpoints();
  const { centros } = useCentrosTrabajo();
  const { areas } = useAreas();
  const { puestos } = usePuesto();
  const { guias } = useEncuesta({ autoFetchGuias: true });

  // Estado del formulario + encuesta seleccionada
  const [formData, setFormData] = useState({
    nombre: '',
    codigo_qr_token: '',
    centro_trabajo: '',
    area: '',
    puesto: '',
    guia_id: '',
    campana_id: '',
  });

  // Cargar campañas reales según la encuesta y centro elegidos
  const { campanas, loading: loadingCampanas } = useCampanaEvaluacion(
    formData.guia_id || null,
    formData.centro_trabajo || null
  );

  // Persistencia local de la encuesta vinculada a cada token QR
  const [qrEncuestaMap, setQrEncuestaMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wp_qr_encuestas') || '{}');
    } catch {
      return {};
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const generarTokenUnico = () => {
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `TP-${Date.now().toString(36).toUpperCase()}-${randomStr}`;
  };

  const handleOpenModal = () => {
    setFormError(null);
    setFormData({
      nombre: '',
      codigo_qr_token: generarTokenUnico(),
      centro_trabajo: '',
      area: '',
      puesto: '',
      guia_id: guias[0]?.id ? String(guias[0].id) : '',
      campana_id: '',
    });
    setShowGenerateModal(true);
  };

  // Autoseleccionar campaña activa si existe para esa encuesta y centro
  useEffect(() => {
    if (campanas.length > 0) {
      const activa =
        campanas.find((c) => String(c.estado || '').toLowerCase().includes('activ')) || campanas[0];
      setFormData((prev) => ({ ...prev, campana_id: String(activa.id) }));
    } else {
      setFormData((prev) => ({ ...prev, campana_id: '' }));
    }
  }, [campanas]);

  const areasFiltradas = formData.centro_trabajo
    ? areas.filter((a) => {
        const centroId = typeof a.centro_trabajo === 'object' ? a.centro_trabajo?.id : (a.centro_trabajo ?? a.centro_id);
        return String(centroId) === String(formData.centro_trabajo);
      })
    : areas;

  // Construye la URL exacta hacia la encuesta seleccionada
  const buildEncuestaUrl = (tp) => {
    const params = new URLSearchParams();
    if (tp.codigo_qr_token) params.set('token', tp.codigo_qr_token);

    const savedMeta = qrEncuestaMap[tp.codigo_qr_token] || {};
    const guiaId =
      tp.guia_id ||
      (typeof tp.guia_referencia === 'object' ? tp.guia_referencia?.id : tp.guia_referencia) ||
      savedMeta.guiaId;

    const campanaId =
      tp.campana_id ||
      (typeof tp.campana === 'object' ? tp.campana?.id : tp.campana) ||
      savedMeta.campanaId;

    const areaId =
      (typeof tp.area === 'object' ? tp.area?.id : (tp.area ?? tp.area_id)) ||
      savedMeta.areaId;

    if (guiaId) params.set('guia', String(guiaId));
    if (campanaId) params.set('campana', String(campanaId));
    if (areaId) params.set('area', String(areaId));

    return `${window.location.origin}/encuesta?${params.toString()}`;
  };

  const getNombreEncuestaVinculada = (tp) => {
    const savedMeta = qrEncuestaMap[tp.codigo_qr_token] || {};
    const guiaId =
      tp.guia_id ||
      (typeof tp.guia_referencia === 'object' ? tp.guia_referencia?.id : tp.guia_referencia) ||
      savedMeta.guiaId;

    if (!guiaId) return 'Encuesta General / Por defecto';
    const encontrada = guias.find((g) => String(g.id) === String(guiaId));
    return encontrada ? (encontrada.nombre || encontrada.titulo) : `Encuesta #${guiaId}`;
  };

  const handleCopyUrl = async (tp, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(tp.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert('No se pudo copiar el enlace al portapapeles.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload = {
      nombre: formData.nombre,
      codigo_qr_token: formData.codigo_qr_token,
      centro_trabajo: parseInt(formData.centro_trabajo, 10),
      area: parseInt(formData.area, 10),
      puesto: parseInt(formData.puesto, 10),
    };

    const result = await createTouchpoint(payload);

    if (result.success) {
      const tokenGuardado = result.data?.codigo_qr_token || formData.codigo_qr_token;
      const updatedMap = {
        ...qrEncuestaMap,
        [tokenGuardado]: {
          guiaId: formData.guia_id || null,
          campanaId: formData.campana_id || null,
          areaId: formData.area || null,
        },
      };
      setQrEncuestaMap(updatedMap);
      localStorage.setItem('wp_qr_encuestas', JSON.stringify(updatedMap));
      setShowGenerateModal(false);
    } else {
      setFormError(result.error);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar este Touchpoint QR?')) return;
    const res = await deleteTouchpoint(id);
    if (!res.success) {
      alert('Error al eliminar: ' + JSON.stringify(res.error));
    }
  };

  const handleDownload = (tp) => {
    const encuestaUrl = buildEncuestaUrl(tp);
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(encuestaUrl)}`;
    window.open(qrApiUrl, '_blank');
  };

  const resolverNombreCampo = (tp, keys, lista) => {
    for (const key of keys) {
      const val = tp?.[key];
      if (val !== undefined && val !== null && val !== '') {
        if (typeof val === 'object') {
          return val.nombre || val.titulo || `#${val.id}`;
        }
        if (typeof val === 'string' && Number.isNaN(Number(val))) {
          return val;
        }
        const encontrado = lista.find((item) => String(item.id) === String(val));
        if (encontrado) return encontrado.nombre || encontrado.titulo;
        return `#${val}`;
      }
    }
    return 'No asignado';
  };

  const touchpointsFiltrados = touchpoints.filter((tp) => {
    const matchNombre =
      tp.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tp.codigo_qr_token?.toLowerCase().includes(searchTerm.toLowerCase());

    const rawCentro =
      typeof tp.centro_trabajo === 'object'
        ? tp.centro_trabajo?.id
        : (tp.centro_trabajo ?? tp.centro_id ?? tp.centro);

    const matchCentro = filterCentro === 'all' || String(rawCentro) === String(filterCentro);

    return matchNombre && matchCentro;
  });

  // Vista previa de URL dentro del modal
  const previewModalUrl = `${window.location.origin}/encuesta?token=${formData.codigo_qr_token}${
    formData.guia_id ? `&guia=${formData.guia_id}` : ''
  }${formData.campana_id ? `&campana=${formData.campana_id}` : ''}${
    formData.area ? `&area=${formData.area}` : ''
  }`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Touchpoints & QR</h1>
          <p className="text-slate-300 text-base">Administra los códigos de acceso físico y digital para tus encuestas.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#162c4a] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Plus size={18} />
          Generar Nuevo QR
        </button>
      </div>

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-300">
            <QrCode size={24} />
          </div>
          <div>
            <p className="text-slate-300 text-sm">Touchpoints Registrados</p>
            <p className="text-2xl font-bold text-white">{touchpoints.length}</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-300">
            <Monitor size={24} />
          </div>
          <div>
            <p className="text-slate-300 text-sm">Centros Cubiertos</p>
            <p className="text-2xl font-bold text-white">{centros.length}</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-lg text-amber-300">
            <Smartphone size={24} />
          </div>
          <div>
            <p className="text-slate-300 text-sm">Encuestas Disponibles</p>
            <p className="text-2xl font-bold text-white">{guias.length}</p>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre del punto o token QR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-[#1E3A5F] outline-none"
          />
        </div>
        <div className="relative min-w-[220px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={filterCentro}
            onChange={(e) => setFilterCentro(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#1E3A5F] outline-none appearance-none cursor-pointer"
          >
            <option value="all">Todos los centros de trabajo</option>
            {centros.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ESTADO DE CARGA / ERROR */}
      {loading && (
        <div className="p-12 flex flex-col items-center justify-center text-slate-300 gap-3 bg-white/10 rounded-2xl">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm font-medium">Cargando touchpoints desde el servidor...</p>
        </div>
      )}

      {error && (
        <div className="p-6 text-center text-red-700 bg-red-50 rounded-xl">
          <p className="font-bold">Error al cargar Touchpoints</p>
          <p className="text-sm">{typeof error === 'object' ? JSON.stringify(error) : error}</p>
        </div>
      )}

      {/* GRID DE TARJETAS QR */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {touchpointsFiltrados.map((tp) => {
            const encuestaUrl = buildEncuestaUrl(tp);
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(encuestaUrl)}`;

            const centroNombre = resolverNombreCampo(
              tp,
              ['centro_trabajo_nombre', 'centro_nombre', 'centro_trabajo', 'centro_id', 'centro'],
              centros
            );
            const areaNombre = resolverNombreCampo(
              tp,
              ['area_nombre', 'area', 'area_id'],
              areas
            );
            const puestoNombre = resolverNombreCampo(
              tp,
              ['puesto_nombre', 'puesto', 'puesto_id'],
              puestos
            );

            return (
              <div key={tp.id} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col justify-between">
                {/* Área del QR Visual */}
                <div className="bg-slate-50 p-6 flex flex-col items-center justify-center border-b border-slate-100 relative">
                  <a
                    href={encuestaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir encuesta vinculada a este QR"
                    className="w-36 h-36 bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center hover:border-[#1E3A5F] transition-colors"
                  >
                    <img src={qrImageUrl} alt={`QR ${tp.nombre}`} className="w-full h-full object-contain" />
                  </a>

                  {/* URL DIRECTA A LA ENCUESTA DEBAJO DEL QR */}
                  <div className="mt-3 w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2">
                    <a
                      href={encuestaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-[#1E3A5F] hover:underline truncate flex-1"
                      title={encuestaUrl}
                    >
                      {encuestaUrl}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(tp, encuestaUrl)}
                      title="Copiar URL de la encuesta"
                      className="p-1 text-slate-400 hover:text-[#1E3A5F] rounded transition-colors shrink-0"
                    >
                      {copiedId === tp.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Botón eliminar flotante */}
                  <button
                    onClick={() => handleDelete(tp.id)}
                    title="Eliminar Touchpoint"
                    className="absolute top-3 left-3 p-1.5 bg-white text-slate-400 hover:text-red-600 rounded-lg shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={15} />
                  </button>

                  {/* Badge ID */}
                  <span className="absolute top-3 right-3 px-2 py-1 rounded text-xs font-mono font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    #{tp.id}
                  </span>
                </div>

                {/* Información del Touchpoint */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{tp.nombre}</h3>
                      <a
                        href={encuestaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir encuesta en nueva pestaña"
                        className="text-slate-400 hover:text-[#1E3A5F] shrink-0 mt-0.5"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>

                    {/* Encuesta vinculada */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-[#1E3A5F] text-xs font-semibold mb-3">
                      <FileText size={13} />
                      <span className="truncate max-w-[230px]">{getNombreEncuestaVinculada(tp)}</span>
                    </div>

                    {/* Datos de Centro, Área y Puesto */}
                    <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg mb-4 border border-slate-100">
                      <p><strong className="text-slate-700">Centro:</strong> {centroNombre}</p>
                      <p><strong className="text-slate-700">Área:</strong> {areaNombre}</p>
                      <p><strong className="text-slate-700">Puesto:</strong> {puestoNombre}</p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownload(tp)}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#1E3A5F] transition-colors text-sm font-medium"
                    >
                      <Download size={16} />
                      Descargar
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#1E3A5F] text-white hover:bg-[#162c4a] transition-colors text-sm font-medium"
                    >
                      <Printer size={16} />
                      Imprimir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE GENERACIÓN CON SELECTOR DE ENCUESTA */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Generar Nuevo Touchpoint</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {typeof formError === 'object' ? JSON.stringify(formError) : String(formError)}
                  </div>
                )}

                {/* Selector de Encuesta Destino (6 Ejes NOM-035) */}
                <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#1E3A5F] mb-1">
                      1. Encuesta NOM-035 que abrirá este QR *
                    </label>
                    <select
                      required
                      value={formData.guia_id}
                      onChange={(e) => setFormData({ ...formData, guia_id: e.target.value, campana_id: '' })}
                      className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white text-sm font-medium text-slate-800"
                    >
                      <option value="">Selecciona cuál encuesta abrirá...</option>
                      {guias.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nombre || g.titulo || `Encuesta #${g.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {campanas.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Campaña asociada (opcional)
                      </label>
                      <select
                        value={formData.campana_id}
                        onChange={(e) => setFormData({ ...formData, campana_id: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white text-xs text-slate-700"
                      >
                        <option value="">
                          {loadingCampanas ? 'Cargando campañas...' : 'Vincular automáticamente a la encuesta'}
                        </option>
                        {campanas.map((c) => (
                          <option key={c.id} value={c.id}>{c.nombre} ({c.estado})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Campo: nombre */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Punto *</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Kiosco Comedor Planta 1"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm"
                  />
                </div>

                {/* Campo: codigo_qr_token */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Token Único QR *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={formData.codigo_qr_token}
                      onChange={(e) => setFormData({ ...formData, codigo_qr_token: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 font-mono text-xs text-slate-700 focus:ring-2 focus:ring-[#1E3A5F] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, codigo_qr_token: generarTokenUnico() })}
                      className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    >
                      Regenerar
                    </button>
                  </div>
                </div>

                {/* Campo: centro_trabajo */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Centro de Trabajo *</label>
                  <select
                    required
                    value={formData.centro_trabajo}
                    onChange={(e) => setFormData({ ...formData, centro_trabajo: e.target.value, area: '' })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white text-sm"
                  >
                    <option value="">Seleccione un Centro de Trabajo...</option>
                    {centros.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Campo: area */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Área *</label>
                  <select
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white text-sm"
                  >
                    <option value="">Seleccione un Área...</option>
                    {areasFiltradas.map((a) => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Campo: puesto */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Puesto *</label>
                  <select
                    required
                    value={formData.puesto}
                    onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white text-sm"
                  >
                    <option value="">Seleccione un Puesto...</option>
                    {puestos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Vista previa de la URL generada */}
                <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-700 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-[#1E3A5F]">
                    <CheckCircle2 size={14} />
                    <span>URL destino del código QR:</span>
                  </div>
                  <p className="font-mono text-[11px] break-all text-slate-600">{previewModalUrl}</p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#162c4a] transition-colors text-sm flex items-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={15} />}
                  Guardar y Generar QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}