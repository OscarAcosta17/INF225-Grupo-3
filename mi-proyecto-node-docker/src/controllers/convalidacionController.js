const pool = require('../../db');

let columnaPostulacionVerificada = false;
const ensurePostulacionColumn = async () => {
  if (columnaPostulacionVerificada) return;
  await pool.query(`
    ALTER TABLE tramites_convalidacion
    ADD COLUMN IF NOT EXISTS postulacion_id INTEGER REFERENCES postulaciones(id) ON DELETE SET NULL;
  `);
  columnaPostulacionVerificada = true;
};

// Helper para calcular diferencia aproximada en meses entre dos fechas
const calcularMesesEntreFechas = (inicio, fin) => {
  const d1 = new Date(inicio);
  const d2 = new Date(fin);
  const diffDias = (d2 - d1) / (1000 * 60 * 60 * 24);
  return Number((diffDias / 30).toFixed(1));
};

// Iniciar nueva práctica
const iniciarPracticaNueva = async (req, res) => {
  const {
    estudiante_id,
    postulacion_id,
    tipo_practica, // 'industrial' | 'profesional'
    empresa_nombre,
    empresa_rut,
    empresa_direccion,
    supervisor_nombre,
    supervisor_correo,
    supervisor_telefono,
    modalidad,
    fecha_inicio,
    fecha_fin,
    horas_comprometidas
  } = req.body;

  if (!estudiante_id || !tipo_practica || !empresa_nombre || !empresa_rut || !empresa_direccion ||
      !supervisor_nombre || !supervisor_correo || !supervisor_telefono || !modalidad || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({ error: 'Todos los campos de la práctica, empresa y supervisor son obligatorios.' });
  }

  if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
    return res.status(400).json({ error: 'La fecha de término debe ser posterior a la fecha de inicio.' });
  }

  try {
    await ensurePostulacionColumn();

    // Verificar si ya tiene un trámite activo no rechazado
    const activo = await pool.query(
      `SELECT id FROM tramites_convalidacion 
       WHERE estudiante_id = $1 AND estado NOT IN ('Rechazada', 'Aprobada')`,
      [estudiante_id]
    );
    if (activo.rows.length > 0) {
      return res.status(409).json({ error: 'Ya tienes un trámite de práctica o convalidación en curso.' });
    }

    const postulacionIdVal = postulacion_id ? Number(postulacion_id) : null;

    // Validar que la postulación pertenezca al estudiante, esté aceptada y no haya sido usada antes
    if (postulacionIdVal) {
      const postCheck = await pool.query(
        `SELECT id FROM postulaciones
         WHERE id = $1 AND estudiante_id = $2 AND estado = 'Aceptada'`,
        [postulacionIdVal, estudiante_id]
      );
      if (postCheck.rows.length === 0) {
        return res.status(400).json({ error: 'La postulación seleccionada no es válida o no está aceptada.' });
      }

      const yaUsada = await pool.query(
        `SELECT id FROM tramites_convalidacion WHERE postulacion_id = $1`,
        [postulacionIdVal]
      );
      if (yaUsada.rows.length > 0) {
        return res.status(409).json({ error: 'Esta práctica aceptada ya fue utilizada para iniciar un trámite.' });
      }
    }

    const result = await pool.query(
      `INSERT INTO tramites_convalidacion (
        estudiante_id, postulacion_id, tipo_flujo, tipo_practica,
        empresa_nombre, empresa_rut, empresa_direccion,
        supervisor_nombre, supervisor_correo, supervisor_telefono,
        modalidad, fecha_inicio, fecha_fin, horas_comprometidas,
        estado, tiempo_estimado_dias
      ) VALUES ($1, $2, 'practica_nueva', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'Pendiente de confirmación del supervisor', 5)
      RETURNING *`,
      [
        estudiante_id, postulacionIdVal, tipo_practica,
        empresa_nombre.trim(), empresa_rut.trim(), empresa_direccion.trim(),
        supervisor_nombre.trim(), supervisor_correo.trim(), supervisor_telefono.trim(),
        modalidad, fecha_inicio, fecha_fin, Number(horas_comprometidas) || 360
      ]
    );

    res.status(201).json({
      mensaje: 'Solicitud de práctica nueva enviada. Pendiente de confirmación del supervisor.',
      tramite: result.rows[0]
    });
  } catch (error) {
    console.error('Error al iniciar práctica nueva:', error);
    res.status(500).json({ error: 'Error interno al registrar la solicitud de práctica.' });
  }
};

// Convalidación experiencia previa
const solicitarConvalidacionExperiencia = async (req, res) => {
  const {
    estudiante_id,
    tipo_practica, // 'industrial' | 'profesional'
    tipo_experiencia, // 'trabajo_profesional' | 'practica_investigativa' | 'trabajo_social' | 'emprendimiento'
    empresa_nombre,
    empresa_rut,
    empresa_direccion,
    empresa_unica,
    supervisor_nombre,
    supervisor_correo,
    supervisor_telefono,
    modalidad,
    fecha_inicio,
    fecha_fin,
    meses_a_convalidar
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Debes adjuntar el PDF con la descripción de las actividades realizadas.' });
  }

  if (!estudiante_id || !tipo_practica || !tipo_experiencia || !empresa_nombre || !empresa_direccion ||
      !supervisor_nombre || !supervisor_correo || !supervisor_telefono || !modalidad || !fecha_inicio || !fecha_fin || !meses_a_convalidar) {
    return res.status(400).json({ error: 'Faltan antecedentes obligatorios para la solicitud de convalidación.' });
  }

  // Una sola empresa o institución
  const esEmpresaUnica = empresa_unica === true || empresa_unica === 'true';
  if (!esEmpresaUnica) {
    return res.status(400).json({
      error: 'Requisito incumplido: La experiencia a convalidar debe haberse realizado en una sola empresa o institución.'
    });
  }

  // Duración mínima = triple del tiempo a convalidar
  const mesesConvalidarNum = Number(meses_a_convalidar);
  const mesesReales = calcularMesesEntreFechas(fecha_inicio, fecha_fin);

  if (mesesReales < mesesConvalidarNum * 3) {
    return res.status(400).json({
      error: `Requisito de duración incumplido: La experiencia registrada equivale a ${mesesReales} meses, pero se requiere al menos el triple del período a convalidar (${mesesConvalidarNum * 3} meses).`
    });
  }

  const pdfPath = `/uploads/convalidaciones/${req.file.filename}`;

  try {
    const activo = await pool.query(
      `SELECT id FROM tramites_convalidacion 
       WHERE estudiante_id = $1 AND estado NOT IN ('Rechazada', 'Aprobada')`,
      [estudiante_id]
    );
    if (activo.rows.length > 0) {
      return res.status(409).json({ error: 'Ya tienes un trámite de práctica o convalidación en curso.' });
    }

    const result = await pool.query(
      `INSERT INTO tramites_convalidacion (
        estudiante_id, tipo_flujo, tipo_practica, tipo_experiencia,
        empresa_nombre, empresa_rut, empresa_direccion, empresa_unica,
        supervisor_nombre, supervisor_correo, supervisor_telefono,
        modalidad, fecha_inicio, fecha_fin,
        meses_a_convalidar, meses_experiencia_real, pdf_actividades_path,
        estado, tiempo_estimado_dias
      ) VALUES ($1, 'convalidacion', $2, $3, $4, $5, $6, TRUE, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'Pendiente de evaluación del supervisor', 10)
      RETURNING *`,
      [
        estudiante_id, tipo_practica, tipo_experiencia,
        empresa_nombre.trim(), empresa_rut ? empresa_rut.trim() : null, empresa_direccion.trim(),
        supervisor_nombre.trim(), supervisor_correo.trim(), supervisor_telefono.trim(),
        modalidad, fecha_inicio, fecha_fin,
        mesesConvalidarNum, mesesReales, pdfPath
      ]
    );

    res.status(201).json({
      mensaje: 'Solicitud de convalidación registrada. Se ha solicitado la evaluación al supervisor.',
      tramite: result.rows[0]
    });
  } catch (error) {
    console.error('Error al solicitar convalidación:', error);
    res.status(500).json({ error: 'Error interno al procesar la solicitud de convalidación.' });
  }
};

// Seguimiento
const obtenerTramitesEstudiante = async (req, res) => {
  const { estudianteId } = req.params;

  try {
    await ensurePostulacionColumn();

    const tramitesRes = await pool.query(
      `SELECT t.*, 
              TO_CHAR(t.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio_fmt,
              TO_CHAR(t.fecha_fin, 'YYYY-MM-DD') AS fecha_fin_fmt,
              row_to_json(e.*) AS evaluacion_supervisor
       FROM tramites_convalidacion t
       LEFT JOIN evaluaciones_supervisor e ON e.tramite_id = t.id
       WHERE t.estudiante_id = $1
       ORDER BY t.fecha_creacion DESC`,
      [estudianteId]
    );

    // Consultar horas acumuladas en bitácora para calcular progreso en tiempo real
    const bitacoraRes = await pool.query(
      `SELECT COALESCE(SUM(horas_trabajadas), 0) AS horas_acumuladas,
              COUNT(*) AS dias_registrados
       FROM bitacoras
       WHERE estudiante_id = $1`,
      [estudianteId]
    );

    // Consultar postulaciones aceptadas que aún NO han sido utilizadas en ningún trámite
    const aceptadasRes = await pool.query(
      `SELECT p.id AS postulacion_id,
              o.id AS oferta_id,
              o.titulo AS oferta_titulo,
              o.modalidad,
              o.duracion,
              o.localidad,
              emp.nombre_empresa AS empresa_nombre,
              u.correo AS supervisor_correo
       FROM postulaciones p
       JOIN ofertas o ON p.oferta_id = o.id
       JOIN empresas emp ON o.empresa_id = emp.id
       JOIN usuarios u ON emp.usuario_id = u.id
       WHERE p.estudiante_id = $1
         AND p.estado = 'Aceptada'
         AND NOT EXISTS (
           SELECT 1
           FROM tramites_convalidacion tc
           WHERE tc.postulacion_id = p.id
         )
       ORDER BY p.fecha_postulacion DESC`,
      [estudianteId]
    );

    res.json({
      tramites: tramitesRes.rows,
      bitacora_actual: {
        horas_acumuladas: Number(bitacoraRes.rows[0].horas_acumuladas),
        dias_registrados: Number(bitacoraRes.rows[0].dias_registrados)
      },
      practicas_aceptadas: aceptadasRes.rows
    });
  } catch (error) {
    console.error('Error al obtener trámites del estudiante:', error);
    res.status(500).json({ error: 'Error al consultar el estado del trámite.' });
  }
};

// Informe final y bitácora
const subirInformeFinal = async (req, res) => {
  const { id } = req.params;
  const { estudiante_id } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Debes adjuntar el archivo PDF de tu Informe Final.' });
  }

  try {
    const check = await pool.query('SELECT * FROM tramites_convalidacion WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Trámite no encontrado.' });
    }

    const tramite = check.rows[0];
    if (Number(tramite.estudiante_id) !== Number(estudiante_id)) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este trámite.' });
    }

    if (tramite.tipo_flujo !== 'practica_nueva') {
      return res.status(400).json({ error: 'El informe final con bitácora solo aplica para prácticas nuevas.' });
    }

    const bitacorasRes = await pool.query(
      `SELECT id, TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha,
              TO_CHAR(hora_inicio, 'HH24:MI') AS hora_inicio,
              TO_CHAR(hora_fin, 'HH24:MI') AS hora_fin,
              horas_trabajadas, actividades, actividades_pendientes, observaciones
       FROM bitacoras
       WHERE estudiante_id = $1
       ORDER BY fecha ASC`,
      [estudiante_id]
    );

    const totalHoras = bitacorasRes.rows.reduce((acc, r) => acc + Number(r.horas_trabajadas), 0);

    if (bitacorasRes.rows.length === 0) {
      return res.status(400).json({ error: 'Debes tener jornadas registradas en tu bitácora antes de entregar el informe final.' });
    }

    const resumenSnapshot = {
      total_horas_acumuladas: Number(totalHoras.toFixed(2)),
      horas_comprometidas: tramite.horas_comprometidas,
      total_dias_registrados: bitacorasRes.rows.length,
      registros: bitacorasRes.rows
    };

    const informePath = `/uploads/convalidaciones/${req.file.filename}`;

    const updated = await pool.query(
      `UPDATE tramites_convalidacion
       SET pdf_informe_final_path = $1,
           resumen_bitacora_json = $2,
           estado = 'Pendiente de evaluación del supervisor',
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [informePath, JSON.stringify(resumenSnapshot), id]
    );

    res.json({
      mensaje: 'Informe final y resumen de bitácora enviados. Se ha solicitado la evaluación al supervisor.',
      tramite: updated.rows[0]
    });
  } catch (error) {
    console.error('Error al subir informe final:', error);
    res.status(500).json({ error: 'Error al procesar la entrega del informe final.' });
  }
};

// Apelación
const presentarApelacion = async (req, res) => {
  const { id } = req.params;
  const { estudiante_id, apelacion_motivo } = req.body;

  if (!apelacion_motivo || !apelacion_motivo.trim()) {
    return res.status(400).json({ error: 'Debes ingresar los fundamentos de tu apelación.' });
  }

  try {
    const check = await pool.query('SELECT * FROM tramites_convalidacion WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Trámite no encontrado.' });
    }

    const tramite = check.rows[0];
    if (Number(tramite.estudiante_id) !== Number(estudiante_id)) {
      return res.status(403).json({ error: 'No tienes permiso para apelar este trámite.' });
    }

    if (tramite.estado !== 'Rechazada') {
      return res.status(400).json({ error: 'Solo puedes presentar una apelación si el trámite fue rechazado.' });
    }

    const apelacionPdfPath = req.file ? `/uploads/convalidaciones/${req.file.filename}` : null;

    const updated = await pool.query(
      `UPDATE tramites_convalidacion
       SET estado = 'Apelación en revisión',
           apelacion_motivo = $1,
           apelacion_pdf_path = COALESCE($2, apelacion_pdf_path),
           apelacion_estado = 'En revisión',
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [apelacion_motivo.trim(), apelacionPdfPath, id]
    );

    res.json({
      mensaje: 'Apelación registrada exitosamente. Será revisada nuevamente por el encargado.',
      tramite: updated.rows[0]
    });
  } catch (error) {
    console.error('Error al presentar apelación:', error);
    res.status(500).json({ error: 'Error interno al registrar la apelación.' });
  }
};

// Supervisor y encargado
const listarTramitesPendientesIA = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, s.nombres, s.apellidos, u.correo AS estudiante_correo,
              row_to_json(e.*) AS evaluacion_supervisor
       FROM tramites_convalidacion t
       JOIN estudiantes s ON t.estudiante_id = s.id
       JOIN usuarios u ON s.usuario_id = u.id
       LEFT JOIN evaluaciones_supervisor e ON e.tramite_id = t.id
       ORDER BY t.fecha_actualizacion DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar trámites:', error);
    res.status(500).json({ error: 'Error al obtener trámites.' });
  }
};

const confirmarPracticaSupervisor = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await pool.query(
      `UPDATE tramites_convalidacion
       SET estado = 'Práctica confirmada / en curso',
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $1 AND tipo_flujo = 'practica_nueva'
       RETURNING *`,
      [id]
    );
    if (updated.rows.length === 0) return res.status(404).json({ error: 'Trámite no encontrado.' });
    res.json({ mensaje: 'Práctica confirmada por el supervisor.', tramite: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al confirmar práctica.' });
  }
};

const registrarEvaluacionSupervisor = async (req, res) => {
  const { id } = req.params;
  const {
    resumen_tareas, observaciones,
    capacidad, confianza, aplicacion_esfuerzo, adaptabilidad, iniciativa,
    trabajo_equipo, conocimientos, asistencia_puntualidad, resultados,
    comunicacion_efectiva, manejo_tic
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO evaluaciones_supervisor (
        tramite_id, resumen_tareas, observaciones,
        capacidad, confianza, aplicacion_esfuerzo, adaptabilidad, iniciativa,
        trabajo_equipo, conocimientos, asistencia_puntualidad, resultados,
        comunicacion_efectiva, manejo_tic
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (tramite_id) DO UPDATE SET
        resumen_tareas = EXCLUDED.resumen_tareas,
        observaciones = EXCLUDED.observaciones,
        capacidad = EXCLUDED.capacidad,
        confianza = EXCLUDED.confianza,
        aplicacion_esfuerzo = EXCLUDED.aplicacion_esfuerzo,
        adaptabilidad = EXCLUDED.adaptabilidad,
        iniciativa = EXCLUDED.iniciativa,
        trabajo_equipo = EXCLUDED.trabajo_equipo,
        conocimientos = EXCLUDED.conocimientos,
        asistencia_puntualidad = EXCLUDED.asistencia_puntualidad,
        resultados = EXCLUDED.resultados,
        comunicacion_efectiva = EXCLUDED.comunicacion_efectiva,
        manejo_tic = EXCLUDED.manejo_tic,
        fecha_evaluacion = CURRENT_TIMESTAMP`,
      [
        id, resumen_tareas, observaciones || '',
        capacidad, confianza, aplicacion_esfuerzo, adaptabilidad, iniciativa,
        trabajo_equipo, conocimientos, asistencia_puntualidad, resultados,
        comunicacion_efectiva, manejo_tic
      ]
    );

    const updated = await pool.query(
      `UPDATE tramites_convalidacion
       SET estado = 'En revisión por encargado',
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({ mensaje: 'Evaluación del supervisor registrada.', tramite: updated.rows[0] });
  } catch (error) {
    console.error('Error en evaluación de supervisor:', error);
    res.status(500).json({ error: 'Error al guardar la evaluación del supervisor.' });
  }
};

const resolverEncargado = async (req, res) => {
  const { id } = req.params;
  const {
    estado, // 'Aprobada' | 'Rechazada' | 'En revisión por encargado'
    tiempo_estimado_dias,
    acta_numero,
    acta_detalle,
    observaciones_encargado,
    es_resolucion_apelacion
  } = req.body;

  try {
    const check = await pool.query('SELECT * FROM tramites_convalidacion WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Trámite no encontrado.' });

    const esApelacion = Boolean(es_resolucion_apelacion) || check.rows[0].estado === 'Apelación en revisión';

    const updated = await pool.query(
      `UPDATE tramites_convalidacion
       SET estado = $1,
           tiempo_estimado_dias = COALESCE($2, tiempo_estimado_dias),
           acta_numero = COALESCE($3, acta_numero),
           acta_detalle = COALESCE($4, acta_detalle),
           observaciones_encargado = COALESCE($5, observaciones_encargado),
           apelacion_estado = CASE WHEN $6 THEN 'Resuelta' ELSE apelacion_estado END,
           apelacion_resolucion = CASE WHEN $6 THEN $5 ELSE apelacion_resolucion END,
           fecha_resolucion = CASE WHEN $1 IN ('Aprobada', 'Rechazada') THEN CURRENT_TIMESTAMP ELSE fecha_resolucion END,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        estado,
        tiempo_estimado_dias ?? null,
        acta_numero ?? null,
        acta_detalle ?? null,
        observaciones_encargado ?? null,
        esApelacion,
        id
      ]
    );

    res.json({ mensaje: 'Resolución del encargado actualizada.', tramite: updated.rows[0] });
  } catch (error) {
    console.error('Error al resolver trámite:', error);
    res.status(500).json({ error: 'Error al registrar la resolución del encargado.' });
  }
};

module.exports = {
  iniciarPracticaNueva,
  solicitarConvalidacionExperiencia,
  obtenerTramitesEstudiante,
  subirInformeFinal,
  presentarApelacion,
  listarTramitesPendientesIA,
  confirmarPracticaSupervisor,
  registrarEvaluacionSupervisor,
  resolverEncargado
};