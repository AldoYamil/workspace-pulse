// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importa esto

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // 2. Inicializa el hook

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 3. SIMULACIÓN DE LOGIN PARA DESARROLLO
    // Cuando conectes Supabase/Backend, borrarás esto y usarás la autenticación real.
    console.log('Login simulado con:', { email, password });
    
    // Redirigir al Dashboard Ejecutivo
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1E3A5F] to-slate-900 px-4 py-12">
      {/* ... resto de tu diseño de Login intacto ... */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="px-8 pt-10 pb-6 text-center">
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">WorkSpace Pulse</h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">Plataforma de evaluación psicosocial y clima laboral</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ejemplo@empresa.com" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all duration-200 ease-in-out" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contraseña</label>
            <div className="relative">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all duration-200 ease-in-out" />
              {/* ... icono de ojo intacto ... */}
            </div>
          </div>

          <button type="submit" className="w-full mt-4 bg-[#1E3A5F] hover:bg-[#172A47] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A5F]">
            Iniciar sesión
          </button>
        </form>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">© 2026 WorkSpace Pulse · Cumplimiento NOM-035-STPS-2018</p>
        </div>
      </div>
    </div>
  );
}