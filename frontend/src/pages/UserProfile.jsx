// src/pages/UserProfile.jsx
import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Building2, Shield, Lock, Save, Camera,
  Calendar, Hash, Users, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Estado con los datos reales de Supabase Auth
  const [userData, setUserData] = useState({
    name: '',
    role: '',
    email: '',
    company: '',
    department: '',
    phone: '',
    employeeId: '',
    lastLogin: '',
  });

  // Campos editables
  const [nombreInput, setNombreInput] = useState('');
  const [telefonoInput, setTelefonoInput] = useState('');

  // Campos de cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const cargarPerfil = async () => {
      if (!supabase) {
        setFeedback({
          type: 'error',
          text: 'Supabase no está configurado en las variables de entorno.',
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;

        if (user) {
          const meta = user.user_metadata || {};
          const appMeta = user.app_metadata || {};

          const nombre =
            meta.full_name ||
            meta.nombre ||
            meta.name ||
            user.email?.split('@')[0] ||
            'Usuario';

          const telefono = meta.phone || meta.telefono || user.phone || '';
          const ultimoAcceso = user.last_sign_in_at
            ? new Date(user.last_sign_in_at).toLocaleString('es-MX', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Sin registro reciente';

          setUserData({
            name: nombre,
            role: meta.role || meta.puesto || appMeta.role || 'Administrador',
            email: user.email || '',
            company: meta.company || meta.empresa || 'WorkSpace Pulse',
            department: meta.department || meta.departamento || meta.area || 'General',
            phone: telefono,
            employeeId: meta.employee_id || `USR-${user.id.slice(0, 8).toUpperCase()}`,
            lastLogin: ultimoAcceso,
          });

          setNombreInput(nombre);
          setTelefonoInput(telefono);
        }
      } catch (err) {
        setFeedback({
          type: 'error',
          text: err.message || 'No se pudieron cargar los datos del perfil.',
        });
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, []);

  // Obtener iniciales dinámicas para el avatar
  const getIniciales = (nombreCompleto) => {
    if (!nombreCompleto) return 'WP';
    const partes = nombreCompleto.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  };

  // Guardar cambios de información personal en Supabase
  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    if (!supabase) return;

    setSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: nombreInput.trim(),
          phone: telefonoInput.trim(),
        },
      });

      if (error) throw error;

      setUserData((prev) => ({
        ...prev,
        name: nombreInput.trim(),
        phone: telefonoInput.trim(),
      }));

      setFeedback({
        type: 'success',
        text: 'Información personal actualizada correctamente.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Error al actualizar el perfil.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Actualizar contraseña en Supabase Auth
  const handleActualizarPassword = async (e) => {
    e.preventDefault();
    if (!supabase) return;

    setFeedback({ type: '', text: '' });

    if (passwordForm.newPassword.length < 6) {
      setFeedback({
        type: 'error',
        text: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({
        type: 'error',
        text: 'Las contraseñas nuevas no coinciden.',
      });
      return;
    }

    setUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setFeedback({
        type: 'success',
        text: 'Contraseña actualizada con éxito.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'No se pudo actualizar la contraseña.',
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="animate-spin" size={34} />
        <p className="text-sm font-medium text-slate-300">Cargando perfil de usuario...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-start pt-8 animate-in fade-in duration-300">

      {/* HEADER DE PERFIL CENTRADO */}
      <div className="flex flex-col items-center gap-4 mb-8 text-center">
        <div className="relative group cursor-pointer">
          <div className="w-28 h-28 bg-gradient-to-br from-[#1E3A5F] to-slate-700 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white/20 transition-transform group-hover:scale-105">
            {getIniciales(userData.name)}
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
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setFeedback({ type: '', text: '' });
              }}
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
          {/* ALERTA DE RETROALIMENTACIÓN */}
          {feedback.text && (
            <div
              className={`mb-5 p-3.5 rounded-xl text-sm flex items-center gap-2.5 border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle size={18} className="shrink-0 text-red-600" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* TAB: INFORMACIÓN PERSONAL */}
          {activeTab === 'personal' && (
            <form onSubmit={handleGuardarPerfil} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre Completo</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-[#1E3A5F] focus-within:ring-1 focus-within:ring-[#1E3A5F] transition-all">
                    <User size={18} className="text-slate-400" />
                    <input
                      type="text"
                      required
                      value={nombreInput}
                      onChange={(e) => setNombreInput(e.target.value)}
                      className="bg-transparent w-full outline-none text-slate-800 font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Correo Electrónico</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Mail size={18} className="text-slate-400" />
                    <input
                      type="email"
                      value={userData.email}
                      className="bg-transparent w-full outline-none text-slate-500 font-medium text-sm"
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Teléfono</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-[#1E3A5F] focus-within:ring-1 focus-within:ring-[#1E3A5F] transition-all">
                    <Phone size={18} className="text-slate-400" />
                    <input
                      type="tel"
                      value={telefonoInput}
                      onChange={(e) => setTelefonoInput(e.target.value)}
                      placeholder="Ej. (663) 303-4842"
                      className="bg-transparent w-full outline-none text-slate-800 font-medium text-sm"
                    />
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
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#1E3A5F] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#162c4a] transition-all shadow-md active:scale-95 text-sm disabled:opacity-60"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
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
                    <Users size={18} className="text-slate-400" />
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
            <form onSubmit={handleActualizarPassword} className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                <Shield className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-amber-800">
                  Se recomienda cambiar la contraseña cada 90 días para mantener la seguridad de tu cuenta.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nueva Contraseña</label>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-[#1E3A5F] transition-all">
                      <Lock size={18} className="text-slate-400" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="bg-transparent w-full outline-none text-slate-800 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Confirmar Contraseña</label>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-[#1E3A5F] transition-all">
                      <Lock size={18} className="text-slate-400" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Repite la contraseña"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="bg-transparent w-full outline-none text-slate-800 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-900 transition-all shadow-md active:scale-95 text-sm disabled:opacity-60"
                  >
                    {updatingPassword ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                    {updatingPassword ? 'Actualizando...' : 'Actualizar Credenciales'}
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}