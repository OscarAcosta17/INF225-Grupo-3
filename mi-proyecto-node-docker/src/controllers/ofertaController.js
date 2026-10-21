const pool = require('../../db');

// Validación común para RS2.1 y RS2.2
const validarDatosOferta = ({ titulo, descripcion, requisitos, fecha_cierre, localidad, modalidad, remuneracion, duracion, competencias }) => {
  const errores = [];

  if (!titulo || !titulo.trim()) {
    errores.push('El título de la oferta es obligatorio.');
  }
  if (!descripcion || !descripcion.trim()) {
    errores.push('La descripción es obligatoria.');
  }
  if (!requisitos || !requisitos.trim()) {
    errores.push('Los requisitos son obligatorios.');
  }
  if (!fecha_cierre || isNaN(Date.parse(fecha_cierre))) {
    errores.push('La fecha de cierre es obligatoria y debe ser una fecha válida.');
  }
  if (!localidad || !localidad.trim()) {
    errores.push('La localidad es obligatoria.');
  }
  if (!modalidad || !modalidad.trim()) {
    errores.push('La modalidad es obligatoria.');
  }

  if (!remuneracion || !String(remuneracion).trim()) {
    errores.push('La remuneración es obligatoria.');
  } else {
    const remStr = String(remuneracion).trim();
    if (/-\s*\d+/.test(remStr)) {
      errores.push('La remuneración no puede contener valores negativos.');
    }
  }

  if (!duracion || !String(duracion).trim()) {
    errores.push('La duración es obligatoria.');
  } else {
    const durStr = String(duracion).trim();
    const match = durStr.match(/-?\d+(\.\d+)?/);
    if (match) {
      const num = parseFloat(match[0]);
      if (num <= 0) {
        errores.push('La duración debe ser mayor a 0 meses.');
      }
    }
  }

  if (!competencias || !Array.isArray(competencias) || competencias.length === 0) {
    errores.push('Debe detallar al menos una tecnología o competencia técnica.');
  }

  return errores;
};

// Crear una nueva oferta (RS2.1 - P-05)
const crearOferta = async (req, res) => {
  const { empresa_id, titulo, descripcion, requisitos, fecha_cierre, competencias, localidad, modalidad, remuneracion, duracion } = req.body;

  if (!empresa_id) {
    return res.status(401).json({ error: 'No autorizado: Se requiere identificación de empresa.' });
  }

  const errores = validarDatosOferta({ titulo, descripcion, requisitos, fecha_cierre, localidad, modalidad, remuneracion, duracion, competencias });
  if (errores.length > 0) {
    return res.status(400).json({ error: errores.join(' '), errores });
  }

  try {
    const result = await pool.query(
      `INSERT INTO ofertas (empresa_id, titulo, descripcion, requisitos, fecha_cierre, localidad, modalidad, remuneracion, duracion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [empresa_id, titulo.trim(), descripcion.trim(), requisitos.trim(), fecha_cierre, localidad.trim(), modalidad.trim(), String(remuneracion).trim(), String(duracion).trim()]
    );

    const nuevaOfertaId = result.rows[0].id;

    // Insertar competencias (obligatorias por RS2.1)
    const insertCompetenciasQuery = `
      INSERT INTO oferta_competencia (oferta_id, competencia_id)
      SELECT $1, unnest($2::int[])
    `;
    await pool.query(insertCompetenciasQuery, [nuevaOfertaId, competencias]);

    res.status(201).json({ mensaje: 'Oferta publicada exitosamente', ofertaId: nuevaOfertaId });
  } catch (err) {
    console.error("Error al crear oferta:", err);
    res.status(500).json({ error: 'Error al crear la oferta' });
  }
};

// Obtener todas las ofertas
const obtenerOfertas = async (req, res) => {
  const { empresa_id, estudiante_id, competencias_filtro, localidad, modalidad, remuneracion, monto_min, duracion } = req.query;
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
      if (remuneracion === 'mayor_300k' || remuneracion.toLowerCase().includes('300')) {
        // CP-RS3.1-01: Filtro por monto mayor a $300.000
        whereClauses.push(`(NULLIF(regexp_replace(remuneracion, '[^0-9]', '', 'g'), '')::numeric > 300000)`);
      } else if (remuneracion === 'Pagada') {
        const minVal = monto_min ? Number(monto_min) : 0;
        if (!isNaN(minVal) && minVal > 0) {
          params.push(minVal);
          whereClauses.push(`(NULLIF(regexp_replace(remuneracion, '[^0-9]', '', 'g'), '')::numeric >= $${params.length})`);
        } else {
          // Compatible con 'Pagada' y con montos monetarios ingresados > 0
          whereClauses.push(`(remuneracion = 'Pagada' OR (NULLIF(regexp_replace(remuneracion, '[^0-9]', '', 'g'), '')::numeric > 0))`);
        }
      } else if (remuneracion === 'No pagada') {
        // Compatible con 'No pagada' o $0
        whereClauses.push(`(remuneracion = 'No pagada' OR remuneracion ILIKE '%no pagada%' OR NULLIF(regexp_replace(remuneracion, '[^0-9]', '', 'g'), '')::numeric = 0)`);
      } else {
        params.push(remuneracion);
        whereClauses.push(`remuneracion = $${params.length}`);
      }
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

// Actualizar una oferta (RS2.2 - P-05 / CP-RS2.2-01, CP-RS2.2-02, CP-RS2.2-03)
const actualizarOferta = async (req, res) => {
  const { id } = req.params;
  const { empresa_id, titulo, descripcion, requisitos, fecha_cierre, competencias, localidad, modalidad, remuneracion, duracion } = req.body;

  try {
    // 1. Verificar si la oferta existe
    const checkResult = await pool.query('SELECT empresa_id, fecha_cierre FROM ofertas WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }

    const ofertaExistente = checkResult.rows[0];

    // 2. Control de acceso (CP-RS2.2-03): Verificar que la empresa que edita sea la dueña de la oferta
    if (!empresa_id || Number(ofertaExistente.empresa_id) !== Number(empresa_id)) {
      return res.status(403).json({ error: 'Acceso no autorizado: No tienes permiso para editar ofertas de otra empresa.' });
    }

    // 3. Verificar si aún no ha cerrado
    const fechaCierre = new Date(ofertaExistente.fecha_cierre);
    const ahora = new Date();

    if (ahora > fechaCierre) {
      return res.status(400).json({ error: 'No se puede modificar una oferta después de su fecha de cierre' });
    }

    // 4. Validar campos obligatorios y rangos (CP-RS2.2-02)
    const errores = validarDatosOferta({ titulo, descripcion, requisitos, fecha_cierre, localidad, modalidad, remuneracion, duracion, competencias });
    if (errores.length > 0) {
      return res.status(400).json({ error: errores.join(' '), errores });
    }

    // 5. Actualizar datos completos
    await pool.query(
      `UPDATE ofertas 
       SET titulo = $1, descripcion = $2, requisitos = $3, fecha_cierre = $4,
           localidad = $5, modalidad = $6, remuneracion = $7, duracion = $8
       WHERE id = $9`,
      [titulo.trim(), descripcion.trim(), requisitos.trim(), fecha_cierre, localidad.trim(), modalidad.trim(), String(remuneracion).trim(), String(duracion).trim(), id]
    );

    // 6. Actualizar competencias (eliminar y volver a insertar)
    await pool.query('DELETE FROM oferta_competencia WHERE oferta_id = $1', [id]);
    
    const insertCompetenciasQuery = `
      INSERT INTO oferta_competencia (oferta_id, competencia_id)
      SELECT $1, unnest($2::int[])
    `;
    await pool.query(insertCompetenciasQuery, [id, competencias]);

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
