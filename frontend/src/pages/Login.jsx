import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!supabase) {
      setError('Supabase no está configurado. Verifica las variables de entorno.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error('No se pudo obtener una sesión de usuario.');
      }
      const respuesta = await api.get('v1/empresa/list/');
      console.log('Respuesta de Django:', respuesta.data);

      navigate('/admin/dashboard');
      // Redirigir al Dashboard Administrativo
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error de autenticación:', err.response?.status);
      console.error('Respuesta de Django:', err.response?.data);
      setError(
        err.response?.data?.detail ||
        err.message ||
        'No se pudo iniciar sesión.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1E3A5F] to-slate-900 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">

        {/* HEADER */}
        <div className="px-8 pt-10 pb-6 text-center">
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">
            WorkSpace Pulse
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Plataforma de evaluación psicosocial y clima laboral
          </p>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-5">

          {/* Campo Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@empresa.com"
              autoComplete="email"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all duration-200 ease-in-out"
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all duration-200 ease-in-out"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1E3A5F] transition-colors p-1 rounded-full focus:outline-none"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Botón principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#1E3A5F] hover:bg-[#172A47] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A5F]"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* FOOTER LEGAL */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 WorkSpace Pulse · Cumplimiento NOM-035-STPS-2018
          </p>
        </div>

      </div>
    </div>
  );
}