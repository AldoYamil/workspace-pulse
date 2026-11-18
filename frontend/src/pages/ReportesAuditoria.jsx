import { useMemo, useState, useEffect } from 'react';
import {
  FileText,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  Search,
  Download,
  Eye,
  CalendarDays,
  UserRound,
  X,
  FileSearch,
  Filter,
} from 'lucide-react';
import api from '../api/axios'; // <--- Tu cliente de Axios configurado

// Opciones para filtros de la pantalla
const tiposReporte = [
  'Todos',
  'Evaluación',
  'Seguimiento',
  'Cumplimiento',
];

const estadosReporte = ['Todos', 'Generado', 'Pendiente', 'En revisión'];

const estilosEstado = {
  Generado: 'bg-emerald-100 text-emerald-700',
  Pendiente: 'bg-amber-100 text-amber-700',
  'En revisión': 'bg-blue-100 text-blue-700',
};

export default function ReportesAuditoria() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [busqueda, setBusqueda] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('Todos');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('Todos');

  // Controla qué reporte se muestra en la ventana de vista previa.
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

  // Controla la ventana para registrar un reporte nuevo.
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Datos temporales del formulario.
  const [nuevoReporte, setNuevoReporte] = useState({
    titulo: '',
    tipo: 'Evaluación',
    responsable: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
  });

  // Cargar registros al montar el componente
  useEffect(() => {
    obtenerReportes();
  }, []);

async function obtenerReportes() {
    try {
      setCargando(true);
      
      // Consultamos las tablas reales que ya existen en el backend
      // (Ajusta las rutas según cómo estén en tus archivos de urls/)
      const [resCampanas, resPlanes, resPoliticas] = await Promise.all([
        api.get('campanas-evaluacion/'),
        api.get('planeaciones/'),
        api.get('politicas-prevencion/'),
      ]);

      // Transformamos cada registro al formato que espera tu tabla de ReportesAuditoria
      const reportesEvaluacion = resCampanas.data.map((item) => ({
        id: `EVAL-${item.id}`,
        titulo: item.nombre,
        tipo: 'Evaluación',
        responsable: 'Equipo RRHH', // O el campo que devuelva tu serializer
        fecha: item.fecha_inicio,
        estado: item.estado ? 'Generado' : 'En revisión',
        descripcion: `Evaluación aplicada en centro de trabajo #${item.centro_trabajo}`,
        observaciones: `Periodo del ${item.fecha_inicio} al ${item.fecha_fin}`,
      }));

      const reportesSeguimiento = resPlanes.data.map((item) => ({
        id: `SEG-${item.id}`,
        titulo: item.titulo,
        tipo: 'Seguimiento',
        responsable: item.usuario_nombre || `Usuario #${item.usuario}`,
        fecha: item.fecha_compromiso,
        estado: item.estado === 'Completado' ? 'Generado' : 'Pendiente',
        descripcion: item.descripcion_medida,
        observaciones: 'Medida preventiva derivada de resultados de riesgo.',
      }));

      const reportesCumplimiento = resPoliticas.data.map((item) => ({
        id: `COMP-${item.id}`,
        titulo: `${item.titulo} (v${item.version})`,
        tipo: 'Cumplimiento',
        responsable: 'Administración',
        fecha: item.fecha_publicacion.split('T')[0],
        estado: item.estado ? 'Generado' : 'Pendiente',
        descripcion: item.contenido_texto,
        observaciones: 'Documento oficial de política de prevención.',
      }));

      // Unimos todos los reportes reales en la misma tabla
      setReportes([
        ...reportesEvaluacion,
        ...reportesSeguimiento,
        ...reportesCumplimiento,
      ]);
    } catch (error) {
      console.error('Error al cargar los datos reales para auditoría:', error);
    } finally {
      setCargando(false);
    }
  }

  const totalReportes = reportes.length;
  const reportesGenerados = reportes.filter((r) => r.estado === 'Generado').length;
  const reportesPendientes = reportes.filter((r) => r.estado === 'Pendiente').length;
  const reportesEnRevision = reportes.filter((r) => r.estado === 'En revisión').length;

  const reportesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return reportes.filter((reporte) => {
      const coincideBusqueda =
        reporte.titulo.toLowerCase().includes(texto) ||
        String(reporte.id).toLowerCase().includes(texto) ||
        reporte.responsable.toLowerCase().includes(texto);

      const coincideTipo =
        tipoSeleccionado === 'Todos' || reporte.tipo === tipoSeleccionado;

      const coincideEstado =
        estadoSeleccionado === 'Todos' || reporte.estado === estadoSeleccionado;

      return coincideBusqueda && coincideTipo && coincideEstado;
    });
  }, [reportes, busqueda, tipoSeleccionado, estadoSeleccionado]);

  function actualizarCampo(campo, valor) {
    setNuevoReporte((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function registrarReporte(evento) {
    evento.preventDefault();

    if (!nuevoReporte.titulo.trim() || !nuevoReporte.responsable.trim() || !nuevoReporte.fecha) {
      return;
    }

    try {
      const payload = {
        ...nuevoReporte,
        estado: 'Pendiente',
        observaciones: 'Reporte registrado. Falta completar su revisión y generación.',
      };

      // Petición POST al backend
      const respuesta = await api.post('reportes-auditoria/', payload);

      setReportes((anteriores) => [respuesta.data, ...anteriores]);

      setNuevoReporte({
        titulo: '',
        tipo: 'Evaluación',
        responsable: '',
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
      });

      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al registrar el reporte:', error);
    }
  }

  async function cambiarEstado(id, nuevoEstado) {
    try {
      // Petición PATCH para actualizar el estado en el backend
      await api.patch(`reportes-auditoria/${id}/`, { estado: nuevoEstado });

      setReportes((anteriores) =>
        anteriores.map((reporte) =>
          reporte.id === id ? { ...reporte, estado: nuevoEstado } : reporte
        )
      );
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
    }
  }

  function exportarResumen(reporte) {
    const contenido = [
      'WORKSPACE PULSE',
      'Resumen de reporte de auditoría',
      '',
      `Identificador: AUD-${reporte.id}`,
      `Título: ${reporte.titulo}`,
      `Tipo: ${reporte.tipo}`,
      `Responsable: ${reporte.responsable}`,
      `Fecha: ${reporte.fecha}`,
      `Estado: ${reporte.estado}`,
      '',
      'Descripción:',
      reporte.descripcion || 'Sin descripción registrada.',
      '',
      'Observaciones:',
      reporte.observaciones || 'Sin observaciones registradas.',
    ].join('\n');

    const archivo = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const urlArchivo = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');

    enlace.href = urlArchivo;
    enlace.download = `AUD-${reporte.id}.txt`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(urlArchivo);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* ENCABEZADO */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Reportes de auditoría
          </h1>
          <p className="text-slate-300 text-base">
            Consulta reportes, revisa su información y da seguimiento a los documentos registrados en la plataforma.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMostrarFormulario(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#294d78]"
        >
          <FileText size={18} />
          Registrar reporte
        </button>
      </section>

      {/* TARJETAS DE INDICADORES */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaIndicador titulo="Total de reportes" valor={totalReportes} descripcion="Registros disponibles" icono={FileText} color="blue" />
        <TarjetaIndicador titulo="Generados" valor={reportesGenerados} descripcion="Marcados como generados" icono={CheckCircle2} color="green" />
        <TarjetaIndicador titulo="Pendientes" valor={reportesPendientes} descripcion="Esperando generación" icono={Clock} color="amber" />
        <TarjetaIndicador titulo="En revisión" valor={reportesEnRevision} descripcion="Requieren validación" icono={ClipboardCheck} color="purple" />
      </section>

      {/* HISTORIAL DE REPORTES */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 className="font-bold text-slate-800">Historial de reportes</h2>
            <p className="mt-1 text-sm text-slate-500">Busca reportes y filtra los resultados según tus necesidades.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="relative">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar por título, ID o responsable"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={tipoSeleccionado}
                onChange={(evento) => setTipoSeleccionado(evento.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1E3A5F]"
              >
                {tiposReporte.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo === 'Todos' ? 'Todos los tipos' : tipo}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={estadoSeleccionado}
              onChange={(evento) => setEstadoSeleccionado(evento.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
            >
              {estadosReporte.map((estado) => (
                <option key={estado} value={estado}>
                  {estado === 'Todos' ? 'Todos los estados' : estado}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Reporte</th>
                <th className="px-5 py-4 font-semibold">Tipo</th>
                <th className="px-5 py-4 font-semibold">Responsable</th>
                <th className="px-5 py-4 font-semibold">Fecha</th>
                <th className="px-5 py-4 font-semibold">Estado</th>
                <th className="px-5 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                    Cargando reportes...
                  </td>
                </tr>
              ) : (
                reportesFiltrados.map((reporte) => (
                  <tr key={reporte.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{reporte.titulo}</p>
                      <p className="mt-1 text-xs text-slate-400">AUD-{reporte.id}</p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                        {reporte.tipo}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <UserRound size={16} className="text-slate-400" />
                        {reporte.responsable}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-600">
                        <CalendarDays size={16} className="text-slate-400" />
                        {new Date(`${reporte.fecha}T12:00:00`).toLocaleDateString('es-MX')}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                          estilosEstado[reporte.estado] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {reporte.estado}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setReporteSeleccionado(reporte)}
                          title="Ver reporte"
                          aria-label={`Ver ${reporte.titulo}`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => exportarResumen(reporte)}
                          title="Exportar resumen TXT"
                          aria-label={`Exportar resumen de ${reporte.titulo}`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Download size={17} />
                        </button>

                        <select
                          value={reporte.estado}
                          onChange={(evento) => cambiarEstado(reporte.id, evento.target.value)}
                          aria-label={`Cambiar estado de ${reporte.titulo}`}
                          className="max-w-32 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-[#1E3A5F]"
                        >
                          {estadosReporte
                            .filter((estado) => estado !== 'Todos')
                            .map((estado) => (
                              <option key={estado} value={estado}>
                                {estado}
                              </option>
                            ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!cargando && reportesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                    No hay reportes que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
          Mostrando {reportesFiltrados.length} de {reportes.length} reportes
        </div>
      </section>

      {/* VENTANA DE VISTA PREVIA */}
      {reporteSeleccionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-vista-previa"
            className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A5F]">
                  <FileSearch size={22} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    AUD-{reporteSeleccionado.id}
                  </p>
                  <h2 id="titulo-vista-previa" className="mt-1 text-xl font-bold text-slate-900">
                    Vista previa del reporte
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReporteSeleccionado(null)}
                aria-label="Cerrar vista previa"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    estilosEstado[reporteSeleccionado.estado] || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {reporteSeleccionado.estado}
                </span>

                <h3 className="mt-4 text-lg font-bold text-slate-800">{reporteSeleccionado.titulo}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {reporteSeleccionado.descripcion || 'Sin descripción registrada.'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DatoReporte etiqueta="Tipo de reporte" valor={reporteSeleccionado.tipo} />
                <DatoReporte etiqueta="Responsable" valor={reporteSeleccionado.responsable} />
                <DatoReporte
                  etiqueta="Fecha de registro"
                  valor={new Date(`${reporteSeleccionado.fecha}T12:00:00`).toLocaleDateString('es-MX')}
                />
                <DatoReporte etiqueta="Identificador" valor={`AUD-${reporteSeleccionado.id}`} />
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="font-semibold text-slate-800">Observaciones</h4>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {reporteSeleccionado.observaciones || 'No hay observaciones registradas.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 p-5 sm:flex-row">
              <button
                type="button"
                onClick={() => setReporteSeleccionado(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => exportarResumen(reporteSeleccionado)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#294d78]"
              >
                <Download size={17} />
                Descargar resumen TXT
              </button>
            </div>
          </section>
        </div>
      )}

      {/* FORMULARIO DE REGISTRO */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-nuevo-reporte"
            className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 id="titulo-nuevo-reporte" className="text-xl font-bold text-slate-900">
                  Registrar reporte
                </h2>
                <p className="mt-1 text-sm text-slate-500">Captura la información básica del registro.</p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                aria-label="Cerrar formulario"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={registrarReporte} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Título del reporte *</label>
                <input
                  required
                  value={nuevoReporte.titulo}
                  onChange={(evento) => actualizarCampo('titulo', evento.target.value)}
                  placeholder="Nombre del reporte"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tipo *</label>
                  <select
                    value={nuevoReporte.tipo}
                    onChange={(evento) => actualizarCampo('tipo', evento.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                  >
                    {tiposReporte
                      .filter((tipo) => tipo !== 'Todos')
                      .map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Fecha *</label>
                  <input
                    required
                    type="date"
                    value={nuevoReporte.fecha}
                    onChange={(evento) => actualizarCampo('fecha', evento.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Responsable *</label>
                <input
                  required
                  value={nuevoReporte.responsable}
                  onChange={(evento) => actualizarCampo('responsable', evento.target.value)}
                  placeholder="Nombre de la persona responsable"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Descripción</label>
                <textarea
                  rows={3}
                  value={nuevoReporte.descripcion}
                  onChange={(evento) => actualizarCampo('descripcion', evento.target.value)}
                  placeholder="Describe el propósito del reporte..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                />
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#1E3A5F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#294d78]"
                >
                  Guardar registro
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function TarjetaIndicador({ titulo, valor, descripcion, icono: Icono, color }) {
  const estilos = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    purple: 'bg-violet-50 text-violet-700',
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{titulo}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{valor}</p>
          <p className="mt-1 text-xs text-slate-400">{descripcion}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${estilos[color] || estilos.blue}`}>
          <Icono size={21} />
        </div>
      </div>
    </article>
  );
}

function DatoReporte({ etiqueta, valor }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-400">{etiqueta}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-700">{valor || 'No disponible'}</p>
    </div>
  );
}