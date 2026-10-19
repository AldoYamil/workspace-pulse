import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  ClipboardList,
  Bell,
  ChevronDown,
  Activity,
  ClipboardCheck,
  FileSearch,
} from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();

  // Menú con las tres páginas actuales
  const menuItems = [
    { name: 'Riesgos Psicosociales', path: '/riesgos', icon: ShieldAlert },
    { name: 'Cuestionario activo', path: '/cuestionario', icon: ClipboardList },
    { name: 'Configuración de Alertas', path: '/alertas', icon: Bell },
    { name: 'Planes de acción', path: '/planes-accion', icon: ClipboardCheck },
    { name: 'Reportes de auditoría', path: '/reportes-auditoria', icon: FileSearch,
},
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
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
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex flex-col pl-64">
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div></div>
          
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-full shadow-sm cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-slate-700 font-bold text-sm">
              U
            </div>
            <span className="text-sm font-semibold text-slate-700">Usuario</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </header>

        {/* CONTENIDO DINÁMICO */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>

        {/* FOOTER */}
        <footer className="py-6 text-center border-t border-slate-200 text-xs text-slate-400 font-medium">
          © 2026 WorkSpace Pulse · Cumplimiento NOM-035-STPS-2018
        </footer>

      </div>
    </div>
  );
}