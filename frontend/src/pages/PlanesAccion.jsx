
import { useState } from 'react';
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  CalendarDays,
  UserRound,
  Sparkles,
  ArrowUpRight,
  X,
} from 'lucide-react';

// POR LO MIENTRAS XD:
// Estos datos son de ejemplo. Después deben obtenerse del backend
// mediante una petición a la API y guardarse en la base de datos.
const planesIniciales = [
  {
    id: 1,
    titulo: 'Mejorar la comunicación del equipo',
    area: 'Recursos Humanos',
    responsable: 'Ana Martínez',
    fechaLimite: '2026-11-10',
    prioridad: 'Alta',
    estado: 'En progreso',
    descripcion:
      'Establecer reuniones periódicas y canales claros de comunicación.',
  },
  {
    id: 2,
    titulo: 'Reducir la carga de trabajo',
    area: 'Desarrollo',
    responsable: 'Carlos López',
    fechaLimite: '2026-11-20',
    prioridad: 'Alta',
    estado: 'Pendiente',
    descripcion:
      'Revisar la distribución de tareas y establecer prioridades realistas.',
  },
  {
    id: 3,
    titulo: 'Promover el bienestar laboral',
    area: 'Administración',
    responsable: 'María García',
    fechaLimite: '2026-10-25',
    prioridad: 'Media',
    estado: 'Completado',
    descripcion:
      'Organizar actividades de integración y espacios de retroalimentación.',
  },
];

// POR LO MIENTRAS XD:
// Recomendaciones estáticas. Después podrían generarse usando los
// resultados del panel de riesgos y un servicio de recomendaciones.
const recomendacionesIniciales = [
  {
    id: 1,
    titulo: 'Fortalecer la comunicación',
    detalle:
      'Establecer reuniones breves de seguimiento y mecanismos de retroalimentación.',
    origen: 'Comunicación organizacional',
  },
  {
    id: 2,
    titulo: 'Revisar la distribución de tareas',
    detalle:
      'Identificar cargas de trabajo desiguales y ajustar las responsabilidades.',
    origen: 'Carga de trabajo',
  },
  {
    id: 3,
    titulo: 'Capacitar a los responsables',
    detalle:
      'Promover formación sobre liderazgo, prevención de conflictos y bienestar laboral.',
    origen: 'Liderazgo',
  },
];

const coloresEstado = {
  Pendiente: 'bg-amber-100 text-amber-700',
  'En progreso': 'bg-blue-100 text-blue-700',
  Completado: 'bg-emerald-100 text-emerald-700',
};

const coloresPrioridad = {
  Alta: 'bg-red-100 text-red-700',
  Media: 'bg-amber-100 text-amber-700',
  Baja: 'bg-slate-100 text-slate-600',
};

export default function PlanesAccion() {
  // POR LO MIENTRAS XD:
  // Guardamos los planes en memoria. Si recargas la página,
  // los cambios se perderán hasta conectar la persistencia con el backend.
  const [planes, setPlanes] = useState(planesIniciales);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  // Controla si el formulario para crear un plan está abierto.
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Datos temporales del formulario de creación.
  const [nuevoPlan, setNuevoPlan] = useState({
    titulo: '',
    area: '',
    responsable: '',
    fechaLimite: '',
    prioridad: 'Media',
    descripcion: '',
  });

  // POR LO MIENTRAS XD:
  // Estos conteos se calculan usando el arreglo local.
  // Después deberán calcularse con los datos reales recibidos de la API.
  const pendientes = planes.filter(
    (plan) => plan.estado === 'Pendiente'
  ).length;

  const enProgreso = planes.filter(
    (plan) => plan.estado === 'En progreso'
  ).length;

  const completados = planes.filter(
    (plan) => plan.estado === 'Completado'
  ).length;

  // Filtramos localmente por título, área o responsable y por estado.
  const planesFiltrados = planes.filter((plan) => {
    const texto = busqueda.toLowerCase();

    const coincideBusqueda =
      plan.titulo.toLowerCase().includes(texto) ||
      plan.area.toLowerCase().includes(texto) ||
      plan.responsable.toLowerCase().includes(texto);

    const coincideEstado =
      filtroEstado === 'Todos' || plan.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  function actualizarCampo(campo, valor) {
    setNuevoPlan((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function crearPlan(evento) {
    evento.preventDefault();

    if (
      !nuevoPlan.titulo.trim() ||
      !nuevoPlan.area.trim() ||
      !nuevoPlan.responsable.trim() ||
      !nuevoPlan.fechaLimite
    ) {
      return;
    }

    // POR LO MIENTRAS XD:
    // El ID se genera localmente. En el backend normalmente lo genera
    // la base de datos y el plan se crea mediante una petición POST.
    const planCreado = {
      ...nuevoPlan,
      id: Date.now(),
      estado: 'Pendiente',
    };

    setPlanes((anteriores) => [planCreado, ...anteriores]);

    setNuevoPlan({
      titulo: '',
      area: '',
      responsable: '',
      fechaLimite: '',
      prioridad: 'Media',
      descripcion: '',
    });

    setMostrarFormulario(false);
  }

  function cambiarEstado(id, nuevoEstado) {
    // PENDIENTE XD:
    // Después de actualizar el estado en pantalla, también habrá que
    // enviar el cambio al backend para que quede guardado en la BD.
    setPlanes((anteriores) =>
      anteriores.map((plan) =>
        plan.id === id ? { ...plan, estado: nuevoEstado } : plan
      )
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* ENCABEZADO */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1E3A5F]">
            <ClipboardCheck size={18} />
            Gestión preventiva
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Planes de acción
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Organiza acciones preventivas, asigna responsables y da seguimiento
            a las medidas de bienestar laboral.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMostrarFormulario(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#294d78]"
        >
          <Plus size={18} />
          Nuevo plan
        </button>
      </section>

      {/* TARJETAS DE RESUMEN */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaResumen
          titulo="Total de planes"
          valor={planes.length}
          descripcion="Planes registrados"
          icono={ClipboardCheck}
          color="blue"
        />

        <TarjetaResumen
          titulo="Pendientes"
          valor={pendientes}
          descripcion="Requieren atención"
          icono={Clock}
          color="amber"
        />

        <TarjetaResumen
          titulo="En progreso"
          valor={enProgreso}
          descripcion="Acciones en ejecución"
          icono={AlertTriangle}
          color="indigo"
        />

        <TarjetaResumen
          titulo="Completados"
          valor={completados}
          descripcion="Acciones finalizadas"
          icono={CheckCircle2}
          color="green"
        />
      </section>

      {/* LISTADO DE PLANES */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              Seguimiento de acciones
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Consulta los responsables, fechas y estados de cada plan.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar plan, área..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#1E3A5F] sm:w-64"
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(evento) => setFiltroEstado(evento.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Pendiente">Pendientes</option>
              <option value="En progreso">En progreso</option>
              <option value="Completado">Completados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Plan de acción</th>
                <th className="px-5 py-4 font-semibold">Responsable</th>
                <th className="px-5 py-4 font-semibold">Fecha límite</th>
                <th className="px-5 py-4 font-semibold">Prioridad</th>
                <th className="px-5 py-4 font-semibold">Estado</th>
                <th className="px-5 py-4 font-semibold">Actualizar</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {planesFiltrados.map((plan) => (
                <tr key={plan.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">
                      {plan.titulo}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {plan.area}
                    </p>
                    {plan.descripcion && (
                      <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                        {plan.descripcion}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <UserRound size={16} className="text-slate-400" />
                      {plan.responsable}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-600">
                      <CalendarDays size={16} className="text-slate-400" />
                      {plan.fechaLimite
                        ? new Date(
                            `${plan.fechaLimite}T12:00:00`
                          ).toLocaleDateString('es-MX')
                        : 'Sin fecha'}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        coloresPrioridad[plan.prioridad] ||
                        'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {plan.prioridad}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                        coloresEstado[plan.estado] ||
                        'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {plan.estado}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {plan.estado !== 'Completado' ? (
                      <select
                        value={plan.estado}
                        onChange={(evento) =>
                          cambiarEstado(plan.id, evento.target.value)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-[#1E3A5F]"
                        aria-label={`Cambiar estado de ${plan.titulo}`}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En progreso">En progreso</option>
                        <option value="Completado">Completado</option>
                      </select>
                    ) : (
                      <span className="text-xs font-medium text-emerald-700">
                        Finalizado
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {planesFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No se encontraron planes con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
          Mostrando {planesFiltrados.length} de {planes.length} planes
        </div>
      </section>

      {/* RECOMENDACIONES */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <Sparkles size={22} />
          </div>

          <div>
            <h2 className="font-bold text-slate-800">
              Recomendaciones preventivas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Sugerencias generales para orientar la creación de nuevos planes.
            </p>
          </div>
        </div>

        {/* POR LO MIENTRAS XD:
            Son sugerencias estáticas, no recomendaciones generadas por IA. */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {recomendacionesIniciales.map((recomendacion) => (
            <article
              key={recomendacion.id}
              className="rounded-xl border border-slate-200 p-4 transition hover:border-violet-200 hover:bg-violet-50/30"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                {recomendacion.origen}
              </p>

              <h3 className="mt-2 font-bold text-slate-800">
                {recomendacion.titulo}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {recomendacion.detalle}
              </p>

              <button
                type="button"
                onClick={() => {
                  setNuevoPlan((anterior) => ({
                    ...anterior,
                    titulo: recomendacion.titulo,
                    descripcion: recomendacion.detalle,
                  }));
                  setMostrarFormulario(true);
                }}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1E3A5F] hover:underline"
              >
                Crear plan con esta idea
                <ArrowUpRight size={15} />
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* FORMULARIO PARA CREAR PLAN */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-formulario"
            className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2
                  id="titulo-formulario"
                  className="text-xl font-bold text-slate-900"
                >
                  Crear plan de acción
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Define una acción, su responsable y su fecha límite.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Cerrar formulario"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={crearPlan} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Nombre del plan *
                </label>
                <input
                  required
                  value={nuevoPlan.titulo}
                  onChange={(evento) =>
                    actualizarCampo('titulo', evento.target.value)
                  }
                  placeholder="Ej. Mejorar la comunicación interna"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Área *
                  </label>
                  <input
                    required
                    value={nuevoPlan.area}
                    onChange={(evento) =>
                      actualizarCampo('area', evento.target.value)
                    }
                    placeholder="Ej. Recursos Humanos"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Responsable *
                  </label>
                  <input
                    required
                    value={nuevoPlan.responsable}
                    onChange={(evento) =>
                      actualizarCampo('responsable', evento.target.value)
                    }
                    placeholder="Nombre del responsable"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Fecha límite *
                  </label>
                  <input
                    required
                    type="date"
                    value={nuevoPlan.fechaLimite}
                    onChange={(evento) =>
                      actualizarCampo('fechaLimite', evento.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Prioridad
                  </label>
                  <select
                    value={nuevoPlan.prioridad}
                    onChange={(evento) =>
                      actualizarCampo('prioridad', evento.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Descripción de la acción
                </label>
                <textarea
                  rows={3}
                  value={nuevoPlan.descripcion}
                  onChange={(evento) =>
                    actualizarCampo('descripcion', evento.target.value)
                  }
                  placeholder="Describe qué se realizará y qué se espera conseguir..."
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
                  Guardar plan
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

// Componente reutilizable para las tarjetas superiores.
// Recibe sus textos, icono y color mediante props.
function TarjetaResumen({ titulo, valor, descripcion, icono: Icono, color }) {
  // Las clases se declaran completas para que Tailwind pueda detectarlas.
  const estilos = {
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
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
