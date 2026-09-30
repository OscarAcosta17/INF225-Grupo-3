const express = require('express');
const router = express.Router();
const { obtenerCompetencias, guardarCompetenciasEstudiante, obtenerCompetenciasDeEstudiante } = require('../controllers/competenciaController');

// Cuando alguien haga un GET a esta ruta, se llama al controlador
router.get('/', obtenerCompetencias);

// envia los datos al servidor y que los guarde
router.post('/guardar', guardarCompetenciasEstudiante);

router.get('/estudiante/:id', obtenerCompetenciasDeEstudiante);

module.exports = router;