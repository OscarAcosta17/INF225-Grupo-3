const express = require('express');
const router = express.Router();
const { crearPostulacion, obtenerPostulacionesPorEstudiante, obtenerPostulacionesPorOferta } = require('../controllers/postulacionController');

router.post('/postular', crearPostulacion);
router.get('/estudiante/:id', obtenerPostulacionesPorEstudiante);
router.get('/oferta/:ofertaId/empresa/:empresaId', obtenerPostulacionesPorOferta);

module.exports = router;
