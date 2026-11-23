const pool = require('../../db');
const { generarYGuardarPlanilla, construirWorkbook } = require('../services/planillaService');
const { procesarTramite } = require('../services/convalidadorIAService');

const crypto = require('crypto');
const cfg = require('../config/iaConfig');

// Si ADMIN_TOKEN está definido (en Render debe estarlo), los endpoints manuales que gastan IA
// exigen el header "x-admin-token". Así nadie más puede quemar tus créditos llamando a la API.
const requiereTokenAdmin = (req, res, next) => {
  if (!cfg.ADMIN_TOKEN) return next();
  const recibido = Buffer.from(String(req.get('x-admin-token') || ''));
  const esperado = Buffer.from(cfg.ADMIN_TOKEN);
  const ok = recibido.length === esperado.length && crypto.timingSafeEqual(recibido, esperado);
  if (!ok) return res.status(401).json({ error: 'Token de administrador inválido o ausente.' });
  next();
};

const parseTramiteId = (rawId) => {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const manejarError = (res, error, mensajeBase) => {
  console.error(mensajeBase, error);
  const status = error.status || (error.code && String(error.code).startsWith('IA_') ? 502 : 500);
  res.status(error.code === 'IA_SIN_KEY' ? 503 : status).json({ error: error.message || mensajeBase });
};

// Genera/regenera solo la planilla (sin decidir).
const generarPlanilla = async (req, res) => {
  const tramiteId = parseTramiteId(req.params.id);
  if (!tramiteId) return res.status(400).json({ error: 'ID de trámite inválido.' });
  try {
    const r = await generarYGuardarPlanilla(tramiteId);
    if (!r) return res.status(404).json({ error: 'Trámite no encontrado.' });
    res.json({ mensaje: 'Planilla generada.', planilla_path: r.ruta, planilla: r.planilla });
  } catch (error) {
    manejarError(res, error, 'Error al generar la planilla.');
  }
};

// Devuelve la última planilla guardada.
const obtenerPlanilla = async (req, res) => {
  const tramiteId = parseTramiteId(req.params.id);
  if (!tramiteId) return res.status(400).json({ error: 'ID de trámite inválido.' });
  try {
    const r = await pool.query(
      'SELECT planilla_json, planilla_path, decision_ia_json FROM tramites_convalidacion WHERE id = $1',
      [tramiteId]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Trámite no encontrado.' });
    if (!r.rows[0].planilla_json) return res.status(404).json({ error: 'Este trámite aún no tiene planilla.' });
    res.json({
      planilla: r.rows[0].planilla_json,
      planilla_path: r.rows[0].planilla_path,
      decision_ia: r.rows[0].decision_ia_json
    });
  } catch (error) {
    manejarError(res, error, 'Error al consultar la planilla.');
  }
};

// Cadena completa: planilla + decisión de la IA convalidadora.
const procesarConIA = async (req, res) => {
  const tramiteId = parseTramiteId(req.params.id);
  if (!tramiteId) return res.status(400).json({ error: 'ID de trámite inválido.' });
  try {
    const r = await procesarTramite(tramiteId);
    res.json({
      mensaje: `Trámite resuelto por la IA: ${r.decision.decision}.`,
      decision: r.decision,
      tramite: r.tramite
    });
  } catch (error) {
    manejarError(res, error, 'Error al procesar el trámite con IA.');
  }
};

// Descarga el Excel construido al vuelo (funciona aunque el disco del servidor se reinicie).
const descargarPlanillaExcel = async (req, res) => {
  const tramiteId = parseTramiteId(req.params.id);
  if (!tramiteId) return res.status(400).json({ error: 'ID de trámite inválido.' });
  try {
    const r = await pool.query(
      'SELECT planilla_json, decision_ia_json FROM tramites_convalidacion WHERE id = $1', [tramiteId]
    );
    if (r.rows.length === 0 || !r.rows[0].planilla_json) {
      return res.status(404).json({ error: 'Este trámite aún no tiene planilla.' });
    }
    const wb = construirWorkbook(r.rows[0].planilla_json, r.rows[0].decision_ia_json);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="planilla-convalidacion-${tramiteId}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (error) {
    manejarError(res, error, 'Error al descargar la planilla.');
  }
};

module.exports = { requiereTokenAdmin, generarPlanilla, obtenerPlanilla, procesarConIA, descargarPlanillaExcel };
