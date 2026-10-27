// src/pages/ConfiguracionAlertas.jsx
import { useState } from 'react';

export default function ConfiguracionAlertas() {
  // Estados del formulario
  const [satisfaccion, setSatisfaccion] = useState('60');
  const [riesgo, setRiesgo] = useState('70');
  const [notificaciones, setNotificaciones] = useState(true);
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Función para guardar la configuración
  const handleSubmit = (e) => {
    e.preventDefault();

    const configuracion = {
      satisfaccionMinima: Number(satisfaccion),
      riesgoMaximo: Number(riesgo),
      notificaciones,
      correo: notificaciones ? correo.trim() : '',
    };

    console.log('Configuración de alertas:', configuracion);

    // Temporal: después se conectará con Django
    setMensaje('Configuración preparada correctamente (modo demostración).');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1E3A5F] to-slate-900 px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">

        {/* HEADER */}
        <div className="px-8 pt-10 pb-6 text-center">
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">
            WorkSpace Pulse
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Configuración de umbrales y alertas del sistema
          </p>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-6">

          {/* SECCIÓN 1: UMBRALES */}
          <div className="space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-[#1E293B]">
                Umbrales de evaluación
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Define los límites permitidos para los indicadores laborales.
              </p>
            </div>

            {/* Campo Satisfacción */}
            <div>
              <label
                htmlFor="satisfaccion"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Satisfacción mínima (%)
              </label>
              <input
                id="satisfaccion"
                type="number"
                min="0"
                max="100"
                step="1"
                value={satisfaccion}
                onChange={(e) => {
                  setSatisfaccion(e.target.value);
                  setMensaje('');
                }}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg 
                           text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent 
                           transition-all duration-200 ease-in-out"
              />
              <p className="mt-2 text-xs text-slate-500">
                Se generará una alerta si la satisfacción es menor al valor establecido.
              </p>
            </div>

            {/* Campo Riesgo */}
            <div>
              <label
                htmlFor="riesgo"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Riesgo máximo permitido (%)
              </label>
              <input
                id="riesgo"
                type="number"
                min="0"
                max="100"
                step="1"
                value={riesgo}
                onChange={(e) => {
                  setRiesgo(e.target.value);
                  setMensaje('');
                }}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg 
                           text-slate-800 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent 
                           transition-all duration-200 ease-in-out"
              />
              <p className="mt-2 text-xs text-slate-500">
                Se generará una alerta cuando el riesgo supere este porcentaje.
              </p>
            </div>
          </div>

          {/* SECCIÓN 2: NOTIFICACIONES */}
          <div className="space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-[#1E293B]">
                Notificaciones por correo
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Configura el envío de alertas a Recursos Humanos.
              </p>
            </div>

            {/* Activar o desactivar notificaciones */}
            <label className="flex items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Activar notificaciones
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Recibir avisos cuando se detecten indicadores críticos.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notificaciones}
                onChange={(e) => {
                  setNotificaciones(e.target.checked);
                  setMensaje('');
                }}
                className="w-5 h-5 accent-[#1E3A5F] cursor-pointer"
              />
            </label>

            {/* Campo Correo */}
            {notificaciones && (
              <div>
                <label
                  htmlFor="correo"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Correo electrónico del responsable
                </label>
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    setMensaje('');
                  }}
                  placeholder="recursoshumanos@empresa.com"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg 
                             text-slate-800 placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent 
                             transition-all duration-200 ease-in-out"
                />
              </div>
            )}
          </div>

          {/* MENSAJE DE CONFIRMACIÓN */}
          {mensaje && (
            <div role="status" className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-[#1E3A5F]">
                {mensaje}
              </p>
            </div>
          )}

          {/* BOTÓN PRINCIPAL */}
          <button
            type="submit"
            className="w-full mt-4 bg-[#1E3A5F] hover:bg-[#172A47] text-white 
                       font-bold py-3 rounded-lg shadow-md hover:shadow-lg 
                       transform hover:-translate-y-0.5 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A5F]"
          >
            Guardar configuración
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