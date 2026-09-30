const express = require('express');
const router = express.Router();
const { crearPostulacion, obtenerPostulacionesPorEstudiante } = require('../controllers/postulacionController');

router.post('/postular', crearPostulacion);
router.get('/estudiante/:id', obtenerPostulacionesPorEstudiante);

module.exports = router;