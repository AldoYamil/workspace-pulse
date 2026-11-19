// src/pages/ConfiguracionAlertas.jsx
import { useState, useEffect } from 'react';
import EvaluarAlertas from '../components/EvaluarAlertas';
import api from '../api/axios';

export default function ConfiguracionAlertas() {
  // Estados del formulario
  const [satisfaccion, setSatisfaccion] = useState('60');
  const [riesgo, setRiesgo] = useState('70');
  const [notificaciones, setNotificaciones] = useState(true);
  const [correo, setCorreo] = useState('');
  
  // Estados para datos reales de la BD
  const [centrosTrabajo, setCentrosTrabajo] = useState([]);
  const [areas, setAreas] = useState([]);
  const [centroSeleccionado, setCentroSeleccionado] = useState('');
  const [areaSeleccionada, setAreaSeleccionada] = useState('');

  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  // Cargar centros de trabajo reales al montar el componente
  useEffect(() => {
    async function cargarDatosIniciales() {
      try {
        const respuestaCentros = await api.get('v1/centrotrabajo/list/');
        if (respuestaCentros.data && respuestaCentros.data.length > 0) {
          setCentrosTrabajo(respuestaCentros.data);
          setCentroSeleccionado(String(respuestaCentros.data[0].id));
        }
      } catch (error) {
        console.error('Error al cargar centros de trabajo:', error);
      }
    }
    cargarDatosIniciales();
  }, []);

  // Cargar áreas cuando cambie el centro de trabajo seleccionado
  useEffect(() => {
    async function cargarAreasPorCentro() {
      if (!centroSeleccionado) {
        setAreas([]);
        setAreaSeleccionada('');
        return;
      }
      try {
        // Primero intenta la lista general y filtra por el centro seleccionado
        const respuestaAreas = await api.get('v1/area/list/');
        const lista = Array.isArray(respuestaAreas.data)
          ? respuestaAreas.data
          : (respuestaAreas.data?.results || []);

        const filtradas = lista.filter((a) => {
          const centroId =
            typeof a.centro_trabajo === 'object'
              ? a.centro_trabajo?.id
              : (a.centro_trabajo ?? a.centro_id ?? a.centro);
          return String(centroId) === String(centroSeleccionado);
        });

        setAreas(filtradas);
        if (filtradas.length > 0) {
          setAreaSeleccionada(String(filtradas[0].id));
        } else {
          setAreaSeleccionada('');
        }
      } catch (error) {
        console.error('Error al cargar áreas:', error);
        setAreas([]);
        setAreaSeleccionada('');
      }
    }
    cargarAreasPorCentro();
  }, [centroSeleccionado]);

  // Función para guardar la configuración real en Django
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!centroSeleccionado || !areaSeleccionada) {
      setMensaje('Debes seleccionar un Centro de Trabajo y un Área.');
      return;
    }

    setCargando(true);
    setMensaje('');

    try {
      const payload = {
        metrica: 'Riesgo Psicosocial / Satisfacción',
        valor_minimo_aceptable: Number(riesgo),
        centro_trabajo: Number(centroSeleccionado),
        area: Number(areaSeleccionada),
        correo_responsable: notificaciones ? correo.trim() : '',
      };

      await api.post('v1/configuracionumbral/create/', payload);

      setMensaje('¡Configuración guardada correctamente en la base de datos!');
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      const detalle = error.response?.data
        ? JSON.stringify(error.response.data)
        : 'Hubo un error al guardar la configuración en el servidor.';
      setMensaje(detalle);
    } finally {
      setCargando(false);
    }
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

          {/* SECCIÓN 1: UBICACIÓN */}
          <div className="space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-[#1E293B]">
                Ubicación organizacional
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Selecciona el centro de trabajo y área a aplicar el umbral.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Centro de trabajo</label>
                <select
                  value={centroSeleccionado}
                  onChange={(e) => setCentroSeleccionado(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  required
                >
                  {centrosTrabajo.map((centro) => (
                    <option key={centro.id} value={centro.id}>{centro.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Área</label>
                <select
                  value={areaSeleccionada}
                  onChange={(e) => setAreaSeleccionada(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  required
                >
                  {areas.length > 0 ? (
                    areas.map((area) => (
                      <option key={area.id} value={area.id}>{area.nombre}</option>
                    ))
                  ) : (
                    <option value="">No hay áreas disponibles</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: UMBRALES */}
          <div className="space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-[#1E293B]">
                Umbrales de evaluación
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Define los límites permitidos para los indicadores laborales.
              </p>
            </div>

            <div>
              <label htmlFor="satisfaccion" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Satisfacción mínima (%)
              </label>
              <input
                id="satisfaccion"
                type="number"
                min="0"
                max="100"
                step="1"
                value={satisfaccion}
                onChange={(e) => { setSatisfaccion(e.target.value); setMensaje(''); }}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
            </div>

            <div>
              <label htmlFor="riesgo" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Riesgo máximo permitido (%)
              </label>
              <input
                id="riesgo"
                type="number"
                min="0"
                max="100"
                step="1"
                value={riesgo}
                onChange={(e) => { setRiesgo(e.target.value); setMensaje(''); }}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
            </div>
          </div>

          {/* SECCIÓN 3: NOTIFICACIONES Y CORREO */}
          <div className="space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-[#1E293B]">
                Notificaciones por correo
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Configura el envío de alertas automáticas para Recursos Humanos.
              </p>
            </div>

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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
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
            disabled={cargando}
            className="w-full mt-4 bg-[#1E3A5F] hover:bg-[#172A47] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {cargando ? 'Guardando...' : 'Guardar configuración'}
          </button>

        </form>

        <EvaluarAlertas />

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 WorkSpace Pulse · Cumplimiento NOM-035-STPS-2018
          </p>
        </div>

      </div>
    </div>
  );
}