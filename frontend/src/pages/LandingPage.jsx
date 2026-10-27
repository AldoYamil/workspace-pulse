import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, BarChart3, Users, ArrowRight, CheckCircle2, Activity,
  X, Building2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1E3A5F] to-slate-900 text-white font-sans overflow-x-hidden">
      
      {/* Navbar Blanco */}
      <nav className="fixed w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo con Icono de Pulso */}
          <div className="text-2xl font-bold tracking-tighter text-[#1E3A5F] flex items-center gap-2">
            <Activity className="text-blue-600" size={28} strokeWidth={2.5} />
            WorkSpace<span className="text-slate-700">Pulse</span>
          </div>

          {/* Botones de Acción (Sin menú de usuario) */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="hidden md:block px-5 py-2 rounded-lg font-medium text-[#1E3A5F] hover:bg-blue-50 transition-colors border border-blue-200"
            >
              Registrarse como empresa
            </button>
            <Link to="/login">
              <button className="bg-[#1E3A5F] hover:bg-blue-900 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md shadow-blue-900/20">
                Iniciar Sesión
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Modal de Registro */}
      <AnimatePresence>
        {showRegisterModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRegisterModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Registro Empresarial</h3>
              <p className="text-gray-500 mb-6 text-sm">Comienza a medir el pulso de tu organización cumpliendo con la NOM-035.</p>
              
              {/*crear cuenta para una empresa*/}
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Empresa</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Corporativo Selegna S.A. de C.V."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] outline-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RFC</label>
                  <input 
                    type="text" 
                    placeholder="Ej. CSF261022ABC"
                    maxLength={13}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] outline-none text-slate-900 uppercase"
                  />
                </div>
                <button type="submit" className="w-full bg-[#1E3A5F] hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-colors mt-2">
                  Crear Cuenta Empresarial
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-block px-4 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold mb-6">
              Cumplimiento NOM-035-STPS-2018
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Mide el pulso de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">entorno laboral</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              Plataforma integral para evaluar riesgos psicosociales, mejorar el clima organizacional y generar evidencia probatoria ante auditorías de la STPS.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowRegisterModal(true)} className="bg-white text-[#1E3A5F] px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2">
                Solicitar Demo <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="h-4 w-32 bg-white/20 rounded"></div>
                <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Activity size={16} className="text-green-400" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-white/5"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-20 bg-white/5 rounded-lg"></div>
                  <div className="h-20 bg-white/5 rounded-lg"></div>
                  <div className="h-20 bg-white/5 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeInUp}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: <ShieldCheck size={32} className="text-blue-400" />, title: "Cumplimiento Legal", desc: "Automatiza la aplicación de las Guías de Referencia I, II y III de la NOM-035." },
              { icon: <BarChart3 size={32} className="text-cyan-400" />, title: "Análisis en Tiempo Real", desc: "Dashboards interactivos con métricas de CSAT, eNPS y niveles de riesgo psicosocial." },
              { icon: <Users size={32} className="text-indigo-400" />, title: "Anonimato Garantizado", desc: "Encuestas seguras y trazables que protegen la identidad de tus colaboradores." }
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

      {/* Why NOM-035 Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-6">
            ¿Por qué es vital la NOM-035?
          </motion.h2>
          <p className="text-gray-300 mb-12 max-w-2xl mx-auto">
            No se trata solo de evitar multas. Se trata de construir un entorno donde el talento florezca, la productividad aumente y el bienestar sea la prioridad.
          </p>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            {["Identificación de factores de riesgo psicosocial.", "Prevención de violencia laboral y estrés.", "Protocolos para acontecimientos traumáticos severos.", "Evidencia documental para auditorías de la STPS."].map((item, i) => (
              <motion.div key={i} initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4 p-4 bg-[#1E3A5F]/40 rounded-xl border border-blue-500/20">
                <CheckCircle2 className="text-green-400 shrink-0" />
                <span className="font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Blanco */}
      <footer className="border-t border-gray-200 py-12 px-6 mt-12 bg-white text-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold text-[#1E3A5F] flex items-center gap-2">
            <Activity className="text-blue-600" size={24} />
            WorkSpace<span className="text-slate-700">Pulse</span>
          </div>
          <div className="text-gray-500 text-sm">
            © 2026 WorkSpace Pulse. Todos los derechos reservados.
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
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