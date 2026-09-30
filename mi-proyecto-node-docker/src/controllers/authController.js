const pool = require('../../db');

//registro de usuario
const registrarUsuario = async (req, res) => {
  const { correo, contrasena, nombres, apellidos, rol, nombre_empresa } = req.body;
  const userRole = rol || 'estudiante';

  try {
    const userResult = await pool.query(
      'INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ($1, $2, $3) RETURNING id',
      [correo, contrasena, userRole]
    );
    
    const nuevoUsuarioId = userResult.rows[0].id;

    if (userRole === 'empresa') {
      await pool.query(
        'INSERT INTO empresas (usuario_id, nombre_empresa) VALUES ($1, $2)',
        [nuevoUsuarioId, nombre_empresa]
      );
    } else {
      await pool.query(
        'INSERT INTO estudiantes (usuario_id, nombres, apellidos) VALUES ($1, $2, $3)',
        [nuevoUsuarioId, nombres, apellidos]
      );
    }

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
    // Primero obtenemos el usuario y su rol
    const userResult = await pool.query(
      'SELECT id, correo, rol FROM usuarios WHERE correo = $1 AND contrasena_hash = $2',
      [correo, contrasena]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const usuario = userResult.rows[0];
    let profileInfo = {};

    if (usuario.rol === 'empresa') {
      const empresaResult = await pool.query(
        'SELECT id, nombre_empresa FROM empresas WHERE usuario_id = $1',
        [usuario.id]
      );
      profileInfo = empresaResult.rows[0];
    } else {
      const estudianteResult = await pool.query(
        'SELECT id, nombres, perfil_configurado FROM estudiantes WHERE usuario_id = $1',
        [usuario.id]
      );
      profileInfo = estudianteResult.rows[0];
    }

    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        usuario_id: usuario.id,
        rol: usuario.rol,
        ...profileInfo
      }
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