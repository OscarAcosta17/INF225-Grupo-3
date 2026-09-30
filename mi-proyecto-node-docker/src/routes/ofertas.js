const express = require('express');
const router = express.Router();
const {
  crearOferta,
  obtenerOfertas,
  obtenerOfertaPorId,
  actualizarOferta
} = require('../controllers/ofertaController');

// Rutas para ofertas
router.post('/', crearOferta);
router.get('/', obtenerOfertas);
router.get('/:id', obtenerOfertaPorId);
router.put('/:id', actualizarOferta);

module.exports = router;
