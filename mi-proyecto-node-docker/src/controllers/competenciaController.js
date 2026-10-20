const pool = require('../../db'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/cvs/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cv-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilter
}).single('cv_file');

const obtenerCompetencias = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM competencias');
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo competencias:", err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const guardarCompetenciasEstudiante = async (req, res) => {
  const { estudiante_id, competencias_ids } = req.body;

  try {
    await pool.query('DELETE FROM estudiante_competencia WHERE estudiante_id = $1', [estudiante_id]);

    for (let comp_id of competencias_ids) {
      await pool.query(
        'INSERT INTO estudiante_competencia (estudiante_id, competencia_id) VALUES ($1, $2)',
        [estudiante_id, comp_id]
      );
    }

    await pool.query('UPDATE estudiantes SET perfil_configurado = TRUE WHERE id = $1', [estudiante_id]);

    res.status(200).json({ mensaje: 'Perfil y competencias guardadas correctamente' });

  } catch (err) {
    console.error("Error guardando las competencias:", err);
    res.status(500).json({ error: 'Ocurrió un error al guardar' });
  }
};

const obtenerCompetenciasDeEstudiante = async (req, res) => {
  try {
    const estudianteId = req.params.id; 
    const query = `
      SELECT c.id, c.nombre, c.categoria 
      FROM competencias c
      JOIN estudiante_competencia ec ON c.id = ec.competencia_id
      WHERE ec.estudiante_id = $1
    `;
    
    const result = await pool.query(query, [estudianteId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener las competencias del estudiante:", error);
    res.status(500).json({ error: "Error del servidor al buscar competencias" });
  }
};

const obtenerPerfilEstudiante = async (req, res) => {
  const estudianteId = req.params.id; 
  try {
    const query = `
      SELECT e.id, e.nombres, e.apellidos, e.telefono, e.descripcion, e.enlace_cv, e.perfil_configurado, u.correo 
      FROM estudiantes e
      JOIN usuarios u ON e.usuario_id = u.id
      WHERE e.id = $1
    `;
    const result = await pool.query(query, [estudianteId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    res.status(500).json({ error: "Error del servidor al buscar el perfil" });
  }
};

const actualizarPerfilEstudiante = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const estudianteId = req.params.id;
    const { telefono, descripcion } = req.body;
    
    try {
      const estudianteOld = await pool.query('SELECT enlace_cv FROM estudiantes WHERE id = $1', [estudianteId]);
      
      let enlace_cv = estudianteOld.rows[0]?.enlace_cv;

      if (req.file) {
        if (enlace_cv) {
          const rutaAnterior = path.join(__dirname, '../../', enlace_cv);
          if (fs.existsSync(rutaAnterior)) {
            try {
              fs.unlinkSync(rutaAnterior); // Borra el archivo viejo del disco
              console.log("CV anterior eliminado con éxito:", rutaAnterior);
            } catch (unlinkErr) {
              console.error("No se pudo borrar el archivo anterior:", unlinkErr);
            }
          }
        }

        enlace_cv = `/uploads/cvs/${req.file.filename}`;
      }

      await pool.query(
        'UPDATE estudiantes SET telefono = $1, descripcion = $2, enlace_cv = $3 WHERE id = $4',
        [telefono, descripcion, enlace_cv, estudianteId]
      );

      res.status(200).json({ mensaje: 'Información de contacto y perfil actualizada correctamente', enlace_cv });
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      res.status(500).json({ error: 'Ocurrió un error al actualizar el perfil' });
    }
  });
};

module.exports = {
  obtenerCompetencias,
  guardarCompetenciasEstudiante,
  obtenerCompetenciasDeEstudiante,
  obtenerPerfilEstudiante,
  actualizarPerfilEstudiante
};