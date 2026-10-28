// src/components/SurveyCard.jsx
export default function SurveyCard({ title, type, dueDate, isCompleted, onRespond }) {
  // Colores según tipo de encuesta (alineado a paleta corporativa)
  const typeColors = {
    'NOM-035': 'border-l-[#1E3A5F] bg-blue-50',
    'Clima Laboral': 'border-l-[#10B981] bg-emerald-50',
    'Cultura Organizacional': 'border-l-[#8B5CF6] bg-violet-50',
  };

  const borderColor = typeColors[type] || 'border-l-slate-300 bg-slate-50';

  return (
    <div className={`relative p-5 rounded-xl border border-slate-200 ${borderColor} 
                    transition-all duration-200 hover:shadow-md`}>
      
      {/* Indicador de Completado */}
      {isCompleted && (
        <span className="absolute top-3 right-3 text-xs font-bold text-emerald-600 
                         bg-emerald-100 px-2 py-1 rounded-full flex items-center gap-1">
          ✓ Completada
        </span>
      )}

      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-4">{type} · Vence: {dueDate}</p>

      <button
        onClick={onRespond}
        disabled={isCompleted}
        className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all
                   ${isCompleted 
                     ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                     : 'bg-[#1E3A5F] hover:bg-[#172A47] text-white shadow-sm hover:shadow'}`}
      >
        {isCompleted ? 'Ver resultados' : 'Responder encuesta'}
      </button>
    </div>
  );
}