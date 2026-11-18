import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, ShieldCheck, Info, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function Encuesta() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const campanaParam = searchParams.get('campana') || searchParams.get('surveyId');
  const areaParam = searchParams.get('area');

  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const cargarEncuesta = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get('v1/encuesta-publica/', {
          params: {
            token: token || undefined,
            campana: campanaParam || undefined,
            area: areaParam || undefined,
          },
        });
        setSurvey(data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            'No se pudo cargar la encuesta. Verifica que el enlace o código QR sea válido.'
        );
      } finally {
        setLoading(false);
      }
    };

    cargarEncuesta();
  }, [token, campanaParam, areaParam]);

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!survey || Object.keys(answers).length < survey.questions.length) {
      alert('Por favor responde todas las preguntas antes de enviar.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        token: token || undefined,
        campana_id: survey.campana_id,
        area_id: survey.area_id,
        respuestas: Object.entries(answers).map(([preguntaId, valor]) => ({
          pregunta_id: Number(preguntaId),
          valor: Number(valor),
        })),
      };

      await api.post('v1/encuesta-publica/responder/', payload);
      setIsSubmitted(true);
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          'Ocurrió un error al guardar tus respuestas. Intenta de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // PANTALLA DE CARGA
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-6 text-slate-600">
        <Loader2 className="animate-spin text-[#1E3A5F] mb-3" size={38} />
        <p className="text-sm font-semibold">Cargando cuestionario...</p>
      </div>
    );
  }

  // PANTALLA DE ENLACE INVÁLIDO O EXPIRADO
  if (error || !survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">Encuesta no disponible</h1>
          <p className="text-slate-600 mb-6 leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={() => (window.location.href = '/')}
            className="w-full py-3 bg-[#1E3A5F] text-white rounded-xl font-bold hover:bg-[#162c4a] transition-all shadow-lg"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // VISTA DE CONFIRMACIÓN POST-ENVÍO
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center animate-in zoom-in-95 duration-300 border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">¡Gracias por tu participación!</h1>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Tus respuestas para <strong>{survey.area_nombre}</strong> han sido registradas de forma{' '}
            <strong>100% anónima</strong>. La información será utilizada exclusivamente para
            mejorar el entorno laboral.
          </p>
          <button
            type="button"
            onClick={() => (window.location.href = '/')}
            className="w-full py-3 bg-[#1E3A5F] text-white rounded-xl font-bold hover:bg-[#162c4a] transition-all shadow-lg active:scale-95"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const totalPreguntas = survey.questions.length;
  const respondidas = Object.keys(answers).length;
  const completo = totalPreguntas > 0 && respondidas === totalPreguntas;

  // VISTA DEL CUESTIONARIO
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
          {survey.area_nombre} · Respuesta Anónima Garantizada
        </div>
      </header>

      {/* CONTENIDO CENTRAL */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* HEADER DEL CUESTIONARIO */}
          <div className="bg-[#1E3A5F] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 relative z-10">{survey.title}</h1>
            <p className="text-blue-100 relative z-10">{survey.description}</p>

            {/* Barra de progreso */}
            <div className="mt-6 h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-500 ease-out"
                style={{
                  width: `${totalPreguntas > 0 ? (respondidas / totalPreguntas) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-blue-200 mt-2 text-right">
              {respondidas} de {totalPreguntas} respondidas
            </p>
          </div>

          {/* AVISO LEGAL DE ANONIMATO */}
          <div className="bg-amber-50 border-b border-amber-100 px-8 py-4 flex gap-3 items-start">
            <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-amber-800 leading-snug">
              <strong>Importante:</strong> Este cuestionario no solicita ni almacena datos personales.
              Las respuestas se vinculan únicamente a tu área/departamento (
              <strong>{survey.area_nombre}</strong>) para fines estadísticos. Tu identidad permanece
              protegida bajo la Ley Federal de Protección de Datos.
            </p>
          </div>

          {/* PREGUNTAS */}
          <div className="p-8 space-y-8">
            {survey.questions.map((q, index) => (
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
                      type="button"
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

            {totalPreguntas === 0 && (
              <p className="text-center text-sm text-slate-500 py-8">
                Esta guía de referencia aún no tiene preguntas registradas en la base de datos.
              </p>
            )}
          </div>

          {/* FOOTER CON BOTÓN DE ENVÍO */}
          <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!completo || submitting}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg ${
                completo && !submitting
                  ? 'bg-[#1E3A5F] text-white hover:bg-[#162c4a] hover:shadow-xl active:scale-95'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              {submitting ? 'Guardando respuestas...' : 'Enviar Respuestas'}
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