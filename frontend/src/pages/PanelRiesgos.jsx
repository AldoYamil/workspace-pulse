
import { useState } from 'react';

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Download,
  Filter,
  ShieldAlert,
  Users,
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ============================================================
// POR LO MIENTRAS XD: DATOS FALSOS PARA LAS GRÁFICAS
// ============================================================
// Estos datos solamente sirven para visualizar la interfaz.
// DESPUÉS: obtener estos datos desde los endpoints del backend.
// El backend consultará la base de datos y devolverá los resultados.
//
// IMPORTANTE:
// Los porcentajes son ejemplos, NO resultados reales de la NOM-035.

const tendencias = [
  { periodo: 'Ene', riesgo: 32, estres: 25 },
  { periodo: 'Feb', riesgo: 38, estres: 30 },
  { periodo: 'Mar', riesgo: 35, estres: 28 },
  { periodo: 'Abr', riesgo: 45, estres: 37 },
  { periodo: 'May', riesgo: 41, estres: 33 },
  { periodo: 'Jun', riesgo: 52, estres: 43 },
];

const factores = [
  { nombre: 'Carga de trabajo', valor: 76 },
  { nombre: 'Jornada laboral', valor: 62 },
  { nombre: 'Liderazgo', valor: 48 },
  { nombre: 'Relaciones', valor: 35 },
  { nombre: 'Reconocimiento', valor: 57 },
];

const nivelesRiesgo = [
  { nombre: 'Bajo', valor: 45, color: '#16a34a' },
  { nombre: 'Medio', valor: 35, color: '#f59e0b' },
  { nombre: 'Alto', valor: 20, color: '#dc2626' },
];

const departamentos = [
  { nombre: 'Producción', riesgo: 72 },
  { nombre: 'Recursos Humanos', riesgo: 28 },
  { nombre: 'Ventas', riesgo: 55 },
  { nombre: 'Logística', riesgo: 64 },
];

// POR LO MIENTRAS XD:
// Estas sedes están escritas manualmente.
// DESPUÉS: obtenerlas desde el catálogo de centros de trabajo
// registrado en la base de datos.
const sedes = [
  'Todas las sedes',
  'Sede principal',
  'Sucursal norte',
];

const periodos = [
  { label: 'Últimos 6 meses', value: '6' },
  { label: 'Últimos 3 meses', value: '3' },
  { label: 'Último mes', value: '1' },
];

// ============================================================
// COMPONENTE REUTILIZABLE: TARJETA DE INDICADOR
// ============================================================
// Este componente SÍ se puede conservar al conectar el backend.
// Recibe los valores mediante props y muestra la información.
// No consulta la base de datos por sí mismo.

function TarjetaIndicador({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  color,
  tendencia,
  positivo,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {titulo}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-800">
            {valor}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icono size={22} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        {tendencia && (
          <span
            className={`flex items-center gap-1 font-semibold ${
              positivo ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {positivo ? (
              <ArrowDownRight size={15} />
            ) : (
              <ArrowUpRight size={15} />
            )}

            {tendencia}
          </span>
        )}

        <span className="text-slate-500">{descripcion}</span>
      </div>
    </article>
  );
}

// ============================================================
// COMPONENTE REUTILIZABLE: CONTENEDOR DE GRÁFICA
// ============================================================
// Este componente solo organiza visualmente el título,
// la descripción y el contenido de cada gráfica.
// Se puede conservar después de conectar la API.

function TarjetaGrafica({ titulo, descripcion, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-bold text-slate-800">{titulo}</h2>

        <p className="mt-1 text-sm text-slate-500">
          {descripcion}
        </p>
      </div>

      {children}
    </section>
  );
}

// ============================================================
// PANTALLA PRINCIPAL
// ============================================================

export default function PanelRiesgos() {
  // POR LO MIENTRAS XD:
  // Estos estados almacenan los filtros seleccionados en React.
  // DESPUÉS: enviar sus valores a la API para consultar los datos
  // reales de la sede, el periodo y el departamento seleccionados.

  const [periodo, setPeriodo] = useState('6');
  const [departamento, setDepartamento] = useState('Todos');
  const [sede, setSede] = useState('Todas las sedes');

  // POR LO MIENTRAS XD:
  // Filtramos los datos simulados directamente en el frontend.
  // DESPUÉS: sustituir esta lógica por la respuesta del backend.
  // Por ejemplo, GET /api/riesgos/tendencias?meses=6

  const datosTendencia =
    periodo === '1'
      ? tendencias.slice(-1)
      : periodo === '3'
        ? tendencias.slice(-3)
        : tendencias;

  // POR LO MIENTRAS XD:
  // Este filtro usa un arreglo local de departamentos.
  // DESPUÉS: filtrar por el ID real del departamento en la API.

  const departamentosVisibles =
    departamento === 'Todos'
      ? departamentos
      : departamentos.filter(
          (item) => item.nombre === departamento,
        );

  // POR LO MIENTRAS XD:
  // Ajustamos artificialmente los valores según el departamento.
  // DESPUÉS: recibir los índices calculados por el backend.
  // No utilizar esta fórmula como cálculo oficial de riesgo.

  const factoresVisibles =
    departamento === 'Todos'
      ? factores
      : factores.map((factor) => ({
          ...factor,
          valor: Math.max(
            10,
            Math.min(
              95,
              factor.valor +
                (departamentos.find(
                  (item) => item.nombre === departamento,
                )?.riesgo ?? 50) -
                50,
            ),
          ),
        }));

  // POR LO MIENTRAS XD:
  // Calculamos un promedio usando los datos simulados.
  // DESPUÉS: obtener el indicador calculado desde el backend.
  // El cálculo real dependerá de cómo definan el índice de riesgo.

  const promedioRiesgo =
    departamentosVisibles.length > 0
      ? Math.round(
          departamentosVisibles.reduce(
            (total, item) => total + item.riesgo,
            0,
          ) / departamentosVisibles.length,
        )
      : 0;

  // ==========================================================
  // EXPORTACIÓN TEMPORAL
  // ==========================================================
  // POR LO MIENTRAS XD:
  // Este botón descarga un archivo TXT con datos de ejemplo.
  // DESPUÉS:
  // 1. Crear el reporte con datos reales.
  // 2. Implementar jsPDF + html2canvas.
  // 3. Consultar el backend para recuperar los datos autorizados.
  //
  // IMPORTANTE: esta función NO genera un PDF oficial.

  function exportarResumen() {
    const contenido = [
      'WORKSPACE PULSE - RESUMEN ANALITICO DE RIESGOS',
      `Periodo seleccionado: ${periodo} mes(es)`,
      `Sede seleccionada: ${sede}`,
      `Departamento: ${departamento}`,
      `Nivel de riesgo promedio: ${promedioRiesgo}%`,
      '',
      'ADVERTENCIA: DATOS DE DEMOSTRACION.',
      'Este archivo no contiene resultados reales de evaluaciones.',
      '',
      'Riesgo por departamento:',
      ...departamentosVisibles.map(
        (item) => `${item.nombre}: ${item.riesgo}%`,
      ),
    ].join('\n');

    const archivo = new Blob(['\uFEFF', contenido], {
      type: 'text/plain;charset=utf-8;',
    });

    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = 'resumen-riesgos.txt';
    enlace.click();

    URL.revokeObjectURL(url);
  }

  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">

      {/* ENCABEZADO */}

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Activity size={17} />
            <span>Análisis organizacional</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Panel de riesgos psicosociales
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Analiza los factores de riesgo, identifica tendencias
            y detecta las áreas que requieren atención prioritaria.
          </p>
        </div>

        <button
          type="button"
          onClick={exportarResumen}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <Download size={17} />
          Exportar resumen
        </button>
      </header>
      {/* FILTROS */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-slate-600" />

          <h2 className="font-semibold text-slate-800">
            Filtros de análisis
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* FILTRO DE PERIODO */}

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
              <CalendarDays size={16} />
              Periodo
            </span>

            <select
              value={periodo}
              onChange={(event) => setPeriodo(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {periodos.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {/* FILTRO DE SEDE */}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              Centro de trabajo
            </span>

            <select
              value={sede}
              onChange={(event) => setSede(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {sedes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* PENDIENTE:
                El filtro de sede todavía no filtra las gráficas.
                Cuando exista el endpoint, enviar el ID de la sede
                seleccionada y actualizar los datos recibidos. */}
          </label>

          {/* FILTRO DE DEPARTAMENTO */}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              Departamento
            </span>

            <select
              value={departamento}
              onChange={(event) => setDepartamento(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Todos">Todos los departamentos</option>

              {departamentos.map((item) => (
                <option key={item.nombre} value={item.nombre}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>

        </div>
      </section>

      {/* INDICADORES PRINCIPALES */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <TarjetaIndicador
          titulo="Riesgo promedio"
          valor={`${promedioRiesgo}%`}
          descripcion="Índice ilustrativo"
          icono={Activity}
          color="bg-blue-50 text-blue-700"
        />

        <TarjetaIndicador
          titulo="Nivel alto"
          valor="20%"
          descripcion="Distribución simulada"
          icono={ShieldAlert}
          color="bg-red-50 text-red-700"
          tendencia="5%"
          positivo={false}
        />

        <TarjetaIndicador
          titulo="Factores evaluados"
          valor={factores.length}
          descripcion="Categorías de ejemplo"
          icono={CheckCircle2}
          color="bg-emerald-50 text-emerald-700"
        />

        <TarjetaIndicador
          titulo="Departamentos"
          valor={departamentosVisibles.length}
          descripcion="En la selección actual"
          icono={Users}
          color="bg-violet-50 text-violet-700"
        />

        {/* PENDIENT:
            Revisar cada indicador.
            Cuando conectemos la API, sustituir los valores simulados
            por los campos reales que devuelva el backend. */}

      </section>

      {/* GRAFICAS DE TENDENCIA Y DISTRIBUCION */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* GRAFICA DE LINEAS */}

        <div className="xl:col-span-2">
          <TarjetaGrafica
            titulo="Tendencia de riesgo psicosocial"
            descripcion="Evolución mensual de los índices de riesgo y estrés"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={datosTendencia}
                  margin={{
                    top: 10,
                    right: 12,
                    left: -15,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="periodo"
                    tick={{ fontSize: 12 }}
                    stroke="#94a3b8"
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    stroke="#94a3b8"
                  />

                  <Tooltip
                    formatter={(value) => [`${value}%`]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                    }}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="riesgo"
                    name="Riesgo"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="estres"
                    name="Estrés"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* POR LO MIENTRAS:
                datosTendencia procede del arreglo tendencias.
                DESPUÉS: obtener la serie temporal del backend,
                aplicando los filtros de fecha, sede y departamento. */}

          </TarjetaGrafica>
        </div>

        {/* GRAFICA DE DONA */}

        <TarjetaGrafica
          titulo="Distribución de riesgo"
          descripcion="Porcentaje por nivel"
        >
          <div className="relative h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nivelesRiesgo}
                  dataKey="valor"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  stroke="none"
                >
                  {nivelesRiesgo.map((item) => (
                    <Cell
                      key={item.nombre}
                      fill={item.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => [`${value}%`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {nivelesRiesgo.map((item) => (
              <div
                key={item.nombre}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-slate-600">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />

                  {item.nombre}
                </span>

                <span className="font-semibold text-slate-800">
                  {item.valor}%
                </span>
              </div>
            ))}
          </div>

          {/* POR AHORA EH:
              La distribución de niveles es fija y simulada.
              DESPUÉS: recibir los porcentajes calculados por el backend
              usando las evaluaciones válidas del periodo seleccionado. */}

        </TarjetaGrafica>

      </section>

      {/* GRAFICAS COMPARATIVAS */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* RIESGO POR DEPARTAMENTO */}

        <TarjetaGrafica
          titulo="Riesgo por departamento"
          descripcion="Comparación de los índices de riesgo"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departamentosVisibles}
                layout="vertical"
                margin={{
                  top: 0,
                  right: 20,
                  left: 15,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                />

                <YAxis
                  type="category"
                  dataKey="nombre"
                  width={115}
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                />

                <Tooltip
                  formatter={(value) => [`${value}%`, 'Riesgo']}
                />

                <Bar
                  dataKey="riesgo"
                  name="Riesgo"
                  fill="#3b82f6"
                  radius={[0, 6, 6, 0]}
                  barSize={26}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PENDIENTE:
              Reemplazar departamentosVisibles por los resultados
              de la API de análisis por departamento. */}

        </TarjetaGrafica>

        {/* FACTORES DE RIESGO */}

        <TarjetaGrafica
          titulo="Factores de riesgo"
          descripcion="Índice ilustrativo por factor evaluado"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={factoresVisibles}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 30,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="nombre"
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={65}
                  tick={{ fontSize: 10 }}
                  stroke="#94a3b8"
                />

                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                />

                <Tooltip
                  formatter={(value) => [`${value}%`, 'Índice']}
                />

                <Bar
                  dataKey="valor"
                  name="Índice"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PENDIENTE:
              Los factores deben corresponder a las dimensiones
              realmente evaluadas en los cuestionarios del proyecto.
              DESPUÉS: recibirlos del endpoint de análisis de factores. */}

        </TarjetaGrafica>

      </section>

      {/* TABLA DE AREAS PRIORITARIAS */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold text-slate-800">
            Áreas que requieren seguimiento
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Referencia visual para priorizar futuras medidas preventivas.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">
                  Departamento
                </th>

                <th className="px-5 py-4 font-semibold">
                  Índice
                </th>

                <th className="px-5 py-4 font-semibold">
                  Nivel ilustrativo
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {[...departamentosVisibles]
                .sort((a, b) => b.riesgo - a.riesgo)
                .map((item) => {
                  // POR LO MIENTRAS:
                  // Estas condiciones clasifican índices de ejemplo.
                  // DESPUÉS: usar los criterios aprobados para el indicador
                  // que corresponda. No equivalen automáticamente a una
                  // clasificación oficial de la NOM-035.

                  const nivel =
                    item.riesgo >= 60
                      ? {
                          texto: 'Alto',
                          estilo: 'bg-red-50 text-red-700',
                        }
                      : item.riesgo >= 40
                        ? {
                            texto: 'Medio',
                            estilo: 'bg-amber-50 text-amber-700',
                          }
                        : {
                            texto: 'Bajo',
                            estilo: 'bg-emerald-50 text-emerald-700',
                          };

                  return (
                    <tr
                      key={item.nombre}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {item.nombre}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.riesgo}%
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${nivel.estilo}`}
                        >
                          {nivel.texto}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>

          </table>
        </div>

        {/* Aun no esta:
            Cuando tengamos el backend, esta tabla utilizará
            los datos reales y los permisos del usuario autenticado. */}

      </section>

    </main>
  );
}
