const pool = require('../../db');

//registro de usuario
const registrarUsuario = async (req, res) => {
  const { correo, contrasena, nombres, apellidos } = req.body;

  try {
    const userResult = await pool.query(
      'INSERT INTO usuarios (correo, contrasena_hash) VALUES ($1, $2) RETURNING id',
      [correo, contrasena]
    );
    
    const nuevoUsuarioId = userResult.rows[0].id;

    await pool.query(
      'INSERT INTO estudiantes (usuario_id, nombres, apellidos) VALUES ($1, $2, $3)',
      [nuevoUsuarioId, nombres, apellidos]
    );

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });

  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ error: 'Error al registrar el usuario. Quizás el correo ya existe.' });
  }
};

// inicio de sesion
const loginUsuario = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    
    const result = await pool.query(
      `SELECT u.id AS usuario_id, e.id AS estudiante_id, e.nombres, e.perfil_configurado 
       FROM usuarios u
       JOIN estudiantes e ON u.id = e.usuario_id
       WHERE u.correo = $1 AND u.contrasena_hash = $2`,
      [correo, contrasena]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    res.json({
      mensaje: 'Login exitoso',
      usuario: result.rows[0]
    });

  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario
};