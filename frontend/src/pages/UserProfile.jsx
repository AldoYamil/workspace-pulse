// src/pages/UserProfile.jsx
import { useState } from 'react';
import { 
  User, Mail, Phone, Building2, Shield, Lock, Save, Camera, 
  Calendar, Hash, Users 
} from 'lucide-react';

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('personal');

  // Datos simulados del usuario logueado
  const userData = {
    name: 'Selegna Bravo',
    role: 'Desarrolladora Frontend',
    email: 'selegnaflores941@gmail.com',
    company: 'WorkSpace Pulse Demo Corp.',
    department: 'Tecnología e Innovación',
    phone: '(663) 303-4842',
    employeeId: 'EMP-2026-001',
    lastLogin: '06 Nov 2026, 09:15 AM'
  };

  return (
    // CONTENEDOR PRINCIPAL CENTRADO
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-start pt-8 animate-in fade-in duration-300">
      
      {/* HEADER DE PERFIL CENTRADO */}
      <div className="flex flex-col items-center gap-4 mb-8 text-center">
        <div className="relative group cursor-pointer">
          <div className="w-28 h-28 bg-gradient-to-br from-[#1E3A5F] to-slate-700 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white/20 transition-transform group-hover:scale-105">
            SB
          </div>
          <div className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-lg text-[#1E3A5F] opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={18} />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{userData.name}</h1>
          <p className="text-slate-300 text-lg font-medium">{userData.role}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Shield size={12} /> Cuenta Activa
            </span>
            <span className="text-xs text-slate-400">ID: {userData.employeeId}</span>
          </div>
        </div>
      </div>

      {/* TARJETA BLANCA COMPACTA Y CENTRADA */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl border border-slate-100">
        
        {/* Pestañas de Navegación Interna */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          {['personal', 'company', 'security'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-bold transition-all relative ${
                activeTab === tab ? 'text-[#1E3A5F] bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
            >
              {tab === 'personal' && 'Información Personal'}
              {tab === 'company' && 'Datos Empresariales'}
              {tab === 'security' && 'Seguridad'}
              
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1E3A5F]"></div>
              )}
            </button>
          ))}
        </div>

        {/* Contenido de las Pestañas */}
        <div className="p-8">
          
          {/* TAB: INFORMACIÓN PERSONAL */}
          {activeTab === 'personal' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre Completo</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-[#1E3A5F] focus-within:ring-1 focus-within:ring-[#1E3A5F] transition-all">
                    <User size={18} className="text-slate-400" />
                    <input type="text" defaultValue={userData.name} className="bg-transparent w-full outline-none text-slate-800 font-medium text-sm" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Correo Electrónico</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Mail size={18} className="text-slate-400" />
                    <input type="email" defaultValue={userData.email} className="bg-transparent w-full outline-none text-slate-800 font-medium text-sm" readOnly />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Teléfono</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-[#1E3A5F] focus-within:ring-1 focus-within:ring-[#1E3A5F] transition-all">
                    <Phone size={18} className="text-slate-400" />
                    <input type="tel" defaultValue={userData.phone} className="bg-transparent w-full outline-none text-slate-800 font-medium text-sm" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Último Acceso</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Calendar size={18} className="text-slate-400" />
                    <span className="text-slate-600 text-sm font-medium">{userData.lastLogin}</span>
                  </div>
                </div>
              </div>

                <div className="pt-4 flex justify-center">
                <button className="flex items-center gap-2 bg-[#1E3A5F] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#162c4a] transition-all shadow-md active:scale-95 text-sm">
                    <Save size={16} />
                    Guardar Cambios
                </button>
                </div>
            </div>
          )}

          {/* TAB: DATOS EMPRESARIALES */}
          {activeTab === 'company' && (
            <div className="space-y-5">
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
                <Building2 className="text-[#1E3A5F] shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-[#1E3A5F] text-sm">Información Corporativa</h4>
                  <p className="text-xs text-slate-600 mt-1">Estos datos son gestionados por el administrador global del sistema.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Empresa / Razón Social</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Building2 size={18} className="text-slate-400" />
                    <span className="text-slate-800 font-medium text-sm">{userData.company}</span>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Departamento</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Users size={18} className="text-slate-400" /> {/* AHORA SÍ FUNCIONARÁ */}
                    <span className="text-slate-800 font-medium text-sm">{userData.department}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">ID de Empleado</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Hash size={18} className="text-slate-400" />
                    <span className="text-slate-800 font-medium text-sm">{userData.employeeId}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SEGURIDAD */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                <Shield className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-amber-800">
                  Se recomienda cambiar la contraseña cada 90 días para mantener la seguridad de tu cuenta.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Contraseña Actual</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-[#1E3A5F] transition-all">
                    <Lock size={18} className="text-slate-400" />
                    <input type="password" placeholder="••••••••" className="bg-transparent w-full outline-none text-slate-800 text-sm" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nueva Contraseña</label>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-[#1E3A5F] transition-all">
                      <Lock size={18} className="text-slate-400" />
                      <input type="password" className="bg-transparent w-full outline-none text-slate-800 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Confirmar Contraseña</label>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-[#1E3A5F] transition-all">
                      <Lock size={18} className="text-slate-400" />
                      <input type="password" className="bg-transparent w-full outline-none text-slate-800 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-center"> 
                <button className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-900 transition-all shadow-md active:scale-95 text-sm">
                    <Shield size={16} />
                    Actualizar Credenciales
                </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}