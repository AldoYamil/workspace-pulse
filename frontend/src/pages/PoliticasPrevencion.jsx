// src/pages/PoliticasPrevencion.jsx
import { useState } from 'react';
import {
  FileText, Download, Eye, Plus, Search, Filter,
  Calendar, Building2, AlertCircle, X, UploadCloud,
  Loader2, Trash2, CheckCircle2
} from 'lucide-react';
import { usePoliticasPrevencion } from '../hooks/usePoliticasPrevencion';
import { useCentrosTrabajo } from '../hooks/useCentrosTrabajo';

export default function PoliticasPrevencion() {
  const {
    normalizedPoliticas,
    loading,
    error: errorMsg,
    createPolitica,
    updatePolitica,
    deletePolitica,
  } = usePoliticasPrevencion();

  const { centros } = useCentrosTrabajo();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [newPolicy, setNewPolicy] = useState({
    titulo: '',
    descripcion: '',
    centro_trabajo: '',
    version: 'v1.0',
    fecha_vigencia: '',
    fecha_revision: '',
    vigente: true,
    file: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPolicy((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === 'application/pdf') {
      setNewPolicy((prev) => ({ ...prev, file }));
    } else {
      alert('Por favor selecciona un archivo PDF válido.');
    }
  };

  const resetForm = () => {
    setNewPolicy({
      titulo: '',
      descripcion: '',
      centro_trabajo: centros[0]?.id ? String(centros[0].id) : '',
      version: 'v1.0',
      fecha_vigencia: '',
      fecha_revision: '',
      vigente: true,
      file: null,
    });
    setFormError(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

const handleUpload = async (e) => {
    e.preventDefault();
    if (!newPolicy.titulo.trim() || !newPolicy.centro_trabajo) {
      setFormError('El nombre de la política y el centro de trabajo son obligatorios.');
      return;
    }

    if (!newPolicy.descripcion.trim()) {
      setFormError('El contenido o descripción de la política es obligatorio.');
      return;
    }

    // Obtiene el empresa_id del centro de trabajo seleccionado
    const centroSeleccionado = centros.find(
      (c) => String(c.id) === String(newPolicy.centro_trabajo)
    );
    const empresaId =
      centroSeleccionado?.empresa_id ??
      (typeof centroSeleccionado?.empresa === 'object'
        ? centroSeleccionado?.empresa?.id
        : centroSeleccionado?.empresa);

    setSubmitting(true);
    setFormError(null);

    const textoPolitica = newPolicy.descripcion.trim();

    let payload;
    if (newPolicy.file) {
      const formData = new FormData();
      formData.append('titulo', newPolicy.titulo.trim());
      formData.append('nombre', newPolicy.titulo.trim());
      formData.append('contenido_texto', textoPolitica);
      formData.append('descripcion', textoPolitica);
      formData.append('centro_trabajo', Number(newPolicy.centro_trabajo));
      if (empresaId) {
        formData.append('empresa', Number(empresaId));
      }
      formData.append('version', newPolicy.version.trim() || 'v1.0');
      if (newPolicy.fecha_vigencia) {
        formData.append('fecha_vigencia', newPolicy.fecha_vigencia);
        formData.append('fecha_publicacion', newPolicy.fecha_vigencia);
      }
      if (newPolicy.fecha_revision) {
        formData.append('fecha_revision', newPolicy.fecha_revision);
      }
      formData.append('vigente', newPolicy.vigente);
      formData.append('archivo_pdf', newPolicy.file);
      formData.append('pdf_file', newPolicy.file);
      payload = formData;
    } else {
      payload = {
        titulo: newPolicy.titulo.trim(),
        nombre: newPolicy.titulo.trim(),
        contenido_texto: textoPolitica,
        descripcion: textoPolitica,
        centro_trabajo: Number(newPolicy.centro_trabajo),
        ...(empresaId ? { empresa: Number(empresaId) } : {}),
        version: newPolicy.version.trim() || 'v1.0',
        fecha_vigencia: newPolicy.fecha_vigencia || null,
        fecha_publicacion: newPolicy.fecha_vigencia || null,
        fecha_revision: newPolicy.fecha_revision || null,
        vigente: newPolicy.vigente,
      };
    }

    const result = await createPolitica(payload);
    if (result.success) {
      setShowModal(false);
      resetForm();
    } else {
      setFormError(result.error);
    }
    setSubmitting(false);
  };

  const handleToggleVigente = async (policy) => {
    const nuevoEstado = policy.status !== 'vigente';
    const result = await updatePolitica(policy.id, { vigente: nuevoEstado });
    if (!result.success) {
      alert('No se pudo actualizar el estatus: ' + JSON.stringify(result.error));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta política de prevención?')) return;
    const result = await deletePolitica(id);
    if (!result.success) {
      alert('No se pudo eliminar: ' + JSON.stringify(result.error));
    }
  };

  const openPrintablePolicy = (policy) => {
    const win = window.open('', '_blank', 'width=800,height=650');
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>${policy.title}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 36px; color: #1e293b;">
          <h2 style="color: #1E3A5F; margin-bottom: 4px;">${policy.title}</h2>
          <p style="color: #64748b; margin-top: 0;">Documento Institucional NOM-035-STPS-2018 • ${policy.version}</p>
          <hr />
          <p><strong>Centro de Trabajo:</strong> ${policy.workplace}</p>
          <p><strong>Vigencia:</strong> ${policy.effectiveDate} — ${policy.reviewDate}</p>
          <p><strong>Estatus:</strong> ${policy.status === 'vigente' ? 'Vigente' : 'Por revisar'}</p>
          <div style="margin-top: 24px; line-height: 1.6;">
            ${policy.descripcion || 'Política oficial de prevención de factores de riesgo psicosocial, prevención de la violencia laboral y promoción de un entorno organizacional favorable.'}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handlePreview = (policy) => {
    if (policy.fileUrl) {
      window.open(policy.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    openPrintablePolicy(policy);
  };

  const handleDownload = (policy) => {
    if (policy.fileUrl) {
      const link = document.createElement('a');
      link.href = policy.fileUrl;
      link.target = '_blank';
      link.download = `${policy.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    openPrintablePolicy(policy);
  };

  const filteredPolicies = normalizedPoliticas.filter((policy) => {
    const matchesSearch =
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.workplace.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-300 gap-3">
        <Loader2 className="animate-spin" size={32} />
        <p className="text-sm font-medium">Cargando políticas de prevención...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Políticas de Prevención</h1>
          <p className="text-slate-300 text-base">
            Repositorio oficial de documentos institucionales NOM-035.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#162c4a] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl active:scale-95 border border-white/15"
        >
          <Plus size={18} />
          Nueva Política
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-400/40 text-red-100 text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg}</span>
        </div>
      )}

      {/* FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o centro de trabajo..."
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
            <option value="vigente">Vigentes</option>
            <option value="por_revisar">Por Revisar</option>
          </select>
        </div>
      </div>

      {/* GRID DE DOCUMENTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPolicies.length > 0 ? (
          filteredPolicies.map((policy) => (
            <div
              key={policy.id}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="p-6 pb-4 flex justify-between items-start gap-2">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#1E3A5F] shrink-0">
                    <FileText size={24} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleVigente(policy)}
                      title="Cambiar estado de vigencia"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                        policy.status === 'vigente'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200'
                      }`}
                    >
                      {policy.status === 'vigente' && <CheckCircle2 size={12} />}
                      {policy.status === 'vigente' ? 'Vigente' : 'Por Revisar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(policy.id)}
                      title="Eliminar política"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="px-6 pb-4 space-y-3">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2">
                    {policy.title}
                  </h3>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{policy.workplace}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400 shrink-0" />
                      <span>
                        Vigencia: {policy.effectiveDate} — {policy.reviewDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePreview(policy)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-colors"
                >
                  <Eye size={14} />
                  Vista Previa
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(policy)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-white bg-[#1E3A5F] rounded-lg hover:bg-[#162c4a] transition-colors"
                >
                  <Download size={14} />
                  Descargar PDF
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-400" />
            <p className="text-slate-300 font-medium">No se encontraron políticas registradas.</p>
          </div>
        )}
      </div>

      {/* MODAL DE CREACIÓN/SUBIDA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Subir Nueva Política</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {typeof formError === 'object' ? JSON.stringify(formError) : String(formError)}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Nombre de la Política
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    required
                    value={newPolicy.titulo}
                    onChange={handleInputChange}
                    placeholder="Ej. Política de Prevención de Riesgos Psicosociales"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Descripción / Alcance
                  </label>
                  <textarea
                    name="descripcion"
                    rows={2}
                    value={newPolicy.descripcion}
                    onChange={handleInputChange}
                    placeholder="Breve resumen del compromiso institucional..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Centro de Trabajo
                    </label>
                    <select
                      name="centro_trabajo"
                      required
                      value={newPolicy.centro_trabajo}
                      onChange={handleInputChange}
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

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Versión</label>
                    <input
                      type="text"
                      name="version"
                      value={newPolicy.version}
                      onChange={handleInputChange}
                      placeholder="v1.0"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Fecha Vigencia
                    </label>
                    <input
                      type="date"
                      name="fecha_vigencia"
                      value={newPolicy.fecha_vigencia}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Fecha Revisión
                    </label>
                    <input
                      type="date"
                      name="fecha_revision"
                      value={newPolicy.fecha_revision}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Archivo PDF (Opcional si el modelo no exige archivo)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center hover:border-[#1E3A5F] transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud size={24} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">
                      {newPolicy.file ? newPolicy.file.name : 'Arrastra el archivo PDF o haz clic'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF máximo 10MB</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#162c4a] transition-colors flex items-center gap-2 text-sm"
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  <UploadCloud size={16} />
                  Publicar Política
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}