import { ShieldCheck } from 'lucide-react';

export default function EncuestaFinalizada() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center animate-in zoom-in-95 duration-300 border border-slate-100 relative overflow-hidden">
        
        {/* Elemento decorativo de fondo sutil */}
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
        
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShieldCheck size={48} className="text-emerald-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">
          ¡Gracias por tu participación!
        </h1>
        
        <p className="text-slate-600 mb-8 leading-relaxed text-lg">
          Tus respuestas han sido registradas de forma <strong className="text-emerald-700">100% anónima</strong>. 
          <br/>
          <span className="text-sm text-slate-500 mt-2 block">
            La información será utilizada exclusivamente para mejorar el entorno laboral y cumplir con los estándares de la NOM-035.
          </span>
        </p>

        <div className="space-y-3">
          <p className="text-sm text-slate-500 font-medium bg-slate-50 py-3 px-4 rounded-xl border border-slate-100 inline-block">
            Puedes cerrar esta ventana de forma segura.
          </p>
        </div>
      </div>
      
      {/* Footer legal consistente */}
      <footer className="fixed bottom-4 w-full text-center text-xs text-slate-400 pointer-events-none">
        © 2026 WorkSpace Pulse · Datos cifrados y anonimizados
      </footer>
    </div>
  );
}