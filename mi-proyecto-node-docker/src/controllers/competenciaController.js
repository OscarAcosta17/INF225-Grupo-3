const pool = require('../../db'); 

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


module.exports = {
  obtenerCompetencias,
  guardarCompetenciasEstudiante,
  obtenerCompetenciasDeEstudiante
};