const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || 'chambahub.usm@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'lxmd gbtv wuuy pwyk';
const REMITENTE = `"ChambaHub" <${EMAIL_USER}>`;

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

const enviarNotificacionDecision = async ({ correo, nombreEstudiante, tituloOferta, estado }) => {
  const saludo = nombreEstudiante ? `Hola ${nombreEstudiante},` : 'Hola,';
  const decision = estado === 'Aceptado' ? 'aceptada' : 'rechazada';

  return transporter.sendMail({
    from: REMITENTE,
    to: correo,
    subject: `Actualización de tu postulación: ${estado}`,
    text: `${saludo}\n\nLa empresa ha ${decision} tu postulación a "${tituloOferta}". El estado actualizado está disponible en tu panel de seguimiento.\n\nEquipo ChambaHub`
  });
};

module.exports = { transporter, enviarNotificacionDecision };
