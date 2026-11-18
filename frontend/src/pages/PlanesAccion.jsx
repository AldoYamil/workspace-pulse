import { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  CalendarDays,
  UserRound,
  X,
  Loader2,
} from 'lucide-react';
import api from '../api/axios';
import RecomendacionesIA from '../components/RecomendacionesIA';

const coloresEstado = {
  Pendiente: 'bg-amber-100 text-amber-700',
  'En Proceso': 'bg-blue-100 text-blue-700',
  Completada: 'bg-emerald-100 text-emerald-700',
};

export default function PlanesAccion() {
  const [planes, setPlanes] = useState([]);
  const [resumen, setResumen] = useState({ total: 0, Pendiente: 0, 'En Proceso': 0, Completada: 0 });
  const [usuarios, setUsuarios] = useState([]);
  const [areas, setAreas] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nuevoPlan, setNuevoPlan] = useState({
    titulo: '',
    descripcion_medida: '',
    fecha_compromiso: '',
    resultado_riesgo: '',
    area: '',
    usuario: '',
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      setError('');

      const [resPlanes, resUsuarios, resAreas] = await Promise.all([
        api.get('v1/planes-accion/'),
        api.get('v1/usuario/list/').catch(() => ({ data: [] })),
        api.get('v1/planes-accion/areas/').catch(() => ({ data: [] })),
      ]);

      setPlanes(resPlanes.data.planes || []);
      setResumen(
        resPlanes.data.resumen || { total: 0, Pendiente: 0, 'En Proceso': 0, Completada: 0 }
      );
      setUsuarios(Array.isArray(resUsuarios.data) ? resUsuarios.data : []);
      setAreas(Array.isArray(resAreas.data) ? resAreas.data : []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudieron sincronizar los datos con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const planesFiltrados = planes.filter((plan) => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda =
      plan.titulo.toLowerCase().includes(texto) ||
      (plan.area?.nombre && plan.area.nombre.toLowerCase().includes(texto)) ||
      (plan.responsable?.nombre && plan.responsable.nombre.toLowerCase().includes(texto));

    const coincideEstado = filtroEstado === 'Todos' || plan.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  function actualizarCampo(campo, valor) {
    setNuevoPlan((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function usarRecomendacion(recomendacion, resultadoRiesgoId, areaId = '') {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + (recomendacion.plazo_dias || 30));

    setNuevoPlan((anterior) => ({
      ...anterior,
      titulo: recomendacion.titulo,
      descripcion_medida: recomendacion.descripcion,
      fecha_compromiso: fecha.toLocaleDateString('en-CA'),
      resultado_riesgo: resultadoRiesgoId ? String(resultadoRiesgoId) : '',
      area: areaId ? String(areaId) : '',
    }));
    setMostrarFormulario(true);
  }

  async function crearPlan(evento) {
    evento.preventDefault();

    if (!nuevoPlan.titulo.trim() || !nuevoPlan.fecha_compromiso || (!nuevoPlan.resultado_riesgo && !nuevoPlan.area)) {
      alert('Por favor completa el título, fecha compromiso y el área o resultado de riesgo.');
      return;
    }

    const payload = {
      titulo: nuevoPlan.titulo.trim(),
      descripcion_medida: nuevoPlan.descripcion_medida.trim(),
      fecha_compromiso: nuevoPlan.fecha_compromiso,
    };
    if (nuevoPlan.resultado_riesgo) payload.resultado_riesgo = Number(nuevoPlan.resultado_riesgo);
    if (nuevoPlan.area) payload.area = Number(nuevoPlan.area);
    if (nuevoPlan.usuario) payload.usuario = Number(nuevoPlan.usuario);

    try {
      await api.post('v1/planes-accion/', payload);
      await cargarDatosIniciales();

      setNuevoPlan({
        titulo: '',
        descripcion_medida: '',
        fecha_compromiso: '',
        resultado_riesgo: '',
        area: '',
        usuario: '',
      });
      setMostrarFormulario(false);
    } catch (err) {
      const detalle = err.response?.data?.detail || JSON.stringify(err.response?.data || err.message);
      console.error('Error al guardar el plan:', err.response?.data || err);
      alert(`No se pudo guardar el plan: ${detalle}`);
    }
  }

  async function cambiarEstado(id, nuevoEstado) {
    try {
      const { data: planActualizado } = await api.patch(`v1/planes-accion/${id}/`, {
        estado: nuevoEstado,
      });

      const listaActualizada = planes.map((p) => (p.id === id ? planActualizado : p));
      setPlanes(listaActualizada);
      setResumen({
        total: listaActualizada.length,
        Pendiente: listaActualizada.filter((p) => p.estado === 'Pendiente').length,
        'En Proceso': listaActualizada.filter((p) => p.estado === 'En Proceso').length,
        Completada: listaActualizada.filter((p) => p.estado === 'Completada').length,
      });
    } catch (err) {
      console.error('Error al actualizar estado:', err.response?.data || err);
      alert('No se pudo actualizar el estado.');
    }
  }

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Loader2 className="mb-2 animate-spin text-[#1E3A5F]" size={36} />
        <p className="text-sm font-medium">Sincronizando base de datos...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Planes de acción</h1>
          <p className="text-base text-slate-300">
            Organiza acciones preventivas, asigna responsables y da seguimiento a las medidas de bienestar laboral.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMostrarFormulario(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#294d78]"
        >
          <Plus size={18} /> Nuevo plan
        </button>
      </section>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaResumen titulo="Total de planes" valor={resumen.total} descripcion="Registrados" icono={ClipboardCheck} color="blue" />
        <TarjetaResumen titulo="Pendientes" valor={resumen.Pendiente || 0} descripcion="Atención requerida" icono={Clock} color="amber" />
        <TarjetaResumen titulo="En proceso" valor={resumen['En Proceso'] || 0} descripcion="En ejecución" icono={AlertTriangle} color="indigo" />
        <TarjetaResumen titulo="Completadas" valor={resumen.Completada || 0} descripcion="Finalizados" icono={CheckCircle2} color="green" />
      </section>

      <RecomendacionesIA onUsar={usarRecomendacion} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="font-bold text-slate-800">Seguimiento de acciones</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar plan, área..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1E3A5F] sm:w-64"
              />
            </div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Pendiente">Pendientes</option>
              <option value="En Proceso">En proceso</option>
              <option value="Completada">Completadas</option>
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
                <th className="px-5 py-4 font-semibold">Riesgo / Área</th>
                <th className="px-5 py-4 font-semibold">Estado</th>
                <th className="px-5 py-4 font-semibold">Actualizar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {planesFiltrados.map((plan) => (
                <tr key={plan.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{plan.titulo}</p>
                    <p className="mt-1 text-xs text-slate-500">{plan.descripcion_medida}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <UserRound size={16} className="text-slate-400" />
                      {plan.responsable?.nombre || 'No asignado'}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays size={16} className="text-slate-400" />
                      {plan.fecha_compromiso}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1E3A5F]">
                      {plan.area?.nombre || 'General'} ({plan.resultado_riesgo?.nivel_riesgo || 'N/A'})
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${coloresEstado[plan.estado] || 'bg-slate-100 text-slate-600'}`}>
                      {plan.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={plan.estado}
                      onChange={(e) => cambiarEstado(plan.id, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-[#1E3A5F]"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Completada">Completada</option>
                    </select>
                  </td>
                </tr>
              ))}
              {planesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                    No se encontraron registros de planes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* FORMULARIO DE CREACIÓN */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <section className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h2 className="text-xl font-bold text-slate-900">Registrar plan de acción</h2>
              <button onClick={() => setMostrarFormulario(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={crearPlan} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Título del plan *</label>
                <input
                  required
                  maxLength={100}
                  value={nuevoPlan.titulo}
                  onChange={(e) => actualizarCampo('titulo', e.target.value)}
                  placeholder="Ej. Campaña de manejo de estrés"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Fecha compromiso *</label>
                  <input
                    required
                    type="date"
                    value={nuevoPlan.fecha_compromiso}
                    onChange={(e) => actualizarCampo('fecha_compromiso', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Responsable (opcional: por defecto tú)</label>
                  <select
                    value={nuevoPlan.usuario}
                    onChange={(e) => actualizarCampo('usuario', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                  >
                    <option value="">Asignarme a mí</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Área evaluada *</label>
                {nuevoPlan.resultado_riesgo ? (
                  <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-[#1E3A5F]">
                    <span>Vinculado al resultado de riesgo #{nuevoPlan.resultado_riesgo}</span>
                    <button
                      type="button"
                      onClick={() => actualizarCampo('resultado_riesgo', '')}
                      className="text-xs font-semibold underline"
                    >
                      Cambiar área
                    </button>
                  </div>
                ) : (
                  <select
                    required
                    value={nuevoPlan.area}
                    onChange={(e) => actualizarCampo('area', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                  >
                    <option value="">Selecciona un área</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.centro_trabajo?.nombre ? `${a.centro_trabajo.nombre} — ` : ''}{a.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Descripción de la medida *</label>
                <textarea
                  required
                  rows={3}
                  value={nuevoPlan.descripcion_medida}
                  onChange={(e) => actualizarCampo('descripcion_medida', e.target.value)}
                  placeholder="Detalles sobre la implementación..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setMostrarFormulario(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit" className="rounded-xl bg-[#1E3A5F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#294d78]">
                  Guardar en BD
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function TarjetaResumen({ titulo, valor, descripcion, icono: Icono, color }) {
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