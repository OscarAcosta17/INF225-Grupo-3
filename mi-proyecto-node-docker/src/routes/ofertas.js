const express = require('express');
const router = express.Router();
const {
  crearOferta,
  obtenerOfertas,
  obtenerOfertaPorId,
  actualizarOferta,
  ejecutarCaducidadManual,
  obtenerParametrosTiempo,
  obtenerMetricasRecomendacion
} = require('../controllers/ofertaController');

// Rutas para ofertas
router.get('/metricas-recomendacion', obtenerMetricasRecomendacion);
router.get('/parametros-tiempo', obtenerParametrosTiempo);
router.post('/ejecutar-caducidad', ejecutarCaducidadManual);
router.post('/', crearOferta);
router.get('/', obtenerOfertas);
router.get('/:id', obtenerOfertaPorId);
router.put('/:id', actualizarOferta);

module.exports = router;
