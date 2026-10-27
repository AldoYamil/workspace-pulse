// src/pages/CuestionarioActivo.jsx

import { useState } from 'react';

export default function CuestionarioActivo() {
  // Preguntas de ejemplo basadas en la NOM-035 (Clima Laboral y Factores Psicosociales)
  const preguntas = [
    {
      id: 1,
      categoria: "Ambiente de Trabajo",
      pregunta: "El espacio en el que trabajo me permite realizar mis actividades de manera segura y eficiente.",
    },
    {
      id: 2,
      categoria: "Organización del Tiempo",
      pregunta: "Considero que tengo la cantidad de trabajo adecuada para el tiempo de mi jornada laboral.",
    },
    {
      id: 3,
      categoria: "Liderazgo y Apoyo",
      pregunta: "Mi jefe inmediato se comunica de forma clara y me brinda apoyo cuando lo necesito.",
    },
    {
      id: 4,
      categoria: "Clima Laboral",
      pregunta: "Existe un ambiente de respeto y colaboración entre mis compañeras y compañeros de trabajo.",
    },
    {
      id: 5,
      categoria: "Reconocimiento",
      pregunta: "Se reconoce el esfuerzo y la dedicación en el desempeño de mis responsabilidades.",
    }
  ];

  // Opciones de respuesta estándar (Escala Likert NOM-035)
  const opcionesRespuesta = [
    { valor: 1, etiqueta: "Nunca" },
    { valor: 2, etiqueta: "Casi nunca" },
    { valor: 3, etiqueta: "Algunas veces" },
    { valor: 4, etiqueta: "Casi siempre" },
    { valor: 5, etiqueta: "Siempre" },
  ];

  const [indiceActual, setIndiceActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [enviado, setEnviado] = useState(false);

  // Manejar la selección de una opción
  const handleSeleccion = (idPregunta, valor) => {
    setRespuestas({
      ...respuestas,
      [idPregunta]: valor
    });
  };

  // Avanzar a la siguiente pregunta
  const handleSiguiente = () => {
    if (indiceActual < preguntas.length - 1) {
      setIndiceActual(indiceActual + 1);
    }
  };

  // Retroceder a la pregunta anterior
  const handleAnterior = () => {
    if (indiceActual > 0) {
      setIndiceActual(indiceActual - 1);
    }
  };

  // Enviar el cuestionario completo
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Respuestas enviadas (Anónimo):', respuestas);
    setEnviado(true);
  };

  const preguntaActual = preguntas[indiceActual];
  const porcentajeProgreso = Math.round(((indiceActual + 1) / preguntas.length) * 100);
  const respuestaActualSeleccionada = respuestas[preguntaActual.id];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1E3A5F] to-slate-900 px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">

        {/* HEADER */}
        <div className="px-8 pt-10 pb-6 text-center border-b border-slate-100">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold text-[#1E3A5F] bg-blue-50 rounded-full">
            Cuestionario Anónimo · NOM-035
          </span>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">
            WorkSpace Pulse
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Evaluación de Clima Laboral y Factores Psicosociales
          </p>

          {!enviado && (
            <div className="mt-6">
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>Pregunta {indiceActual + 1} de {preguntas.length}</span>
                <span>{porcentajeProgreso}% completado</span>
              </div>
              {/* Barra de progreso */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#1E3A5F] h-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${porcentajeProgreso}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {!enviado ? (
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
            
            {/* BLOQUE DE PREGUNTA */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {preguntaActual.categoria}
              </span>
              <h2 className="text-xl font-bold text-[#1E293B] leading-snug">
                {preguntaActual.pregunta}
              </h2>
            </div>

            {/* OPCIONES DE RESPUESTA */}
            <div className="space-y-3">
              {opcionesRespuesta.map((opcion) => {
                const seleccionada = respuestaActualSeleccionada === opcion.valor;
                return (
                  <label
                    key={opcion.valor}
                    onClick={() => handleSeleccion(preguntaActual.id, opcion.valor)}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                      seleccionada 
                        ? 'border-[#1E3A5F] bg-blue-50/60 shadow-sm' 
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                    }`}
                  >
                    <span className={`text-sm font-medium ${seleccionada ? 'text-[#1E3A5F] font-semibold' : 'text-slate-700'}`}>
                      {opcion.etiqueta}
                    </span>
                    <input
                      type="radio"
                      name={`pregunta-${preguntaActual.id}`}
                      checked={seleccionada}
                      onChange={() => handleSeleccion(preguntaActual.id, opcion.valor)}
                      className="w-4 h-4 accent-[#1E3A5F] cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            {/* BOTONES DE NAVEGACIÓN */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleAnterior}
                disabled={indiceActual === 0}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  indiceActual === 0 
                    ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100' 
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Anterior
              </button>

              {indiceActual < preguntas.length - 1 ? (
                <button
                  type="button"
                  onClick={handleSiguiente}
                  disabled={!respuestaActualSeleccionada}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md ${
                    !respuestaActualSeleccionada 
                      ? 'opacity-50 cursor-not-allowed bg-slate-400' 
                      : 'bg-[#1E3A5F] hover:bg-[#172A47] hover:shadow-lg'
                  }`}
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!respuestaActualSeleccionada}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md ${
                    !respuestaActualSeleccionada 
                      ? 'opacity-50 cursor-not-allowed bg-slate-400' 
                      : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'
                  }`}
                >
                  Finalizar y Enviar
                </button>
              )}
            </div>

          </form>
        ) : (
          /* PANTALLA DE AGRADECIMIENTO ANÓNIMO */
          <div className="px-8 py-12 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">
              ✓
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#1E293B]">
                ¡Cuestionario enviado con éxito!
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Tus respuestas han sido registradas de forma totalmente anónima. Agradecemos tu participación para mejorar el entorno laboral de la organización.
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => {
                  setIndiceActual(0);
                  setRespuestas({});
                  setEnviado(false);
                }}
                className="text-xs font-semibold text-[#1E3A5F] hover:underline"
              >
                Responder de nuevo (Modo Demostración)
              </button>
            </div>
          </div>
        )}

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