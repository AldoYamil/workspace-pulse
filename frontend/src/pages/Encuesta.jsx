// src/pages/Encuesta.jsx
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, ShieldCheck, Info, AlertCircle, Loader2, Activity } from 'lucide-react';
import { encuestaService } from '../services/encuestaService';

export default function Encuesta() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const guiaParam = searchParams.get('guia');
  const campanaParam = searchParams.get('campana') || searchParams.get('surveyId');
  const areaParam = searchParams.get('area');
  const [paseAnonimo, setPaseAnonimo] = useState(null);
  const [correoVerificacion, setCorreoVerificacion] = useState('');
  const [verificandoDominio, setVerificandoDominio] = useState(false);
  const [errorDominio, setErrorDominio] = useState('');

  // Respaldo: si la URL viene solo con ?token=..., recupera la guía vinculada al crear el QR
  const savedMeta = useMemo(() => {
    if (!token) return {};
    try {
      const map = JSON.parse(localStorage.getItem('wp_qr_encuestas') || '{}');
      return map[token] || {};
    } catch {
      return {};
    }
  }, [token]);

  const guiaFinal = guiaParam || savedMeta.guiaId || undefined;
  const campanaFinal = campanaParam || savedMeta.campanaId || undefined;
  const areaFinal = areaParam || savedMeta.areaId || undefined;

  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!paseAnonimo) return;

    const cargarEncuesta = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await encuestaService.getEncuestaPublica({
          token: token || undefined,
          guia: guiaFinal,
          campana: campanaFinal,
          area: areaFinal,
        });
        setSurvey(data);
      } catch (err) {
        const errData = err.response?.data;
        setError(
          errData?.detail ||
            (typeof errData === 'string' ? errData : null) ||
            'No se pudo cargar la encuesta. Verifica que el enlace o código QR sea válido.'
        );
      } finally {
        setLoading(false);
      }
    };

    cargarEncuesta();
  }, [paseAnonimo, token, guiaFinal, campanaFinal, areaFinal]);

  const handleVerificarDominio = async (e) => {
    e.preventDefault();
    setErrorDominio('');
    if (!token) {
      setErrorDominio('El enlace o código QR no contiene un token válido.');
      return;
    }
    setVerificandoDominio(true);
    try {
      const res = await encuestaService.validarDominioEncuesta({
        token,
        correo: correoVerificacion,
      });
      setCorreoVerificacion('');
      setPaseAnonimo(res.pase_anonimo);
    } catch (err) {
      setErrorDominio(
        err.response?.data?.detail ||
          'No se pudo validar el dominio de tu correo institucional.'
      );
    } finally {
      setVerificandoDominio(false);
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!survey || Object.keys(answers).length < survey.questions.length) {
      alert('Por favor responde todas las preguntas antes de enviar.');
      return;
    }

    setSubmitting(true);
    const payload = {
      pase_anonimo: paseAnonimo,
      token: token || undefined,
      guia_id: survey.guia_id || guiaFinal,
      campana_id: survey.campana_id,
      area_id: survey.area_id,
      respuestas: Object.entries(answers).map(([preguntaId, valor]) => ({
        pregunta_id: Number(preguntaId),
        valor: Number(valor),
      })),
    };

    try {
      await encuestaService.responderEncuestaPublica(payload);
      setPaseAnonimo(null);
      setIsSubmitted(true);
    } catch (err) {
      const errData = err.response?.data;
      alert(
        errData?.detail ||
          (typeof errData === 'string' ? errData : null) ||
          'Ocurrió un error al guardar tus respuestas. Intenta de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // PANTALLA PREVIA: VERIFICACIÓN DE DOMINIO SIN ALMACENAR CORREO
  if (!paseAnonimo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 max-w-md w-full border border-slate-100">
          <div className="w-16 h-16 bg-[#1E3A5F] rounded-2xl flex items-center justify-center text-white mb-6 shadow-md">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Verificación de acceso NOM-035
          </h1>
          <p className="text-sm text-slate-600 mb-5 leading-relaxed">
            Ingresa tu correo institucional para confirmar que perteneces a la empresa antes de responder.
          </p>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex gap-3 items-start">
            <Info className="text-emerald-700 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-emerald-900 leading-relaxed">
              <strong>Anonimato garantizado:</strong> Tu correo solo verifica el dominio corporativo y{' '}
              <strong>no se guarda ni se vincula</strong> con tus respuestas.
            </p>
          </div>

          <form onSubmit={handleVerificarDominio} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo institucional
              </label>
              <input
                type="email"
                required
                value={correoVerificacion}
                onChange={(e) => setCorreoVerificacion(e.target.value)}
                placeholder="colaborador@tuempresa.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
            </div>

            {errorDominio && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorDominio}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={verificandoDominio}
              className="w-full py-3.5 bg-[#1E3A5F] text-white rounded-xl font-bold text-sm hover:bg-[#162c4a] transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {verificandoDominio && <Loader2 size={18} className="animate-spin" />}
              {verificandoDominio ? 'Validando dominio...' : 'Continuar de forma anónima'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  //PANTALLA LOADING...
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

  const totalPreguntas = survey.questions?.length || 0;
  const respondidas = Object.keys(answers).length;
  const completo = totalPreguntas > 0 && respondidas === totalPreguntas;

  // VISTA DEL CUESTIONARIO
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1E3A5F] rounded-xl flex items-center justify-center text-white shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800 tracking-tight text-lg">WorkSpace Pulse</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <ShieldCheck size={14} />
          {survey.area_nombre} · Respuesta Anónima Garantizada
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#1E3A5F] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 relative z-10">{survey.title}</h1>
            <p className="text-blue-100 relative z-10">{survey.description}</p>

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

          <div className="bg-amber-50 border-b border-amber-100 px-8 py-4 flex gap-3 items-start">
            <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-amber-800 leading-snug">
              <strong>Importante:</strong> Este cuestionario no solicita ni almacena datos personales.
              Las respuestas se vinculan únicamente a tu área/departamento (
              <strong>{survey.area_nombre}</strong>) para fines estadísticos. Tu identidad permanece
              protegida bajo la Ley Federal de Protección de Datos.
            </p>
          </div>

          <div className="p-8 space-y-8">
            {survey.questions.map((q, index) => (
              <div key={q.id} className="space-y-4 group">
                <div className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-sm group-hover:bg-[#1E3A5F] group-hover:text-white transition-colors">
                    {index + 1}
                  </span>
                  <p className="text-slate-800 font-semibold text-lg pt-1">{q.text}</p>
                </div>

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

      <footer className="py-6 text-center text-xs text-slate-400">
        © 2026 WorkSpace Pulse · Cumplimiento NOM-035-STPS-2018 · Datos cifrados y anonimizados
      </footer>
    </div>
  );
}