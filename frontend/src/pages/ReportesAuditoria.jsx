
import { useMemo, useState } from 'react';
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

// POR LO MIENTRAS:
// Estos registros son ejemplos locales.
// Después se obtendrán desde el backend mediante una petición GET.
const reportesIniciales = [
  {
    id: 'AUD-001',
    titulo: 'Evaluación general de riesgos psicosociales',
    tipo: 'Evaluación',
    responsable: 'Ana Martínez',
    fecha: '2026-10-10',
    estado: 'Generado',
    descripcion:
      'Resumen de los resultados de la evaluación de factores de riesgo psicosocial.',
    observaciones:
      'Se deben revisar las áreas con resultados elevados y definir las medidas preventivas correspondientes.',
  },
  {
    id: 'AUD-002',
    titulo: 'Seguimiento de medidas preventivas',
    tipo: 'Seguimiento',
    responsable: 'Carlos López',
    fecha: '2026-10-14',
    estado: 'Pendiente',
    descripcion:
      'Revisión del avance de las acciones preventivas registradas por las áreas.',
    observaciones:
      'Pendiente de recopilar y validar las evidencias de las acciones implementadas.',
  },
  {
    id: 'AUD-003',
    titulo: 'Reporte de cumplimiento documental',
    tipo: 'Cumplimiento',
    responsable: 'María García',
    fecha: '2026-10-16',
    estado: 'Generado',
    descripcion:
      'Listado de documentos relacionados con las actividades de prevención y seguimiento.',
    observaciones:
      'Verificar que los documentos estén actualizados y que las evidencias correspondan al periodo revisado.',
  },
  {
    id: 'AUD-004',
    titulo: 'Historial de acciones correctivas',
    tipo: 'Seguimiento',
    responsable: 'Diego Hernández',
    fecha: '2026-10-18',
    estado: 'En revisión',
    descripcion:
      'Consulta de acciones correctivas registradas y su estado de seguimiento.',
    observaciones:
      'El responsable debe validar la información antes de cerrar el reporte.',
  },
];

// POR LO MIENTRAS:
// Estas opciones se usan para construir los filtros de la pantalla.
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
  // POR LO MIENTRAS:
  // Los reportes se guardan en el estado de React.
  // Al recargar la página, los cambios locales se pierden.
  const [reportes, setReportes] = useState(reportesIniciales);

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
    fecha: '2026-10-18',
    descripcion: '',
  });

  // POR LO MIENTRAS:
  // Estos indicadores se calculan a partir del arreglo local.
  // Más adelante se podrán obtener del backend.
  const totalReportes = reportes.length;

  const reportesGenerados = reportes.filter(
    (reporte) => reporte.estado === 'Generado'
  ).length;

  const reportesPendientes = reportes.filter(
    (reporte) => reporte.estado === 'Pendiente'
  ).length;

  const reportesEnRevision = reportes.filter(
    (reporte) => reporte.estado === 'En revisión'
  ).length;

  // Filtramos los registros en el frontend.
  // PENDIENTE: trasladar estos filtros al backend si el volumen crece.
  const reportesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return reportes.filter((reporte) => {
      const coincideBusqueda =
        reporte.titulo.toLowerCase().includes(texto) ||
        reporte.id.toLowerCase().includes(texto) ||
        reporte.responsable.toLowerCase().includes(texto);

      const coincideTipo =
        tipoSeleccionado === 'Todos' ||
        reporte.tipo === tipoSeleccionado;

      const coincideEstado =
        estadoSeleccionado === 'Todos' ||
        reporte.estado === estadoSeleccionado;

      return coincideBusqueda && coincideTipo && coincideEstado;
    });
  }, [reportes, busqueda, tipoSeleccionado, estadoSeleccionado]);

  function actualizarCampo(campo, valor) {
    setNuevoReporte((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function registrarReporte(evento) {
    evento.preventDefault();

    if (
      !nuevoReporte.titulo.trim() ||
      !nuevoReporte.responsable.trim() ||
      !nuevoReporte.fecha
    ) {
      return;
    }

    // POR LO MIENTRAS:
    // Creamos el registro en memoria y generamos un ID local.
    // PENDIENTE: enviar los datos al backend con POST
    // y utilizar el identificador que devuelva la base de datos.
    const reporteCreado = {
      ...nuevoReporte,
      id: `AUD-${String(Date.now()).slice(-6)}`,
      estado: 'Pendiente',
      observaciones:
        'Reporte registrado. Falta completar su revisión y generación.',
    };

    setReportes((anteriores) => [reporteCreado, ...anteriores]);

    setNuevoReporte({
      titulo: '',
      tipo: 'Evaluación',
      responsable: '',
      fecha: '2026-10-18',
      descripcion: '',
    });

    setMostrarFormulario(false);
  }

  function cambiarEstado(id, nuevoEstado) {
    // PENDIENTE:
    // Actualizar también el registro en el backend para conservar
    // el cambio cuando se recargue la aplicación.
    setReportes((anteriores) =>
      anteriores.map((reporte) =>
        reporte.id === id
          ? { ...reporte, estado: nuevoEstado }
          : reporte
      )
    );
  }

  function exportarResumen(reporte) {
    // POR LO MIENTRAS:
    // Exportamos un archivo TXT para probar la interacción.
    // Esto NO genera un PDF oficial ni una auditoría certificada.
    // PENDIENTE XD: integrar jsPDF y validar los datos con el backend.

    const contenido = [
      'WORKSPACE PULSE',
      'Resumen de reporte de auditoría',
      '',
      `Identificador: ${reporte.id}`,
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
      '',
      'NOTA: Documento de prueba generado con datos locales.',
    ].join('\n');

    const archivo = new Blob([contenido], {
      type: 'text/plain;charset=utf-8',
    });

    const urlArchivo = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');

    enlace.href = urlArchivo;
    enlace.download = `${reporte.id}.txt`;

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
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1E3A5F]">
            <FileSearch size={18} />
            Control documental
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Reportes de auditoría
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Consulta reportes, revisa su información y da seguimiento
            a los documentos registrados en la plataforma.
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
        <TarjetaIndicador
          titulo="Total de reportes"
          valor={totalReportes}
          descripcion="Registros disponibles"
          icono={FileText}
          color="blue"
        />

        <TarjetaIndicador
          titulo="Generados"
          valor={reportesGenerados}
          descripcion="Marcados como generados"
          icono={CheckCircle2}
          color="green"
        />

        <TarjetaIndicador
          titulo="Pendientes"
          valor={reportesPendientes}
          descripcion="Esperando generación"
          icono={Clock}
          color="amber"
        />

        <TarjetaIndicador
          titulo="En revisión"
          valor={reportesEnRevision}
          descripcion="Requieren validación"
          icono={ClipboardCheck}
          color="purple"
        />
      </section>

      {/* HISTORIAL DE REPORTES */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 className="font-bold text-slate-800">
              Historial de reportes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Busca reportes y filtra los resultados según tus necesidades.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar por título, ID o responsable"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

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
              onChange={(evento) =>
                setEstadoSeleccionado(evento.target.value)
              }
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
              {reportesFiltrados.map((reporte) => (
                <tr
                  key={reporte.id}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">
                      {reporte.titulo}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {reporte.id}
                    </p>
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
                      {new Date(
                        `${reporte.fecha}T12:00:00`
                      ).toLocaleDateString('es-MX')}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                        estilosEstado[reporte.estado] ||
                        'bg-slate-100 text-slate-600'
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
                        onChange={(evento) =>
                          cambiarEstado(reporte.id, evento.target.value)
                        }
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
              ))}

              {reportesFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
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
                    {reporteSeleccionado.id}
                  </p>
                  <h2
                    id="titulo-vista-previa"
                    className="mt-1 text-xl font-bold text-slate-900"
                  >
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
                    estilosEstado[reporteSeleccionado.estado] ||
                    'bg-slate-100 text-slate-600'
                  }`}
                >
                  {reporteSeleccionado.estado}
                </span>

                <h3 className="mt-4 text-lg font-bold text-slate-800">
                  {reporteSeleccionado.titulo}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {reporteSeleccionado.descripcion ||
                    'Sin descripción registrada.'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DatoReporte
                  etiqueta="Tipo de reporte"
                  valor={reporteSeleccionado.tipo}
                />

                <DatoReporte
                  etiqueta="Responsable"
                  valor={reporteSeleccionado.responsable}
                />

                <DatoReporte
                  etiqueta="Fecha de registro"
                  valor={new Date(
                    `${reporteSeleccionado.fecha}T12:00:00`
                  ).toLocaleDateString('es-MX')}
                />

                <DatoReporte
                  etiqueta="Identificador"
                  valor={reporteSeleccionado.id}
                />
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="font-semibold text-slate-800">
                  Observaciones
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {reporteSeleccionado.observaciones ||
                    'No hay observaciones registradas.'}
                </p>
              </div>

              {/* POR LO MIENTRAS XD:
                  Esta vista muestra los datos registrados localmente.
                  No sustituye una auditoría ni valida el cumplimiento normativo. */}
              <p className="text-xs leading-5 text-slate-400">
                La información mostrada corresponde al registro disponible
                en la aplicación. Su validez depende de la revisión y
                verificación de los datos originales.
              </p>
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
                <h2
                  id="titulo-nuevo-reporte"
                  className="text-xl font-bold text-slate-900"
                >
                  Registrar reporte
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Captura la información básica del registro.
                </p>
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
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Título del reporte *
                </label>
                <input
                  required
                  value={nuevoReporte.titulo}
                  onChange={(evento) =>
                    actualizarCampo('titulo', evento.target.value)
                  }
                  placeholder="Nombre del reporte"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Tipo *
                  </label>
                  <select
                    value={nuevoReporte.tipo}
                    onChange={(evento) =>
                      actualizarCampo('tipo', evento.target.value)
                    }
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
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Fecha *
                  </label>
                  <input
                    required
                    type="date"
                    value={nuevoReporte.fecha}
                    onChange={(evento) =>
                      actualizarCampo('fecha', evento.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Responsable *
                </label>
                <input
                  required
                  value={nuevoReporte.responsable}
                  onChange={(evento) =>
                    actualizarCampo('responsable', evento.target.value)
                  }
                  placeholder="Nombre de la persona responsable"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={nuevoReporte.descripcion}
                  onChange={(evento) =>
                    actualizarCampo('descripcion', evento.target.value)
                  }
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

// Componente reutilizable para las tarjetas de resumen.
function TarjetaIndicador({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  color,
}) {
  // Clases completas para que Tailwind pueda detectarlas al compilar.
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
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {valor}
          </p>
          <p className="mt-1 text-xs text-slate-400">{descripcion}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            estilos[color] || estilos.blue
          }`}
        >
          <Icono size={21} />
        </div>
      </div>
    </article>
  );
}

// Componente reutilizable para los detalles de la vista previa.
function DatoReporte({ etiqueta, valor }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-400">{etiqueta}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {valor || 'No disponible'}
      </p>
    </div>
  );
}
