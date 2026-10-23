const pool = require('../../db');
const nodemailer = require('nodemailer');


const codigosVerificacion = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'chambahub.usm@gmail.com', 
    pass: 'lxmd gbtv wuuy pwyk'  
  }
});

//Genera y envía código de 6 dígitos
const enviarCodigoRegistro = async (req, res) => {
  const { correo, rol } = req.body;
  const userRole = rol || 'estudiante';
  const correoLimpio = typeof correo === 'string' ? correo.trim() : '';

  if (!correoLimpio) {
    return res.status(400).json({ error: 'El correo es obligatorio' });
  }
  if (correoLimpio.length > 100) {
    return res.status(400).json({ error: 'El correo excede la longitud permitida (máximo 100 caracteres)' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
    return res.status(400).json({ error: 'Ingresa un correo electrónico válido' });
  }
  if (userRole === 'estudiante') {
    if (!correoLimpio.endsWith('@usm.cl')) {
      return res.status(400).json({ 
        error: 'Los estudiantes deben registrarse con un correo institucional (@usm.cl)' 
      });
    }
  }

  try {
    const checkUser = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correoLimpio]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Este correo ya está registrado' });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    codigosVerificacion.set(correoLimpio, codigo);

    await transporter.sendMail({
      from: '"ChambaHub" <chambahub.usm@gmail.com>',
      to: correoLimpio,
      subject: 'Código de Verificación - ChambaHub',
      text: `Tu código de verificación es: ${codigo}\n\nIngrésalo en la página para completar tu registro.`
    });

    res.status(200).json({ mensaje: 'Código enviado exitosamente al correo' });
    
    setTimeout(() => {
      codigosVerificacion.delete(correoLimpio);
    }, 10 * 60 * 1000);

  } catch (error) {
    console.error("Error enviando código:", error);
    res.status(500).json({ error: 'Error al enviar el correo de verificación' });
  }
};


// registro de usuario
const registrarUsuario = async (req, res) => {
  const { correo, contrasena, nombres, apellidos, rol, nombre_empresa, codigo } = req.body;
  const userRole = rol || 'estudiante';
  
  const correoLimpio = typeof correo === 'string' ? correo.trim() : '';
  
  if (userRole === 'estudiante') {
    if (!correoLimpio.endsWith('@usm.cl')) {
      return res.status(400).json({ error: 'Los estudiantes deben registrarse con un correo institucional (@usm.cl)' });
    }
  }

  const codigoGuardado = codigosVerificacion.get(correoLimpio);
  if (!codigoGuardado || codigoGuardado !== codigo) {
    return res.status(400).json({ error: 'Código de verificación incorrecto o expirado' });
  }

  try {
    const userResult = await pool.query(
      'INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ($1, $2, $3) RETURNING id',
      [correoLimpio, contrasena, userRole]
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
    codigosVerificacion.delete(correoLimpio);
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });

  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ error: 'Error al registrar el usuario. Quizás el correo ya existe.' });
  }
};

// inicio de sesion
const loginUsuario = async (req, res) => {
  const { correo, contrasena } = req.body;

  const correoLimpio = typeof correo === 'string' ? correo.trim() : '';

  try {
    const userResult = await pool.query(
      'SELECT id, correo, rol FROM usuarios WHERE correo = $1 AND contrasena_hash = $2',
      [correoLimpio, contrasena]
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
        'SELECT id, nombres, apellidos, perfil_configurado FROM estudiantes WHERE usuario_id = $1',
        [usuario.id]
      );
      profileInfo = estudianteResult.rows[0];
    }

    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: profileInfo.id,
        usuario_id: usuario.id,
        correo: usuario.correo,
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
  enviarCodigoRegistro,
  registrarUsuario,
  loginUsuario
};