const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario, enviarCodigoRegistro} = require('../controllers/authController');

//para enviar un código de 6 dígitos al correo de registro
router.post('/enviar-codigo', enviarCodigoRegistro);

// para enviar los datos del formulario de registro
router.post('/registro', registrarUsuario);

// para enviar las credenciales del formulario de login
router.post('/login', loginUsuario);

module.exports = router;