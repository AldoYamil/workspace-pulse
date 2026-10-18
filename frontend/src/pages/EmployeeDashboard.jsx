// src/pages/EmployeeDashboard.jsx
import { useState } from 'react';
import SurveyCard from '../components/SurveyCard';

// Datos mock (simulando respuesta del backend RF04/RF05)
const MOCK_ASSIGNED_SURVEYS = [
  { id: 1, title: 'Guía de Referencia I - NOM-035', type: 'NOM-035', dueDate: '15 Oct 2026', isCompleted: false },
  { id: 2, title: 'Encuesta de Clima Laboral Q4', type: 'Clima Laboral', dueDate: '20 Oct 2026', isCompleted: true },
  { id: 3, title: 'Evaluación de Cultura Organizacional', type: 'Cultura Organizacional', dueDate: '30 Oct 2026', isCompleted: false },
];

export default function EmployeeDashboard() {
  const [surveys, setSurveys] = useState(MOCK_ASSIGNED_SURVEYS);
  const completedCount = surveys.filter(s => s.isCompleted).length;

  const handleRespond = (surveyId) => {
    // TODO: Redirigir a pantalla de cuestionario (RF04)
    console.log(`Iniciando encuesta ID: ${surveyId}`);
    // window.location.href = `/survey/${surveyId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1E3A5F] to-slate-900 px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* HEADER CON MENSAJE DE ANONIMATO */}
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center border border-slate-100">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 
                          px-4 py-2 rounded-full text-sm font-bold mb-4 border border-emerald-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Tus respuestas son 100% anónimas y confidenciales
          </div>
          
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Hola, colaborador 
          </h1>
          <p className="text-slate-500 mb-6">
            Tienes <span className="font-bold text-[#1E3A5F]">{surveys.length - completedCount}</span> evaluaciones pendientes
          </p>

          {/* BARRA DE PROGRESO PERSONAL */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
            <div 
              className="bg-[#1E3A5F] h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${(completedCount / surveys.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 text-right">
            {completedCount} de {surveys.length} completadas
          </p>
        </div>

        {/* LISTA DE ENCUESTAS ASIGNADAS */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white/90 px-2">Tus evaluaciones asignadas</h2>
          {surveys.map((survey) => (
            <SurveyCard 
              key={survey.id}
              {...survey}
              onRespond={() => handleRespond(survey.id)}
            />
          ))}
        </div>

        {/* FOOTER LEGAL (Consistente con Login) */}
        <div className="text-center pt-4">
          <p className="text-xs text-slate-400/70">
            © 2026 WorkSpace Pulse · Cumplimiento NOM-035-STPS-2018
          </p>
        </div>

      </div>
    </div>
  );
}