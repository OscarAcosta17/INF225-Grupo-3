const cfg = require('../config/iaConfig');

class IAError extends Error {
  constructor(message, code = 'IA_ERROR') {
    super(message);
    this.code = code;
  }
}

const iaDisponible = () => Boolean(cfg.API_KEY);

// Interruptor de emergencia: límite de llamadas por día (se reinicia a medianoche UTC o al reiniciar el servidor).
let diaContador = new Date().toISOString().slice(0, 10);
let llamadasHoy = 0;
const consumirCupo = () => {
  const hoy = new Date().toISOString().slice(0, 10);
  if (hoy !== diaContador) { diaContador = hoy; llamadasHoy = 0; }
  if (llamadasHoy >= cfg.MAX_LLAMADAS_DIA) {
    throw new IAError(`Se alcanzó el tope diario de llamadas a la IA (${cfg.MAX_LLAMADAS_DIA}).`, 'IA_TOPE_DIARIO');
  }
  llamadasHoy++;
};

/**
 * Llama al endpoint /chat/completions (formato OpenAI, compatible con xAI/Grok).
 * Reintenta 1 vez ante errores transitorios (429 / 5xx / timeout).
 */
const chat = async (messages, { temperature = 0.2, json = false } = {}) => {
  if (!iaDisponible()) {
    throw new IAError('No hay API key configurada (XAI_API_KEY).', 'IA_SIN_KEY');
  }

  consumirCupo();
  const body = { model: cfg.MODEL, messages, temperature };
  if (json) body.response_format = { type: 'json_object' };

  let ultimoError;
  for (let intento = 1; intento <= 2; intento++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.TIMEOUT_MS);
    try {
      const resp = await fetch(`${cfg.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cfg.API_KEY}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!resp.ok) {
        const detalle = await resp.text().catch(() => '');
        const transitorio = resp.status === 429 || resp.status >= 500;
        ultimoError = new IAError(`La API de IA respondió ${resp.status}: ${detalle.slice(0, 300)}`, 'IA_HTTP');
        if (transitorio && intento < 2) { await new Promise(r => setTimeout(r, 1500)); continue; }
        throw ultimoError;
      }

      const data = await resp.json();
      const texto = data?.choices?.[0]?.message?.content;
      if (!texto) throw new IAError('La IA devolvió una respuesta vacía.', 'IA_VACIA');
      return texto.trim();
    } catch (err) {
      if (err instanceof IAError) throw err;
      ultimoError = new IAError(
        err.name === 'AbortError' ? 'La IA tardó demasiado en responder.' : `Error de red con la IA: ${err.message}`,
        'IA_RED'
      );
      if (intento < 2) { await new Promise(r => setTimeout(r, 1500)); continue; }
      throw ultimoError;
    } finally {
      clearTimeout(timer);
    }
  }
  throw ultimoError;
};

/** Igual que chat() pero parsea JSON (tolera ```json ... ```). */
const chatJSON = async (messages, opts = {}) => {
  const texto = await chat(messages, { ...opts, json: true });
  const limpio = texto.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    return JSON.parse(limpio);
  } catch {
    const m = limpio.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch { /* cae abajo */ }
    }
    throw new IAError('La IA no devolvió un JSON válido.', 'IA_JSON');
  }
};

module.exports = { chat, chatJSON, iaDisponible, IAError };
