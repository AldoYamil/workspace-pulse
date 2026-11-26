import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, BarChart3, Users, ArrowRight, CheckCircle2, Activity,
  X, Target, Eye, HeartHandshake, Sparkles, HelpCircle, ChevronDown,
  Lock, FileCheck2, Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';

import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import dashboardScreenshot from '../assets/DashboardPhoto.png'; 

const PLANES_SUSCRIPCION = [
  {
    id: 'starter',
    nombre: 'Esencial',
    subtitulo: 'Ideal para centros de trabajo de 1 a 15 colaboradores',
    precioMensual: 799,
    precioAnual: 639,
    destacado: false,
    badge: null,
    descripcion: 'Cumple con la identificación de acontecimientos traumáticos severos (Guía I) y políticas de prevención.',
    caracteristicas: [
      'Hasta 15 colaboradores activos',
      '1 Centro de trabajo / Sede',
      'Guía de Referencia I (ATS)',
      'Política de prevención de riesgos',
      'Reportes individuales en PDF',
      'Soporte por correo electrónico',
    ],
  },
  {
    id: 'pro',
    nombre: 'Profesional',
    subtitulo: 'Para empresas de 16 a 50 colaboradores',
    precioMensual: 1899,
    precioAnual: 1519,
    destacado: true,
    badge: 'Más Popular',
    descripcion: 'Evaluación completa de factores de riesgo psicosocial (Guías I y II) con analítica por área y planes de acción.',
    caracteristicas: [
      'Hasta 50 colaboradores activos',
      'Hasta 3 Centros de trabajo / Sedes',
      'Guías de Referencia I y II completas',
      'Dashboard ejecutivo en tiempo real',
      'Segmentación por áreas y puestos',
      'Expediente digital para auditoría STPS',
      'Soporte prioritario',
    ],
  },
  {
    id: 'enterprise',
    nombre: 'Corporativo',
    subtitulo: 'Empresas con más de 50 colaboradores o múltiples sedes',
    precioMensual: 3999,
    precioAnual: 3199,
    destacado: false,
    badge: null,
    descripcion: 'Cobertura total de la NOM-035 (Guías I, II y III), evaluación de entorno organizacional y gestión multi-sede.',
    caracteristicas: [
      'Colaboradores y sedes ilimitadas',
      'Guías I, II y III (Entorno Organizacional)',
      'Control de roles (Admin, Gerente y Asistente RH)',
      'Planes de intervención y seguimiento',
      'Exportación masiva de evidencia STPS',
      'Ejecutivo de cuenta y onboarding dedicado',
    ],
  },
];

const PREGUNTAS_FRECUENTES = [
  {
    pregunta: '¿Qué guía de la NOM-035 debo aplicar según el tamaño de mi empresa?',
    respuesta:
      'La NOM-035-STPS-2018 establece obligaciones diferenciadas: centros de 1 a 15 trabajadores aplican la Guía I; de 16 a 50 aplican Guías I y II; y más de 50 trabajadores aplican Guías I y III (evaluación del entorno organizacional). Nuestro sistema configura automáticamente las encuestas según tu plan y plantilla.',
  },
  {
    pregunta: '¿Cómo se garantiza el anonimato y dominio institucional?',
    respuesta:
      'Cada empresa registra su propio dominio corporativo (@tuempresa.com) para validar que solo tu personal autorizado responda. Los resultados agregados en el dashboard protegen la confidencialidad individual conforme a los lineamientos de la STPS.',
  },
  {
    pregunta: '¿Puedo cambiar de plan si mi empresa contrata más personal?',
    respuesta:
      'Sí. Puedes escalar de plan en cualquier momento desde tu panel administrativo conservando todo tu historial de encuestas, sedes, áreas y reportes de auditoría previos.',
  },
  {
    pregunta: '¿Entregan factura fiscal (CFDI) en México?',
    respuesta:
      'Sí, todas nuestras suscripciones mensuales y anuales incluyen facturación electrónica (CFDI 4.0) emitida automáticamente al RFC registrado de tu empresa.',
  },
];

const LandingPage = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState('anual'); // 'mensual' | 'anual'
  const [selectedPlan, setSelectedPlan] = useState(PLANES_SUSCRIPCION[1]);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const [regForm, setRegForm] = useState({
    nombre_empresa: '',
    rfc: '',
    dominio_correo: '',
    nombre_admin: '',
    email_admin: '',
    password_admin: '',
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const handleOpenRegisterWithPlan = (plan = PLANES_SUSCRIPCION[1]) => {
    setSelectedPlan(plan);
    setRegError('');
    setRegSuccess('');
    setShowRegisterModal(true);
  };

  const handleRegisterEmpresa = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const dominioLimpio = regForm.dominio_correo.trim().toLowerCase().replace(/^@/, '');
    const emailLimpio = regForm.email_admin.trim().toLowerCase();

    if (!emailLimpio.endsWith(`@${dominioLimpio}`)) {
      setRegError(`El correo del administrador debe terminar en @${dominioLimpio}`);
      return;
    }

    setRegLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailLimpio,
        password: regForm.password_admin,
        options: {
          data: {
            nombre: regForm.nombre_admin.trim(),
            rol: 'administrador',
            plan: selectedPlan?.id || 'pro',
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      await axios.post('http://127.0.0.1:8000/api/v1/empresa/create/', {
        nombre: regForm.nombre_empresa.trim(),
        rfc: regForm.rfc.trim().toUpperCase(),
        dominio_correo: dominioLimpio,
        nombre_admin: regForm.nombre_admin.trim(),
        email_admin: emailLimpio,
        supabase_uid: authData?.user?.id || '',
        plan_suscripcion: selectedPlan?.id || 'pro',
        ciclo_facturacion: billingCycle,
      });

      setRegSuccess(
        `¡Empresa y cuenta de administrador creadas con el plan ${selectedPlan.nombre}! Ya puedes iniciar sesión.`
      );
      setRegForm({
        nombre_empresa: '',
        rfc: '',
        dominio_correo: '',
        nombre_admin: '',
        email_admin: '',
        password_admin: '',
      });
    } catch (err) {
      const data = err.response?.data;
      let mensajeError = err.message || 'Ocurrió un error al crear la cuenta empresarial.';

      if (data) {
        if (data.detail) {
          mensajeError = data.detail;
        } else if (typeof data === 'object') {
          const primerCampo = Object.keys(data)[0];
          const primerMensaje = Array.isArray(data[primerCampo])
            ? data[primerCampo][0]
            : data[primerCampo];
          mensajeError = `${primerCampo.toUpperCase()}: ${primerMensaje}`;
        }
      }

      setRegError(mensajeError);
    } finally {
      setRegLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1E3A5F] to-slate-900 text-white font-sans overflow-x-hidden scroll-smooth">
      
      {/* Navbar Blanco */}
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#" className="text-2xl font-bold tracking-tighter text-[#1E3A5F] flex items-center gap-2">
            <Activity className="text-blue-600" size={28} strokeWidth={2.5} />
            WorkSpace<span className="text-slate-700">Pulse</span>
          </a>

          {/* Enlaces de navegación */}
          <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#beneficios" className="hover:text-[#1E3A5F] transition-colors">Beneficios</a>
            <a href="#como-funciona" className="hover:text-[#1E3A5F] transition-colors">Cómo Funciona</a>
            <a href="#planes" className="hover:text-[#1E3A5F] transition-colors">Planes y Precios</a>
            <a href="#nom035" className="hover:text-[#1E3A5F] transition-colors">NOM-035</a>
            <a href="#faq" className="hover:text-[#1E3A5F] transition-colors">Preguntas Frecuentes</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleOpenRegisterWithPlan(PLANES_SUSCRIPCION[1])}
              className="hidden md:block px-5 py-2 rounded-lg font-medium text-[#1E3A5F] hover:bg-blue-50 transition-colors border border-blue-200 text-sm"
            >
              Registrarse como empresa
            </button>
            <Link to="/login">
              <button className="bg-[#1E3A5F] hover:bg-blue-900 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md shadow-blue-900/20 text-sm">
                Iniciar Sesión
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Modal de Registro con Plan Seleccionado */}
      <AnimatePresence>
        {showRegisterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowRegisterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-bold text-slate-900 mb-1">Registro Empresarial</h3>
              <p className="text-gray-500 mb-4 text-sm">
                Configura tu empresa, su dominio institucional y tu cuenta de Administrador.
              </p>

              {/* Resumen del plan seleccionado dentro del modal */}
              {selectedPlan && (
                <div className="mb-5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
                      Plan Seleccionado ({billingCycle === 'anual' ? 'Facturación Anual' : 'Facturación Mensual'})
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedPlan.nombre} — $
                      {(billingCycle === 'anual'
                        ? selectedPlan.precioAnual
                        : selectedPlan.precioMensual
                      ).toLocaleString('es-MX')}{' '}
                      MXN/mes
                    </span>
                  </div>
                  <a
                    href="#planes"
                    onClick={() => setShowRegisterModal(false)}
                    className="text-xs font-semibold text-[#1E3A5F] underline hover:text-blue-700 shrink-0"
                  >
                    Cambiar
                  </a>
                </div>
              )}

              <form onSubmit={handleRegisterEmpresa} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre de la Empresa
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.nombre_empresa}
                      onChange={(e) =>
                        setRegForm({ ...regForm, nombre_empresa: e.target.value })
                      }
                      placeholder="Ej. Corporativo Selegna"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      RFC
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={13}
                      value={regForm.rfc}
                      onChange={(e) =>
                        setRegForm({ ...regForm, rfc: e.target.value.toUpperCase() })
                      }
                      placeholder="Ej. CSF261022ABC"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-900 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dominio de Correo Empresarial
                  </label>
                  <div className="flex items-center rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-[#1E3A5F] overflow-hidden">
                    <span className="px-3 py-2.5 bg-slate-100 text-slate-500 text-sm font-semibold border-r border-gray-300">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      value={regForm.dominio_correo}
                      onChange={(e) =>
                        setRegForm({ ...regForm, dominio_correo: e.target.value })
                      }
                      placeholder="tuempresa.com"
                      className="w-full px-3.5 py-2.5 outline-none text-sm text-slate-900"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Solo los colaboradores con este dominio podrán acceder a las encuestas NOM-035.
                  </p>
                </div>

                <hr className="border-slate-200 my-2" />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Administrador
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.nombre_admin}
                    onChange={(e) =>
                      setRegForm({ ...regForm, nombre_admin: e.target.value })
                    }
                    placeholder="Ej. Ana García"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Correo del Administrador
                    </label>
                    <input
                      type="email"
                      required
                      value={regForm.email_admin}
                      onChange={(e) =>
                        setRegForm({ ...regForm, email_admin: e.target.value })
                      }
                      placeholder={
                        regForm.dominio_correo
                          ? `admin@${regForm.dominio_correo.replace(/^@/, '')}`
                          : 'admin@tuempresa.com'
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regForm.password_admin}
                      onChange={(e) =>
                        setRegForm({ ...regForm, password_admin: e.target.value })
                      }
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A5F] outline-none text-sm text-slate-900"
                    />
                  </div>
                </div>

                {regError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                    {regSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full bg-[#1E3A5F] hover:bg-blue-900 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors mt-2"
                >
                  {regLoading ? 'Creando cuenta empresarial...' : 'Comenzar Prueba de 14 Días'}
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Sin cargos inmediatos. Incluye 14 días de prueba gratuita en cualquier plan.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold mb-6">
              <Sparkles size={15} /> Cumplimiento NOM-035-STPS-2018
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Mide el pulso de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">entorno laboral</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              Plataforma integral para evaluar riesgos psicosociales, mejorar el clima organizacional y generar evidencia probatoria ante auditorías de la STPS.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleOpenRegisterWithPlan(PLANES_SUSCRIPCION[1])}
                className="bg-white text-[#1E3A5F] px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg"
              >
                Comenzar Prueba Gratis <ArrowRight size={20} />
              </button>
              <a
                href="#planes"
                className="px-7 py-3.5 rounded-xl font-semibold border border-white/25 text-white hover:bg-white/10 transition-colors"
              >
                Ver Planes y Precios
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" /> 14 días gratis sin tarjeta
              </span>
              <span className="flex items-center gap-1.5">
                <Lock size={15} className="text-cyan-400" /> Aislamiento de datos por empresa
              </span>
              <span className="flex items-center gap-1.5">
                <FileCheck2 size={15} className="text-blue-400" /> Facturación CFDI 4.0
              </span>
            </div>
          </motion.div>

          {/* IMAGEN REAL DEL SISTEMA */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-[#1E3A5F] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <img 
                src={dashboardScreenshot} 
                alt="Dashboard WorkSpace Pulse" 
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-64 items-center justify-center bg-slate-800 text-gray-400">
                Vista previa del Dashboard
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Banda de Métricas / Indicadores Clave */}
      <section className="py-10 px-6 border-y border-white/10 bg-slate-950/40">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { valor: '100%', etiqueta: 'Alineado a Guías I, II y III STPS' },
            { valor: '< 10 min', etiqueta: 'Configuración de sedes y áreas' },
            { valor: '24/7', etiqueta: 'Disponibilidad y analítica en vivo' },
            { valor: 'CFDI 4.0', etiqueta: 'Facturación empresarial deducible' },
          ].map((stat, idx) => (
            <div key={idx}>
              <p className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">
                {stat.valor}
              </p>
              <p className="text-xs md:text-sm text-slate-400 mt-1">{stat.etiqueta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="beneficios" className="py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Todo lo que necesita Recursos Humanos</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Gestiona múltiples centros de trabajo, áreas y colaboradores desde una sola plataforma segura.
            </p>
          </div>
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeInUp}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: <ShieldCheck size={32} className="text-blue-400" />, title: "Cumplimiento Legal", desc: "Automatiza la aplicación de las Guías de Referencia I, II y III de la NOM-035." },
              { icon: <BarChart3 size={32} className="text-cyan-400" />, title: "Análisis en Tiempo Real", desc: "Dashboards interactivos con métricas de CSAT, eNPS y niveles de riesgo psicosocial." },
              { icon: <Users size={32} className="text-indigo-400" />, title: "Anonimato Garantizado", desc: "Encuestas seguras y trazables con validación de dominio institucional." }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-default group">
                <div className="mb-4 p-3 bg-white/5 rounded-lg w-fit group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">¿Cómo funciona WorkSpace-Pulse?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Configura tu Empresa", desc: "Registra tus centros de trabajo, áreas y define los grupos de empleados a evaluar." },
              { step: "02", title: "Aplica Encuestas", desc: "Distribuye cuestionarios validados por la STPS de forma segura y anónima." },
              { step: "03", title: "Obtén Resultados", desc: "Visualiza reportes automáticos y genera la documentación legal requerida." }
            ].map((item, i) => (
              <div key={i} className="relative p-6 bg-[#1E3A5F]/30 rounded-xl border border-blue-500/20 hover:border-blue-400/50 transition-colors text-left">
                <div className="text-4xl font-black text-blue-500/20 absolute top-4 right-4">{item.step}</div>
                <h3 className="text-xl font-bold mb-2 text-blue-300">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN NUEVA: PLANES DE SUSCRIPCIÓN Y PRECIOS */}
      <section id="planes" className="py-24 px-6 bg-black/25 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
              Planes Flexibles por Tamaño de Plantilla
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
              Elige el plan ideal para tu organización
            </h2>
            <p className="text-gray-300 text-base mb-8">
              Todos los planes están diseñados conforme a los rangos de trabajadores de la NOM-035 e incluyen 14 días de prueba gratuita.
            </p>

            {/* Toggle Mensual / Anual */}
            <div className="inline-flex items-center p-1.5 rounded-xl bg-slate-900/90 border border-white/15">
              <button
                type="button"
                onClick={() => setBillingCycle('mensual')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  billingCycle === 'mensual'
                    ? 'bg-white text-[#1E3A5F] shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Pago Mensual
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('anual')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  billingCycle === 'anual'
                    ? 'bg-white text-[#1E3A5F] shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Pago Anual
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Ahorra 20%
                </span>
              </button>
            </div>
          </div>

          {/* Tarjetas de Planes */}
          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            {PLANES_SUSCRIPCION.map((plan) => {
              const precioActual =
                billingCycle === 'anual' ? plan.precioAnual : plan.precioMensual;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`relative rounded-2xl p-8 flex flex-col justify-between transition-all ${
                    plan.destacado
                      ? 'bg-gradient-to-b from-[#1E3A5F] to-slate-900 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/15 lg:-translate-y-2'
                      : 'bg-white/5 border border-white/10 hover:border-white/25'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-white">{plan.nombre}</h3>
                      <Building2
                        size={22}
                        className={plan.destacado ? 'text-cyan-300' : 'text-blue-400'}
                      />
                    </div>
                    <p className="text-xs text-blue-200 font-medium mb-5">{plan.subtitulo}</p>

                    <div className="mb-4 pb-5 border-b border-white/10">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-white">
                          ${precioActual.toLocaleString('es-MX')}
                        </span>
                        <span className="text-sm text-slate-300 font-medium">MXN / mes</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {billingCycle === 'anual'
                          ? `Facturado anualmente ($${(precioActual * 12).toLocaleString('es-MX')} MXN/año) + IVA`
                          : 'Facturación mensual recurrente + IVA'}
                      </p>
                    </div>

                    <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                      {plan.descripcion}
                    </p>

                    <ul className="space-y-3 mb-8">
                      {plan.caracteristicas.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                          <CheckCircle2
                            size={17}
                            className={`shrink-0 mt-0.5 ${
                              plan.destacado ? 'text-cyan-400' : 'text-emerald-400'
                            }`}
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenRegisterWithPlan(plan)}
                    className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      plan.destacado
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-slate-950 shadow-lg'
                        : 'bg-white text-[#1E3A5F] hover:bg-slate-100'
                    }`}
                  >
                    Seleccionar Plan {plan.nombre} <ArrowRight size={16} />
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Nota de cotización a medida */}
          <div className="mt-10 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <h4 className="font-bold text-white text-base">
                ¿Tienes más de 500 colaboradores o grupos empresariales con múltiples razones sociales?
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Contamos con licenciamiento corporativo multi-RFC, integración SSO y acompañamiento presencial con especialistas en salud ocupacional.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenRegisterWithPlan(PLANES_SUSCRIPCION[2])}
              className="px-6 py-2.5 rounded-xl border border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 text-sm font-semibold shrink-0 transition-colors"
            >
              Solicitar Cotización Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* Why NOM-035 Section */}
      <section id="nom035" className="py-20 px-6 bg-black/20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-6">
            ¿Por qué es vital la NOM-035?
          </motion.h2>
          <p className="text-gray-300 mb-12 max-w-2xl mx-auto">
            No se trata solo de evitar multas. Se trata de construir un entorno donde el talento florezca, la productividad aumente y el bienestar sea la prioridad.
          </p>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            {[
              "Identificación de factores de riesgo psicosocial.",
              "Prevención de violencia laboral y estrés.",
              "Protocolos para acontecimientos traumáticos severos.",
              "Evidencia documental para auditorías de la STPS.",
            ].map((item, i) => (
              <motion.div key={i} initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4 p-4 bg-[#1E3A5F]/40 rounded-xl border border-blue-500/20">
                <CheckCircle2 className="text-green-400 shrink-0" />
                <span className="font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Misión, Visión y Objetivos (Centrado) */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestra Razón de Ser</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Comprometidos con la transformación cultural de las organizaciones mexicanas.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="p-8 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-blue-400/50 transition-all flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
                <Target className="text-blue-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Misión</h3>
              <p className="text-gray-300 leading-relaxed">
                Proveer herramientas tecnológicas accesibles que permitan a las empresas identificar, prevenir y atender los factores de riesgo psicosocial, garantizando entornos laborales seguros y legales.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-cyan-400/50 transition-all flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-cyan-600/20 rounded-full flex items-center justify-center mb-6">
                <Eye className="text-cyan-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Visión</h3>
              <p className="text-gray-300 leading-relaxed">
                Ser la plataforma líder en México para la gestión del bienestar organizacional, reconocida por transformar la cultura laboral y elevar los estándares de salud mental en el trabajo.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="p-8 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-indigo-400/50 transition-all flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mb-6">
                <HeartHandshake className="text-indigo-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Objetivos</h3>
              <ul className="text-gray-300 space-y-3 list-none p-0 m-0">
                <li className="flex items-start justify-center gap-2">
                  <span className="text-indigo-400 mt-1">•</span> Simplificar el cumplimiento normativo de la NOM-035.
                </li>
                <li className="flex items-start justify-center gap-2">
                  <span className="text-indigo-400 mt-1">•</span> Fomentar la prevención proactiva del estrés laboral.
                </li>
                <li className="flex items-start justify-center gap-2">
                  <span className="text-indigo-400 mt-1">•</span> Generar data valiosa para la toma de decisiones de RRHH.
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECCIÓN NUEVA: PREGUNTAS FRECUENTES (FAQ) */}
      <section id="faq" className="py-20 px-6 bg-black/25 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-blue-300 text-sm font-semibold mb-2">
              <HelpCircle size={18} /> Resolvemos tus dudas
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-4">
            {PREGUNTAS_FRECUENTES.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl bg-white/5 border border-white/10 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                  >
                    <span className="font-semibold text-white text-sm md:text-base">
                      {faq.pregunta}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`text-blue-300 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                      {faq.respuesta}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-blue-600/30 via-[#1E3A5F] to-cyan-600/30 border border-blue-400/30 p-10 md:p-14 text-center shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Prepara a tu empresa hoy mismo para la NOM-035
          </h2>
          <p className="text-slate-200 max-w-2xl mx-auto mb-8">
            Crea tu cuenta empresarial en minutos, registra tus centros de trabajo y comienza tu periodo de prueba sin compromiso.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => handleOpenRegisterWithPlan(PLANES_SUSCRIPCION[1])}
              className="bg-white text-[#1E3A5F] hover:bg-slate-100 font-bold px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2 shadow-lg"
            >
              Crear Cuenta Empresarial <ArrowRight size={18} />
            </button>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-xl font-semibold border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Blanco */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-white text-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold text-[#1E3A5F] flex items-center gap-2">
            <Activity className="text-blue-600" size={24} />
            WorkSpace<span className="text-slate-700">Pulse</span>
          </div>
          <div className="text-gray-500 text-sm">
            © 2026 WorkSpace Pulse. Todos los derechos reservados.
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#planes" className="hover:text-[#1E3A5F] transition-colors">Planes</a>
            <a href="#" className="hover:text-[#1E3A5F] transition-colors">Privacidad</a>
            <a href="#" className="hover:text-[#1E3A5F] transition-colors">Términos</a>
            <a href="#" className="hover:text-[#1E3A5F] transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;