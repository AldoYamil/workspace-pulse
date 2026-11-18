// src/pages/PoliticasPrevencion.jsx
import { useState, useEffect } from 'react';
import { 
  FileText, Download, Eye, Plus, Search, Filter, 
  ShieldCheck, Calendar, Building2, AlertCircle, X, UploadCloud 
} from 'lucide-react';

// NOTA: En un entorno real, esto vendría de tu API (ej. axios.get('/api/politicas'))
// Por ahora simulamos la llamada asíncrona
const fetchPoliciesFromAPI = async () => {
  // Simula delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { 
      id: 1, 
      title: 'Política de Prevención de Riesgos Psicosociales', 
      company: 'WorkSpace Pulse Demo Corp.', 
      workplace: 'Todas las sedes', 
      version: 'v3.2', 
      effectiveDate: '2026-01-01', 
      reviewDate: '2027-01-01', 
      status: 'vigente',
      fileSize: '2.4 MB',
      fileUrl: '/docs/politica_general.pdf' // URL real que daría el backend
    },
    { 
      id: 2, 
      title: 'Protocolo de Atención a Violencia Laboral', 
      company: 'WorkSpace Pulse Demo Corp.', 
      workplace: 'Sede Central CDMX', 
      version: 'v2.0', 
      effectiveDate: '2026-03-15', 
      reviewDate: '2027-03-15', 
      status: 'vigente',
      fileSize: '1.8 MB',
      fileUrl: '/docs/protocolo_violencia.pdf'
    },
  ];
};

export default function PoliticasPrevencion() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  
  // Estado para el formulario de subida
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    company: '',
    workplace: 'Todas las sedes',
    effectiveDate: '',
    reviewDate: '',
    file: null
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchPoliciesFromAPI().then(data => {
      setPolicies(data);
      setLoading(false);
    });
  }, []);

  // Manejar cambios en inputs del modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPolicy(prev => ({ ...prev, [name]: value }));
  };

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setNewPolicy(prev => ({ ...prev, file: file }));
    } else {
      alert('Por favor selecciona un archivo PDF válido.');
    }
  };

  // Lógica de Subida (UPLOAD)
  const handleUpload = async () => {
    if (!newPolicy.file || !newPolicy.title) {
      alert('Faltan datos obligatorios o el archivo PDF.');
      return;
    }

    // AQUÍ VA LA LLAMADA AL BACKEND
    const formData = new FormData();
    formData.append('title', newPolicy.title);
    formData.append('company', newPolicy.company);
    formData.append('workplace', newPolicy.workplace);
    formData.append('effective_date', newPolicy.effectiveDate);
    formData.append('review_date', newPolicy.reviewDate);
    formData.append('pdf_file', newPolicy.file);

    try {
      // Ejemplo con fetch:
      // const response = await fetch('http://localhost:8000/api/politicas/', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${token}` }, // Si usas JWT
      //   body: formData
      // });
      
      console.log('Enviando al backend:', Object.fromEntries(formData));
      
      // Simulación de éxito
      alert('Política subida correctamente (Simulado)');
      setShowModal(false);
      // Recargar lista o añadir manualmente al estado local
      setNewPolicy({ title: '', company: '', workplace: 'Todas las sedes', effectiveDate: '', reviewDate: '', file: null });
    } catch (error) {
      console.error('Error al subir:', error);
      alert('Hubo un error al subir el archivo.');
    }
  };

  // Lógica de Descarga (DOWNLOAD)
  const handleDownload = (policy) => {
    // En producción, policy.fileUrl sería una URL real del backend
    // window.open(policy.fileUrl, '_blank'); 
    
    // Simulación: Crear un link temporal
    const link = document.createElement('a');
    link.href = '#'; // Aquí iría la URL real
    link.download = `${policy.title}.pdf`;
    // link.click(); 
    alert(`Descargando: ${policy.title}`);
  };

  // Lógica de Vista Previa (PREVIEW)
  const handlePreview = (policy) => {
    // Abre el PDF en una nueva pestaña del navegador
    // window.open(policy.fileUrl, '_blank');
    alert(`Abriendo vista previa de: ${policy.title}`);
  };

  // Filtrado
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          policy.workplace.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="text-white p-10">Cargando políticas...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Políticas de Prevención</h1>
          <p className="text-slate-300 text-base">Repositorio oficial de documentos institucionales NOM-035.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#162c4a] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Plus size={18} />
          Nueva Política
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o centro de trabajo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-[#1E3A5F] outline-none transition-all"
          />
        </div>
        
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
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
            <div key={policy.id} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group">
              
              <div className="p-6 pb-4 flex justify-between items-start">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#1E3A5F]">
                  <FileText size={24} />
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  policy.status === 'vigente' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                  {policy.status === 'vigente' ? 'Vigente' : 'Por Revisar'}
                </span>
              </div>

              <div className="px-6 pb-4 space-y-3">
                <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2">{policy.title}</h3>
                
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{policy.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span>Vigencia: {policy.effectiveDate} — {policy.reviewDate}</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button 
                  onClick={() => handlePreview(policy)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-colors"
                >
                  <Eye size={14} />
                  Vista Previa
                </button>
                <button 
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
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-400"/>
            <p className="text-slate-300 font-medium">No se encontraron políticas.</p>
          </div>
        )}
      </div>

      {/* MODAL DE CREACIÓN/SUBIDA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Subir Nueva Política</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nombre de la Política</label>
                <input 
                  type="text" 
                  name="title"
                  value={newPolicy.title}
                  onChange={handleInputChange}
                  placeholder="Ej. Política de Prevención de Acoso" 
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Empresa</label>
                  <select 
                    name="company"
                    value={newPolicy.company}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white"
                  >
                    <option value="">Seleccionar...</option>
                    <option>WorkSpace Pulse Demo Corp.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Centro de Trabajo</label>
                  <select 
                    name="workplace"
                    value={newPolicy.workplace}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white"
                  >
                    <option>Todas las sedes</option>
                    <option>Sede Central CDMX</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha Vigencia</label>
                  <input 
                    type="date" 
                    name="effectiveDate"
                    value={newPolicy.effectiveDate}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha Revisión</label>
                  <input 
                    type="date" 
                    name="reviewDate"
                    value={newPolicy.reviewDate}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Archivo PDF</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#1E3A5F] transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud size={24} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">
                    {newPolicy.file ? newPolicy.file.name : "Arrastra el archivo o haz clic"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PDF máximo 10MB</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button 
                onClick={handleUpload}
                className="px-4 py-2 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#162c4a] transition-colors flex items-center gap-2"
              >
                <UploadCloud size={16} />
                Publicar Política
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}