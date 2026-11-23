const express = require('express');
const router = express.Router();
const { crearPostulacion, obtenerPostulacionesPorEstudiante, obtenerPostulacionesPorOferta, obtenerPostulacionesPorEmpresa, decidirPostulacion } = require('../controllers/postulacionController');

router.post('/postular', crearPostulacion);
router.post('/:postulacionId/decision', decidirPostulacion);
router.get('/estudiante/:id', obtenerPostulacionesPorEstudiante);
router.get('/empresa/:empresaId', obtenerPostulacionesPorEmpresa);
router.get('/oferta/:ofertaId/empresa/:empresaId', obtenerPostulacionesPorOferta);

module.exports = router;
