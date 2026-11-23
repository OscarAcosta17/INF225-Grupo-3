const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || 'chambahub.usm@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'lxmd gbtv wuuy pwyk';
const REMITENTE = `"ChambaHub" <${EMAIL_USER}>`;
const EMAIL_WEBHOOK_URL = (process.env.EMAIL_WEBHOOK_URL || '').trim();
const EMAIL_WEBHOOK_TOKEN = (process.env.EMAIL_WEBHOOK_TOKEN || '').trim();
const WEBHOOK_TIMEOUT_MS = 12000;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  // Evita que la petición HTTP quede bloqueada si el entorno (ej. Render Free) restringe SMTP
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 10000
});

/** Envía un correo mediante el Web App HTTPS de Google Apps Script. */
const enviarPorWebhook = async ({ to, subject, text }) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(EMAIL_WEBHOOK_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: EMAIL_WEBHOOK_TOKEN,
        to,
        subject,
        text
      }),
      signal: controller.signal
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(
        'La respuesta del webhook de correo no es JSON válido. Revisa que el Web App de Google Apps Script tenga acceso configurado para "Cualquier persona".'
      );
    }

    if (!response.ok || data?.ok !== true) {
      throw new Error(data?.error || `Error del webhook de correo (HTTP ${response.status})`);
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Envía un correo por webhook HTTPS (Render/producción) si EMAIL_WEBHOOK_URL está configurado,
 * o mediante SMTP local como respaldo.
 */
const enviarCorreo = async ({ to, subject, text }) => {
  if (EMAIL_WEBHOOK_URL) {
    return enviarPorWebhook({ to, subject, text });
  }
  return transporter.sendMail({
    from: REMITENTE,
    to,
    subject,
    text
  });
};

const enviarNotificacionDecision = async ({ correo, nombreEstudiante, tituloOferta, estado }) => {
  const saludo = nombreEstudiante ? `Hola ${nombreEstudiante},` : 'Hola,';
  const decision = estado === 'Aceptado' ? 'aceptada' : 'rechazada';

  return enviarCorreo({
    to: correo,
    subject: `Actualización de tu postulación: ${estado}`,
    text: `${saludo}\n\nLa empresa ha ${decision} tu postulación a "${tituloOferta}". El estado actualizado está disponible en tu panel de seguimiento.\n\nEquipo ChambaHub`
  });
};

module.exports = { transporter, enviarCorreo, enviarNotificacionDecision };
