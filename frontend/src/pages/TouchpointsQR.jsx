// src/pages/TouchpointsQR.jsx
import { useState } from 'react';
import { 
  QrCode, Download, Printer, Plus, Trash2,
  Search, Filter, Monitor, Smartphone, CheckCircle2, Loader2 
} from 'lucide-react';
import { useTouchpoints } from '../hooks/useTouchpoints';
import { useCentrosTrabajo } from '../hooks/useCentrosTrabajo';
import { useAreas } from '../hooks/useAreas';
import { usePuesto } from '../hooks/usePuesto';

export default function TouchpointsQR() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCentro, setFilterCentro] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Hooks reales sincronizados con el backend
  const { touchpoints, loading, error, createTouchpoint, deleteTouchpoint } = useTouchpoints();
  const { centros } = useCentrosTrabajo();
  const { areas } = useAreas();
  const { puestos } = usePuesto();

  // Estado del formulario alineado con el modelo Touchpoint de Django
  const [formData, setFormData] = useState({
    nombre: '',
    codigo_qr_token: '',
    centro_trabajo: '',
    area: '',
    puesto: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Genera un token único automático al abrir el modal (ej. TP-A8F92K10)
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
    });
    setShowGenerateModal(true);
  };

  // Filtra las áreas según el centro de trabajo seleccionado (si aplica)
  const areasFiltradas = formData.centro_trabajo
    ? areas.filter((a) => {
        const centroId = typeof a.centro_trabajo === 'object' ? a.centro_trabajo?.id : a.centro_trabajo;
        return String(centroId) === String(formData.centro_trabajo);
      })
    : areas;

  // Enviar formulario al backend (POST)
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

  // Descargar imagen PNG del QR usando el token real
  const handleDownload = (tp) => {
    const encuestaUrl = `${window.location.origin}/encuesta?token=${tp.codigo_qr_token}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(encuestaUrl)}`;
    window.open(qrApiUrl, '_blank');
  };

  // Filtrado de tarjetas en pantalla
  const touchpointsFiltrados = touchpoints.filter((tp) => {
    const matchNombre =
      tp.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tp.codigo_qr_token?.toLowerCase().includes(searchTerm.toLowerCase());

    const centroId = typeof tp.centro_trabajo === 'object' ? tp.centro_trabajo?.id : tp.centro_trabajo;
    const matchCentro = filterCentro === 'all' || String(centroId) === String(filterCentro);

    return matchNombre && matchCentro;
  });

  // Helpers para mostrar nombres de llaves foráneas en las tarjetas
  const getNombreRelacion = (valor, lista) => {
    if (!valor) return 'N/A';
    if (typeof valor === 'object') return valor.nombre;
    const encontrado = lista.find((item) => String(item.id) === String(valor));
    return encontrado ? encontrado.nombre : `#${valor}`;
  };

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
            <p className="text-slate-300 text-sm">Áreas Activas</p>
            <p className="text-2xl font-bold text-white">{areas.length}</p>
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
            const encuestaUrl = `${window.location.origin}/encuesta?token=${tp.codigo_qr_token}`;
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(encuestaUrl)}`;

            return (
              <div key={tp.id} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group">
                {/* Área del QR Visual */}
                <div className="bg-slate-50 p-6 flex justify-center items-center border-b border-slate-100 relative">
                  <div className="w-36 h-36 bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center">
                    <img src={qrImageUrl} alt={`QR ${tp.nombre}`} className="w-full h-full object-contain" />
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
                <div className="p-5">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{tp.nombre}</h3>
                  <p className="text-xs font-mono text-slate-400 mb-3 truncate">{tp.codigo_qr_token}</p>
                  
                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg mb-4">
                    <p><strong className="text-slate-700">Centro:</strong> {getNombreRelacion(tp.centro_trabajo, centros)}</p>
                    <p><strong className="text-slate-700">Área:</strong> {getNombreRelacion(tp.area, areas)}</p>
                    <p><strong className="text-slate-700">Puesto:</strong> {getNombreRelacion(tp.puesto, puestos)}</p>
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

      {/* MODAL DE GENERACIÓN CON CAMPOS DEL MODELO Touchpoint */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Generar Nuevo Touchpoint</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {typeof formError === 'object' ? JSON.stringify(formError) : String(formError)}
                  </div>
                )}

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

                {/* Campo: centro_trabajo (ForeignKey) */}
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

                {/* Campo: area (ForeignKey) */}
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

                {/* Campo: puesto (ForeignKey) */}
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

                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 flex gap-2">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  <span>El QR apuntará a <strong>/encuesta?token={formData.codigo_qr_token}</strong> con los IDs vinculados.</span>
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