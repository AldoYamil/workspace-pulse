import { Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react'; // Asegúrate de importar useState
import {
  ShieldAlert,
  ClipboardList,
  Bell,
  ChevronDown,
  Activity,
  ClipboardCheck,
  FileSearch,
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  UserCircle // Agregamos este ícono
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el dropdown

  const handleLogout = async () => {
    if (!supabase) {
      navigate('/login', { replace: true });
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error al cerrar sesión:', error.message);
      return;
    }

    navigate('/login', { replace: true });
  };

  // Menú con las rutas definidas en App.jsx.
  const menuItems = [
    { name: 'Dashboard Ejecutivo', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Gestión Organizacional', path: '/admin/organizacion', icon: Building2 },
    { name: 'Encuestas Aplicadas', path: '/admin/encuestas-aplicadas', icon: Users },
    { name: 'Riesgos Psicosociales', path: '/admin/riesgos', icon: ShieldAlert },
    { name: 'Cuestionario activo', path: '/admin/cuestionario', icon: ClipboardList },
    { name: 'Configuración de Alertas', path: '/admin/alertas', icon: Bell },
    { name: 'Planes de acción', path: '/admin/planes-accion', icon: ClipboardCheck },
    { name: 'Reportes de auditoría', path: '/admin/reportes-auditoria', icon: FileSearch },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1E3A5F] to-slate-900 flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50 shadow-xl">
        <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-[#1E3A5F] rounded-xl flex items-center justify-center text-white shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800 tracking-tight text-lg">
            WorkSpace Pulse
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1E3A5F] text-white shadow-md shadow-blue-900/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <div className="flex-1 flex flex-col pl-64 min-h-screen">

        {/* HEADER */}
        
        {/* HEADER MODIFICADO */}
        <header className="h-20 bg-white/95 backdrop-blur-md border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 capitalize">
            {location.pathname.split('/').pop().replaceAll('-', ' ') || 'Panel'}
          </h2>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-[#1E3A5F] transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* BOTÓN DE USUARIO CON DROPDOWN */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-full shadow-sm hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 bg-[#1E3A5F] rounded-full flex items-center justify-center text-white font-bold text-xs">
                  RH
                </div>
                <span className="text-sm font-semibold text-slate-700">Gerente RH</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* MENÚ DESPLEGABLE */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <Link 
                    to="/admin/perfil" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserCircle size={18} className="text-slate-400" />
                    Mi Perfil
                  </Link>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button 
                    onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={18} />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENIDO DINÁMICO */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>

        {/* FOOTER */}
        <footer className="py-6 text-center border-t border-white/10 text-xs text-slate-400/70 font-medium bg-transparent">
          © 2026 WorkSpace Pulse · Cumplimiento NOM-035-STPS-2018
        </footer>
      </div>
    </div>
  );
}
