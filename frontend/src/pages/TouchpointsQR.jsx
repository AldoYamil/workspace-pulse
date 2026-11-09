// src/pages/TouchpointsQR.jsx
import { useState } from 'react';
import { 
  QrCode, Download, Printer, Copy, Plus, 
  Search, Filter, Monitor, Smartphone, CheckCircle2 
} from 'lucide-react';

// --- DATOS MOCK (Simulando Backend de Diego) ---
const MOCK_QRS = [
  { 
    id: 101, 
    surveyName: 'Guía de Referencia I - NOM-035', 
    type: 'Campaña Digital', 
    dateCreated: '01 Oct 2026', 
    scans: 145,
    status: 'active'
  },
  { 
    id: 102, 
    surveyName: 'Kiosco Recepción Principal', 
    type: 'Punto Físico', 
    dateCreated: '15 Sep 2026', 
    scans: 892,
    status: 'active'
  },
  { 
    id: 103, 
    surveyName: 'Encuesta Clima Q3', 
    type: 'Campaña Digital', 
    dateCreated: '10 Ago 2026', 
    scans: 410,
    status: 'expired'
  },
];

export default function TouchpointsQR() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Función simulada para descargar QR
  const handleDownload = (id) => {
    alert(`Descargando QR #${id} en formato PNG...`);
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
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#162c4a] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Plus size={18} />
          Generar Nuevo QR
        </button>
      </div>

      {/* ESTADÍSTICAS RÁPIDAS (Tarjetas Glassmorphism) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-300">
            <QrCode size={24} />
          </div>
          <div>
            <p className="text-slate-300 text-sm">QRs Activos</p>
            <p className="text-2xl font-bold text-white">12</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-300">
            <Monitor size={24} />
          </div>
          <div>
            <p className="text-slate-300 text-sm">Escaneos Totales</p>
            <p className="text-2xl font-bold text-white">3,420</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-lg text-amber-300">
            <Smartphone size={24} />
          </div>
          <div>
            <p className="text-slate-300 text-sm">Puntos Físicos</p>
            <p className="text-2xl font-bold text-white">4</p>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Buscar por nombre de encuesta o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-[#1E3A5F] outline-none"
          />
        </div>
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <select className="w-full pl-10 pr-8 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#1E3A5F] outline-none appearance-none cursor-pointer">
            <option value="all">Todos los tipos</option>
            <option value="digital">Campaña Digital</option>
            <option value="physical">Punto Físico</option>
          </select>
        </div>
      </div>

      {/* GRID DE TARJETAS QR (Más visual que una tabla para este caso) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_QRS.filter(q => q.surveyName.toLowerCase().includes(searchTerm.toLowerCase())).map((qr) => (
          <div key={qr.id} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group">
            {/* Área del QR Visual */}
            <div className="bg-slate-50 p-8 flex justify-center items-center border-b border-slate-100 relative">
              {/* Simulación de QR con CSS/Icono */}
              <div className="w-32 h-32 bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center">
                <QrCode size={64} className="text-slate-800" />
              </div>
              
              {/* Badge de Estatus Flotante */}
              <span className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-bold border ${
                qr.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {qr.status === 'active' ? 'Activo' : 'Expirado'}
              </span>
            </div>

            {/* Información del QR */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 text-lg leading-tight">{qr.surveyName}</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 uppercase tracking-wide font-semibold">{qr.type}</p>
              
              <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                <span>Creado: {qr.dateCreated}</span>
                <span className="font-bold text-[#1E3A5F]">{qr.scans} escaneos</span>
              </div>

              {/* Acciones */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button 
                  onClick={() => handleDownload(qr.id)}
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#1E3A5F] transition-colors text-sm font-medium"
                >
                  <Download size={16} />
                  Descargar
                </button>
                <button className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#1E3A5F] text-white hover:bg-[#162c4a] transition-colors text-sm font-medium">
                  <Printer size={16} />
                  Imprimir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE GENERACIÓN (Simulado) */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Generar Nuevo Touchpoint</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Punto</label>
                <input type="text" placeholder="Ej. Kiosco Sala de Juntas" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asignar a Encuesta</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] outline-none bg-white">
                  <option>Guía de Referencia I - NOM-035</option>
                  <option>Encuesta de Clima Laboral Q3</option>
                </select>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex gap-2">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                El código QR se generará automáticamente y estará listo para imprimir en tamaño A4 o A5.
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowGenerateModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button onClick={() => { alert('QR Generado'); setShowGenerateModal(false); }} className="px-4 py-2 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#162c4a] transition-colors">Generar QR</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}