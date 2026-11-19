// src/pages/Unauthorized.jsx
import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home, Lock } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1E3A5F] to-slate-800 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center relative z-10 animate-in zoom-in-95 duration-300">
        
        {/* Icono Principal */}
        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 shadow-inner">
          <ShieldX size={48} className="text-red-300" />
        </div>

        {/* Código de Error */}
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-white mb-2 tracking-tighter opacity-90">
          403
        </h1>

        {/* Mensaje Claro y Seguro */}
        <h2 className="text-2xl font-bold text-white mb-3">Acceso Denegado</h2>
        <p className="text-slate-300 mb-8 leading-relaxed">
          No tienes los permisos necesarios para acceder a esta sección. 
          Tu rol actual no está autorizado para visualizar este contenido.
        </p>

        {/* Botones de Acción Seguros */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all border border-white/20 hover:border-white/40 active:scale-95"
          >
            <ArrowLeft size={18} />
            Volver atrás
          </button>
          
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1E3A5F] hover:bg-[#162c4a] text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-900/30 active:scale-95"
          >
            <Home size={18} />
            Ir al Dashboard
          </button>
        </div>

        {/* Nota Técnica Discreta */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-slate-400/60 flex items-center justify-center gap-2">
            <Lock size={12} />
            Error Code: PERMISSION_DENIED • WorkSpace Pulse v1.0
          </p>
        </div>
      </div>
    </div>
  );
}