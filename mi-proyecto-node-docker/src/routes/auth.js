const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario } = require('../controllers/authController');

// para enviar los datos del formulario de registro
router.post('/registro', registrarUsuario);

// para enviar las credenciales del formulario de login
router.post('/login', loginUsuario);

module.exports = router;