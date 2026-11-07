import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, BarChart3, Users, ArrowRight, CheckCircle2, Activity,
  X, Building2, Target, Eye, HeartHandshake, ClipboardList 
} from 'lucide-react';
import { Link } from 'react-router-dom';

// IMPORTANTE: Asegúrate de guardar tu captura de pantalla en src/assets/ con este nombre
// o cambia la ruta en la variable 'dashboardImage'
import dashboardScreenshot from '../assets/DashboardPhoto.png'; 
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
          <div className="text-2xl font-bold tracking-tighter text-[#1E3A5F] flex items-center gap-2">
            <Activity className="text-blue-600" size={28} strokeWidth={2.5} />
            WorkSpace<span className="text-slate-700">Pulse</span>
          </div>
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRegisterModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowRegisterModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Registro Empresarial</h3>
              <p className="text-gray-500 mb-6 text-sm">Comienza a medir el pulso de tu organización cumpliendo con la NOM-035.</p>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Empresa</label>
                  <input type="text" placeholder="Ej. Corporativo Selegna S.A. de C.V." className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A5F] outline-none text-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RFC</label>
                  <input type="text" placeholder="Ej. CSF261022ABC" maxLength={13} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A5F] outline-none text-slate-900 uppercase" />
                </div>
                <button type="submit" className="w-full bg-[#1E3A5F] hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-colors mt-2">Crear Cuenta Empresarial</button>
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

          {/* IMAGEN REAL DEL SISTEMA */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-[#1E3A5F] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Aquí se carga tu imagen real. Si no existe, muestra un placeholder */}
              <img 
                src={dashboardScreenshot} 
                alt="Dashboard WorkSpace Pulse" 
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback si la imagen no carga */}
              <div className="hidden w-full h-64 items-center justify-center bg-slate-800 text-gray-400">
                Vista previa del Dashboard
              </div>
            </div>
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

      {/* How it Works (Sección Extra Agregada) */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">¿Cómo funciona WorkSpace-Pulse?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Configura tu Empresa", desc: "Registra tus centros de trabajo y define los grupos de empleados a evaluar." },
              { step: "02", title: "Aplica Encuestas", desc: "Distribuye cuestionarios validados por la STPS de forma segura y anónima." },
              { step: "03", title: "Obtén Resultados", desc: "Visualiza reportes automáticos y genera la documentación legal requerida." }
            ].map((item, i) => (
              <div key={i} className="relative p-6 bg-[#1E3A5F]/30 rounded-xl border border-blue-500/20 hover:border-blue-400/50 transition-colors">
                <div className="text-4xl font-black text-blue-500/20 absolute top-4 right-4">{item.step}</div>
                <h3 className="text-xl font-bold mb-2 text-blue-300">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why NOM-035 Section */}
      <section className="py-20 px-6 bg-black/20">
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

           {/* Misión, Visión y Objetivos (Centrado) */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestra Razón de Ser</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Comprometidos con la transformación cultural de las organizaciones mexicanas.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Misión */}
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

            {/* Visión */}
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

            {/* Objetivos */}
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
                  <span className="text-indigo-400 mt-1"></span> Simplificar el cumplimiento normativo de la NOM-035.
                </li>
                <li className="flex items-start justify-center gap-2">
                  <span className="text-indigo-400 mt-1"></span> Fomentar la prevención proactiva del estrés laboral.
                </li>
                <li className="flex items-start justify-center gap-2">
                  <span className="text-indigo-400 mt-1"></span> Generar data valiosa para la toma de decisiones de RRHH.
                </li>
              </ul>
            </motion.div>
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