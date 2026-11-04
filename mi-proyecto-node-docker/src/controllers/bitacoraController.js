const pool = require('../../db');


//Calcula horas trabajadas a partir de la hora de inicio y la hora de término.

const calcularHorasTrabajadas = (inicio, fin) => {
  if (!inicio || !fin) {
    throw new Error('Hora de inicio y hora de término son obligatorias.');
  }

  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);

  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) {
    throw new Error('Formato horario inválido. Se espera HH:MM.');
  }

  const minutosInicio = h1 * 60 + m1;
  const minutosFin = h2 * 60 + m2;

  if (minutosFin <= minutosInicio) {
    throw new Error('La hora de término debe ser estrictamente posterior a la hora de inicio.');
  }

  const minutosTotales = minutosFin - minutosInicio;
  const horas = Number((minutosTotales / 60).toFixed(2));

  if (horas > 16) {
    throw new Error('La jornada diaria no puede exceder las 16 horas continuas.');
  }

  return horas;
};


const crearBitacora = async (req, res) => {
  const { estudiante_id, fecha, hora_inicio, hora_fin, actividades, actividades_pendientes, observaciones } = req.body;

  if (!estudiante_id) {
    return res.status(401).json({ error: 'No autorizado: Se requiere identificación de estudiante.' });
  }

  if (!fecha || !fecha.trim()) {
    return res.status(400).json({ error: 'La fecha del día trabajado es obligatoria.' });
  }

  if (!actividades || !actividades.trim()) {
    return res.status(400).json({ error: 'La descripción de actividades realizadas es obligatoria.' });
  }

  let horasCalculadas = 0;
  try {
    horasCalculadas = calcularHorasTrabajadas(hora_inicio, hora_fin);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const existente = await pool.query(
      'SELECT id FROM bitacoras WHERE estudiante_id = $1 AND fecha = $2',
      [estudiante_id, fecha]
    );

    if (existente.rows.length > 0) {
      return res.status(409).json({
        error: 'Ya existe un registro de bitácora para esta fecha. Usa la opción de editar para corregirlo.'
      });
    }

    const result = await pool.query(
      `INSERT INTO bitacoras 
        (estudiante_id, fecha, hora_inicio, hora_fin, horas_trabajadas, actividades, actividades_pendientes, observaciones) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        estudiante_id,
        fecha,
        hora_inicio,
        hora_fin,
        horasCalculadas,
        actividades.trim(),
        actividades_pendientes ? actividades_pendientes.trim() : null,
        observaciones ? observaciones.trim() : null
      ]
    );

    res.status(201).json({
      mensaje: 'Jornada registrada exitosamente en la bitácora.',
      bitacora: result.rows[0]
    });
  } catch (error) {
    console.error('Error al registrar bitácora:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar la bitácora.' });
  }
};


const obtenerBitacorasEstudiante = async (req, res) => {
  const { estudianteId } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, fecha, TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha_formato,
              TO_CHAR(hora_inicio, 'HH24:MI') AS hora_inicio,
              TO_CHAR(hora_fin, 'HH24:MI') AS hora_fin,
              horas_trabajadas, actividades, actividades_pendientes, observaciones,
              fecha_registro
       FROM bitacoras 
       WHERE estudiante_id = $1 
       ORDER BY fecha DESC, hora_inicio DESC`,
      [estudianteId]
    );


    const totalHoras = result.rows.reduce((acc, row) => acc + Number(row.horas_trabajadas), 0);

    res.json({
      total_horas: Number(totalHoras.toFixed(2)),
      total_dias: result.rows.length,
      bitacoras: result.rows
    });
  } catch (error) {
    console.error('Error al obtener bitácoras:', error);
    res.status(500).json({ error: 'Error al obtener los registros de bitácora.' });
  }
};


const actualizarBitacora = async (req, res) => {
  const { id } = req.params;
  const { estudiante_id, hora_inicio, hora_fin, actividades, actividades_pendientes, observaciones } = req.body;

  if (!actividades || !actividades.trim()) {
    return res.status(400).json({ error: 'La descripción de actividades realizadas es obligatoria.' });
  }

  let horasCalculadas = 0;
  try {
    horasCalculadas = calcularHorasTrabajadas(hora_inicio, hora_fin);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const check = await pool.query('SELECT estudiante_id FROM bitacoras WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Registro de bitácora no encontrado.' });
    }

    if (Number(check.rows[0].estudiante_id) !== Number(estudiante_id)) {
      return res.status(403).json({ error: 'Acceso Denegado (403): No tienes permiso para editar bitácoras de otra persona.' });
    }

    const result = await pool.query(
      `UPDATE bitacoras
       SET hora_inicio = $1, hora_fin = $2, horas_trabajadas = $3,
           actividades = $4, actividades_pendientes = $5, observaciones = $6
       WHERE id = $7
       RETURNING *`,
      [
        hora_inicio,
        hora_fin,
        horasCalculadas,
        actividades.trim(),
        actividades_pendientes ? actividades_pendientes.trim() : null,
        observaciones ? observaciones.trim() : null,
        id
      ]
    );

    res.json({
      mensaje: 'Bitácora actualizada exitosamente.',
      bitacora: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar bitácora:', error);
    res.status(500).json({ error: 'Error al actualizar el registro de bitácora.' });
  }
};


const eliminarBitacora = async (req, res) => {
  const { id } = req.params;
  const estudiante_id = req.query.estudiante_id || req.body.estudiante_id;

  try {
    const check = await pool.query('SELECT estudiante_id FROM bitacoras WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado.' });
    }

    if (Number(check.rows[0].estudiante_id) !== Number(estudiante_id)) {
      return res.status(403).json({ error: 'Acceso Denegado (403): No tienes permiso para eliminar este registro.' });
    }

    await pool.query('DELETE FROM bitacoras WHERE id = $1', [id]);
    res.json({ mensaje: 'Registro de bitácora eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar bitácora:', error);
    res.status(500).json({ error: 'Error al eliminar el registro.' });
  }
};

const obtenerResumenParaConvalidacion = async (req, res) => {
  const { estudianteId } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha,
              TO_CHAR(hora_inicio, 'HH24:MI') AS hora_inicio,
              TO_CHAR(hora_fin, 'HH24:MI') AS hora_fin,
              horas_trabajadas, actividades, actividades_pendientes, observaciones
       FROM bitacoras
       WHERE estudiante_id = $1
       ORDER BY fecha ASC`,
      [estudianteId]
    );

    const totalHoras = result.rows.reduce((acc, row) => acc + Number(row.horas_trabajadas), 0);
    const primeraFecha = result.rows.length > 0 ? result.rows[0].fecha : null;
    const ultimaFecha = result.rows.length > 0 ? result.rows[result.rows.length - 1].fecha : null;

    res.json({
      estudiante_id: Number(estudianteId),
      total_horas_acumuladas: Number(totalHoras.toFixed(2)),
      total_dias_registrados: result.rows.length,
      periodo: {
        primera_fecha: primeraFecha,
        ultima_fecha: ultimaFecha
      },
      registros: result.rows
    });
  } catch (error) {
    console.error('Error al generar resumen para convalidación:', error);
    res.status(500).json({ error: 'Error al generar el resumen de convalidación.' });
  }
};

module.exports = {
  crearBitacora,
  obtenerBitacorasEstudiante,
  actualizarBitacora,
  eliminarBitacora,
  obtenerResumenParaConvalidacion
};