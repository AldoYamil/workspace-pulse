// frontend/src/components/EvaluarAlertas.jsx
//
// Tarjeta "Evaluar ahora" para la pantalla de Configuración de alertas.
// Le pide al BACKEND que revise los umbrales; es Django quien crea las
// alertas y manda los correos con Resend (la API key nunca llega aquí).

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Mail, Play } from 'lucide-react';

import api from '../api/axios';

// Traduce el error de axios a un mensaje que diga QUÉ falló.
function describirError(err) {
  // El servidor respondió, pero con un error
  if (err.response) {
    const { status, data } = err.response;

    if (data?.detail) return data.detail;

    if (status === 404) {
      return 'Error 404: Django no tiene registrada la ruta v1/alertas/evaluar/. Revisa api/urls/__init__.py y reinicia el servidor.';
    }
    if (status === 401 || status === 403) {
      return `Error ${status}: tu sesión no es válida. Cierra sesión y vuelve a entrar.`;
    }
    if (status >= 500) {
      return `Error ${status}: falló algo dentro de Django. Revisa la terminal del servidor.`;
    }
    return `El servidor respondió con el error ${status}.`;
  }

  // Ni siquiera hubo respuesta
  return 'No hay conexión con el servidor. Revisa que Django esté corriendo en el puerto 8000.';
}

export default function EvaluarAlertas() {
  const [enviarCorreos, setEnviarCorreos] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  async function evaluar() {
    setCargando(true);
    setError('');
    setResultado(null);

    try {
      const { data } = await api.post('v1/alertas/evaluar/', {
        enviar_correos: enviarCorreos,
      });
      setResultado(data);
    } catch (err) {
      console.error('Error al evaluar alertas:', err);
      setError(describirError(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="space-y-5 px-8 pb-10">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-lg font-bold text-[#1E293B]">
          Evaluación de alertas
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Revisa los umbrales configurados contra los datos actuales y avisa
          por correo a los administradores cuando alguno se rebase.
        </p>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <Mail size={18} className="text-slate-500" />
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Enviar correos
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Si lo desactivas, solo se registran las alertas.
            </p>
          </div>
        </div>

        <input
          type="checkbox"
          checked={enviarCorreos}
          onChange={(e) => setEnviarCorreos(e.target.checked)}
          className="h-5 w-5 cursor-pointer accent-[#1E3A5F]"
        />
      </label>

      <button
        type="button"
        onClick={evaluar}
        disabled={cargando}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A5F] py-3 font-bold text-white shadow-md transition hover:bg-[#172A47] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {cargando ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Evaluando...
          </>
        ) : (
          <>
            <Play size={18} />
            Evaluar ahora
          </>
        )}
      </button>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {resultado && (
        <div
          role="status"
          className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-[#1E3A5F]"
        >
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={18} />
            Evaluación terminada
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-white p-3">
              <p className="text-2xl font-bold">
                {resultado.umbrales_revisados}
              </p>
              <p className="text-xs text-slate-500">Umbrales revisados</p>
            </div>

            <div className="rounded-lg bg-white p-3">
              <p className="text-2xl font-bold">
                {resultado.alertas_creadas.length}
              </p>
              <p className="text-xs text-slate-500">Alertas creadas</p>
            </div>

            <div className="rounded-lg bg-white p-3">
              <p className="text-2xl font-bold">
                {resultado.correos_enviados}
              </p>
              <p className="text-xs text-slate-500">Correos enviados</p>
            </div>
          </div>

          {resultado.alertas_creadas.length > 0 && (
            <ul className="space-y-1">
              {resultado.alertas_creadas.map((alerta) => (
                <li key={alerta.alerta}>
                  <strong>{alerta.area}</strong>: valor {alerta.valor}
                </li>
              ))}
            </ul>
          )}

          {resultado.errores.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              <p className="mb-1 font-semibold">No se pudo enviar:</p>
              <ul className="list-inside list-disc space-y-1">
                {resultado.errores.map((item, indice) => (
                  <li key={indice}>{item.error}</li>
                ))}
              </ul>
            </div>
          )}

          {resultado.omitidos.length > 0 && (
            <details className="text-xs text-slate-600">
              <summary className="cursor-pointer font-semibold">
                Omitidos ({resultado.omitidos.length})
              </summary>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {resultado.omitidos.map((item, indice) => (
                  <li key={indice}>
                    Umbral {item.umbral}: {item.motivo}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
