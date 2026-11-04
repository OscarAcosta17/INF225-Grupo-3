const express = require('express');
const router = express.Router();
const {
  crearBitacora,
  obtenerBitacorasEstudiante,
  actualizarBitacora,
  eliminarBitacora,
  obtenerResumenParaConvalidacion
} = require('../controllers/bitacoraController');


router.post('/', crearBitacora);
router.get('/estudiante/:estudianteId', obtenerBitacorasEstudiante);
router.get('/resumen/:estudianteId', obtenerResumenParaConvalidacion); 
router.put('/:id', actualizarBitacora);
router.delete('/:id', eliminarBitacora);

module.exports = router;