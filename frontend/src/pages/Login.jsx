<<<<<<< HEAD
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importar el hook de navegación
=======
// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importa esto
>>>>>>> origin/selegna/frontend-dev

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
<<<<<<< HEAD
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // 2. Inicializar la función de navegación

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Intentando login con:', { email, password });

    // =========================================================================
    // ⚠️ ZONA DE CONEXIÓN CON BACKEND (DJANGO)
    // Aquí es donde en el futuro harás la petición HTTP (ej: axios.post / fetch) 
    // para autenticar las credenciales del usuario contra la API de Django.
    // =========================================================================

    // Simulación temporal: Al hacer clic, nos lleva directo al cuestionario/dashboard
    navigate('/cuestionario');
=======
  const navigate = useNavigate(); // 2. Inicializa el hook

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 3. SIMULACIÓN DE LOGIN PARA DESARROLLO
    // Cuando conectes Supabase/Backend, borrarás esto y usarás la autenticación real.
    console.log('Login simulado con:', { email, password });
    
    // Redirigir al Dashboard Ejecutivo
    navigate('/admin/dashboard');
>>>>>>> origin/selegna/frontend-dev
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1E3A5F] to-slate-900 px-4 py-12">
<<<<<<< HEAD
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* HEADER */}
=======
      {/* ... resto de tu diseño de Login intacto ... */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
>>>>>>> origin/selegna/frontend-dev
        <div className="px-8 pt-10 pb-6 text-center">
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">WorkSpace Pulse</h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">Plataforma de evaluación psicosocial y clima laboral</p>
        </div>

<<<<<<< HEAD
        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-5">
          
          {/* Campo Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@empresa.com"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg 
                         text-slate-800 placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent 
                         transition-all duration-200 ease-in-out"
            />
          </div>

          {/* Campo Contraseña CON OJO */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-lg 
                           text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent 
                           transition-all duration-200 ease-in-out"
              />
              {/* Botón de Ojo */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1E3A5F] 
                           transition-colors p-1 rounded-full focus:outline-none"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  // Icono Ojo Tachado (Ocultar)
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                ) : (
                  // Icono Ojo Abierto (Mostrar)
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Botón Principal */}
          <button
            type="submit"
            className="w-full mt-4 bg-[#1E3A5F] hover:bg-[#172A47] text-white 
                       font-bold py-3 rounded-lg shadow-md hover:shadow-lg 
                       transform hover:-translate-y-0.5 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A5F]"
          >
=======
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
>>>>>>> origin/selegna/frontend-dev
            Iniciar sesión
          </button>
        </form>

<<<<<<< HEAD
        {/* FOOTER LEGAL */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">© 2026 WorkSpace Pulse · Cumplimiento NOM-035-STPS-2018</p>
        </div>
        
=======
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">© 2026 WorkSpace Pulse · Cumplimiento NOM-035-STPS-2018</p>
        </div>
>>>>>>> origin/selegna/frontend-dev
      </div>
    </div>
  );
}