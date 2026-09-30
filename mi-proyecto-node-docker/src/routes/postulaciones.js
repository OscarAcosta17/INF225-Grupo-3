const express = require('express');
const router = express.Router();
const PostulacionController = require('../controllers/postulacionController');

router.post('/postular', PostulacionController.crearPostulacion);

module.exports = router;