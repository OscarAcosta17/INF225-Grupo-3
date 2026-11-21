const nodemailer = require('nodemailer');

const REMITENTE = '"ChambaHub" <chambahub.usm@gmail.com>';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'chambahub.usm@gmail.com',
    pass: 'lxmd gbtv wuuy pwyk'
  }
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
