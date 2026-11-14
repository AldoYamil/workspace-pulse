//para entrar a esta pantalla es con la url: http://localhost:5173/encuesta?surveyId=12345
// src/pages/Encuesta.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook para navegación
import { Send, ShieldCheck, Info } from 'lucide-react';

// Datos simulados de la encuesta asignada (vendrían de Diego vía URL params o API)
const SURVEY_DATA = {
  title: 'Guía de Referencia I - NOM-035',
  description: 'Cuestionario para identificar factores de riesgo psicosocial en tu entorno laboral.',
  questions: [
    { id: 1, text: '¿Cuenta con el tiempo suficiente para realizar su trabajo?' },
    { id: 2, text: '¿Se siente presionado por exigencias de tiempo en su trabajo?' },
    { id: 3, text: '¿Su jefe le da a conocer sus objetivos de trabajo?' },
    { id: 4, text: '¿Recibe ayuda de sus compañeros cuando la necesita?' },
    { id: 5, text: '¿Siente que su trabajo afecta su vida personal o familiar?' }
  ]
};

export default function Encuesta() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    // Validación simple: todas respondidas
    if (Object.keys(answers).length < SURVEY_DATA.questions.length) {
      alert('Por favor responde todas las preguntas antes de enviar.');
      return;
    }
    
    // Aquí iría la llamada al backend de Diego para guardar anónimamente
    console.log('Respuestas anónimas enviadas:', answers);
    
    // Redirección a la pantalla de confirmación separada
    navigate('/encuesta-finalizada');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      
      {/* BARRA SUPERIOR MINIMALISTA */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1E3A5F] rounded-lg flex items-center justify-center text-white">
            <ShieldCheck size={18} />
          </div>
          <span className="font-bold text-slate-800 tracking-tight">WorkSpace Pulse</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <ShieldCheck size={14} />
          Respuesta Anónima Garantizada
        </div>
      </header>

      {/* CONTENIDO CENTRAL */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* HEADER DEL CUESTIONARIO */}
          <div className="bg-[#1E3A5F] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 relative z-10">{SURVEY_DATA.title}</h1>
            <p className="text-blue-100 relative z-10">{SURVEY_DATA.description}</p>
            
            {/* Barra de progreso */}
            <div className="mt-6 h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 transition-all duration-500 ease-out"
                style={{ width: `${(Object.keys(answers).length / SURVEY_DATA.questions.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-200 mt-2 text-right">
              {Object.keys(answers).length} de {SURVEY_DATA.questions.length} respondidas
            </p>
          </div>

          {/* AVISO LEGAL DE ANONIMATO */}
          <div className="bg-amber-50 border-b border-amber-100 px-8 py-4 flex gap-3 items-start">
            <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-amber-800 leading-snug">
              <strong>Importante:</strong> Este cuestionario no solicita ni almacena datos personales. 
              Las respuestas se vinculan únicamente a tu área/departamento para fines estadísticos. 
              Tu identidad permanece protegida bajo la Ley Federal de Protección de Datos.
            </p>
          </div>

          {/* PREGUNTAS */}
          <div className="p-8 space-y-8">
            {SURVEY_DATA.questions.map((q, index) => (
              <div key={q.id} className="space-y-4 group">
                <div className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-sm group-hover:bg-[#1E3A5F] group-hover:text-white transition-colors">
                    {index + 1}
                  </span>
                  <p className="text-slate-800 font-semibold text-lg pt-1">{q.text}</p>
                </div>

                {/* ESCALA LIKERT 1-5 */}
                <div className="grid grid-cols-5 gap-2 ml-12">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleAnswer(q.id, val)}
                      className={`py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                        answers[q.id] === val
                          ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-md scale-105'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-[#1E3A5F]/40 hover:bg-slate-50'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                
                {/* Etiquetas de la escala */}
                <div className="flex justify-between ml-12 px-2 text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                  <span>Nunca</span>
                  <span>Casi nunca</span>
                  <span>A veces</span>
                  <span>Casi siempre</span>
                  <span>Siempre</span>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER CON BOTÓN DE ENVÍO */}
          <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < SURVEY_DATA.questions.length}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg ${
                Object.keys(answers).length === SURVEY_DATA.questions.length
                  ? 'bg-[#1E3A5F] text-white hover:bg-[#162c4a] hover:shadow-xl active:scale-95'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send size={20} />
              Enviar Respuestas
            </button>
          </div>

        </div>
      </main>

      {/* FOOTER LEGAL MINIMALISTA */}
      <footer className="py-6 text-center text-xs text-slate-400">
        © 2026 WorkSpace Pulse · Cumplimiento NOM-035-STPS-2018 · Datos cifrados y anonimizados
      </footer>
    </div>
  );
}