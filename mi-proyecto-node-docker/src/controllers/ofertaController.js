const pool = require('../../db');

// Crear una nueva oferta
const crearOferta = async (req, res) => {
  const { empresa_id, titulo, descripcion, requisitos, fecha_cierre, competencias } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO ofertas (empresa_id, titulo, descripcion, requisitos, fecha_cierre) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [empresa_id, titulo, descripcion, requisitos, fecha_cierre]
    );

    const nuevaOfertaId = result.rows[0].id;

    // Insertar competencias si existen
    if (competencias && competencias.length > 0) {
      const insertCompetenciasQuery = `
        INSERT INTO oferta_competencia (oferta_id, competencia_id)
        SELECT $1, unnest($2::int[])
      `;
      await pool.query(insertCompetenciasQuery, [nuevaOfertaId, competencias]);
    }

    res.status(201).json({ mensaje: 'Oferta publicada exitosamente', ofertaId: nuevaOfertaId });
  } catch (err) {
    console.error("Error al crear oferta:", err);
    res.status(500).json({ error: 'Error al crear la oferta' });
  }
};

// Obtener todas las ofertas
const obtenerOfertas = async (req, res) => {
  const { empresa_id, estudiante_id, competencias_filtro, localidad, modalidad, remuneracion, duracion } = req.query;
  try {
    let query = `
      WITH oferta_data AS (
        SELECT o.*, e.nombre_empresa,
               COALESCE(array_agg(c.id) FILTER (WHERE c.id IS NOT NULL), '{}') as competencia_ids,
               COALESCE(array_agg(c.nombre) FILTER (WHERE c.nombre IS NOT NULL), '{}') as competencias
        FROM ofertas o
        JOIN empresas e ON o.empresa_id = e.id
        LEFT JOIN oferta_competencia oc ON o.id = oc.oferta_id
        LEFT JOIN competencias c ON oc.competencia_id = c.id
        GROUP BY o.id, e.nombre_empresa
      )
      SELECT * FROM oferta_data
    `;
    
    const params = [];
    let whereClauses = [];

    if (empresa_id) {
      params.push(empresa_id);
      whereClauses.push(`empresa_id = $${params.length}`);
    }

    if (localidad) {
      params.push(localidad);
      whereClauses.push(`localidad = $${params.length}`);
    }
    if (modalidad) {
      params.push(modalidad);
      whereClauses.push(`modalidad = $${params.length}`);
    }
    if (remuneracion) {
      params.push(remuneracion);
      whereClauses.push(`remuneracion = $${params.length}`);
    }
    if (duracion) {
      params.push(duracion);
      whereClauses.push(`duracion = $${params.length}`);
    }

    // HU005: Filtrado por competencias específicas
    if (competencias_filtro) {
      const ids = competencias_filtro.split(',').map(Number);
      params.push(ids);
      whereClauses.push(`competencia_ids && $${params.length}`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(' AND ');
    }

    // HU003: Recomendaciones basadas en el perfil del estudiante
    if (estudiante_id && !competencias_filtro) {
      // Obtenemos competencias del estudiante
      const estCompResult = await pool.query('SELECT competencia_id FROM estudiante_competencia WHERE estudiante_id = $1', [estudiante_id]);
      const estCompIds = estCompResult.rows.map(r => r.competencia_id);

      if (estCompIds.length > 0) {
        params.push(estCompIds);
        const pIdx = params.length;
        
        // Calculamos coincidencia: porcentaje de competencias de la oferta que el estudiante posee
        query = `
          SELECT *,
                 (
                   SELECT COUNT(*)::float / GREATEST(array_length(competencia_ids, 1), 1) * 100
                   FROM unnest(competencia_ids) AS cid
                   WHERE cid = ANY($${pIdx})
                 ) as coincidencia
          FROM (${query}) AS sub
          ORDER BY coincidencia DESC, fecha_publicacion DESC
        `;
      } else {
        query += ` ORDER BY fecha_publicacion DESC`;
      }
    } else {
      query += ` ORDER BY fecha_publicacion DESC`;
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener ofertas:", err);
    res.status(500).json({ error: 'Error al obtener las ofertas' });
  }
};

// Obtener una oferta por ID
const obtenerOfertaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT o.*, e.nombre_empresa,
             COALESCE(array_agg(c.id) FILTER (WHERE c.id IS NOT NULL), '{}') as competencia_ids,
             COALESCE(array_agg(c.nombre) FILTER (WHERE c.nombre IS NOT NULL), '{}') as competencias
      FROM ofertas o
      JOIN empresas e ON o.empresa_id = e.id
      LEFT JOIN oferta_competencia oc ON o.id = oc.oferta_id
      LEFT JOIN competencias c ON oc.competencia_id = c.id
      WHERE o.id = $1
      GROUP BY o.id, e.nombre_empresa
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al obtener oferta:", err);
    res.status(500).json({ error: 'Error al obtener la oferta' });
  }
};

// Actualizar una oferta
const actualizarOferta = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, requisitos, fecha_cierre, competencias } = req.body;

  try {
    // Verificar si la oferta existe y si aún no ha cerrado
    const checkResult = await pool.query('SELECT fecha_cierre FROM ofertas WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }

    const fechaCierre = new Date(checkResult.rows[0].fecha_cierre);
    const ahora = new Date();

    if (ahora > fechaCierre) {
      return res.status(400).json({ error: 'No se puede modificar una oferta después de su fecha de cierre' });
    }

    // Actualizar datos básicos
    await pool.query(
      'UPDATE ofertas SET titulo = $1, descripcion = $2, requisitos = $3, fecha_cierre = $4 WHERE id = $5',
      [titulo, descripcion, requisitos, fecha_cierre, id]
    );

    // Actualizar competencias (eliminar y volver a insertar)
    await pool.query('DELETE FROM oferta_competencia WHERE oferta_id = $1', [id]);
    
    if (competencias && competencias.length > 0) {
      const insertCompetenciasQuery = `
        INSERT INTO oferta_competencia (oferta_id, competencia_id)
        SELECT $1, unnest($2::int[])
      `;
      await pool.query(insertCompetenciasQuery, [id, competencias]);
    }

    res.json({ mensaje: 'Oferta actualizada exitosamente' });
  } catch (err) {
    console.error("Error al actualizar oferta:", err);
    res.status(500).json({ error: 'Error al actualizar la oferta' });
  }
};

module.exports = {
  crearOferta,
  obtenerOfertas,
  obtenerOfertaPorId,
  actualizarOferta
};
