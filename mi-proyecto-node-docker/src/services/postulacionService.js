const db = require('../../db'); 
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { enviarNotificacionDecision } = require('./emailService');
const { DIAS_ABANDONO_POSTULACION, ZONA_HORARIA } = require('../config/systemLimits');

// Match the date-only closing date shown in the app: it remains open all day.
const condicionOfertaVigente = (parametroZonaHoraria) => `
    fecha_cierre::date >= (CURRENT_TIMESTAMP AT TIME ZONE $${parametroZonaHoraria})::date
    AND (activa IS NULL OR activa = TRUE)
`;

const procesarPostulacion = async (estudiante_id, oferta_id, confirmarSinRequisitos = false, telefono, correo, cvSubidoPath) => {
    if (!estudiante_id || !oferta_id) {
        throw new Error("Faltan datos para la postulación");
    }

    const telefonoLimpio = typeof telefono === 'string' ? telefono.trim() : '';
    const correoLimpio = typeof correo === 'string' ? correo.trim() : '';
    if (!telefonoLimpio || !correoLimpio) {
        throw new Error('El teléfono y el correo son obligatorios');
    }
    if (telefonoLimpio.length > 20 || correoLimpio.length > 100) {
        throw new Error('El teléfono o el correo exceden la longitud permitida');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
        throw new Error('Ingresa un correo electrónico válido');
    }

    // Validate on the server before processing requirements or copying a CV.
    const ofertaResult = await db.query(
        `SELECT id, (${condicionOfertaVigente(2)}) AS vigente FROM ofertas WHERE id = $1`,
        [oferta_id, ZONA_HORARIA]
    );
    if (ofertaResult.rows.length === 0) {
        throw new Error('La oferta no existe');
    }
    if (!ofertaResult.rows[0].vigente) {
        throw new Error('La oferta está vencida o ya no está vigente');
    }

    const perfilResult = await db.query(
        'SELECT enlace_cv FROM estudiantes WHERE id = $1',
        [estudiante_id]
    );
    if (perfilResult.rows.length === 0) {
        throw new Error('No se encontró el perfil del estudiante');
    }
    const cvPerfilPath = perfilResult.rows[0].enlace_cv;

    const checkQuery = 'SELECT * FROM postulaciones WHERE estudiante_id = $1 AND oferta_id = $2';
    const checkResult = await db.query(checkQuery, [estudiante_id, oferta_id]);
    
    if (checkResult.rows.length > 0) {
        throw new Error("Ya has postulado a esta oferta anteriormente");
    }

    const reqQuery = 'SELECT competencia_id FROM oferta_competencia WHERE oferta_id = $1';
    const reqResult = await db.query(reqQuery, [oferta_id]);
    const reqIds = reqResult.rows.map(r => r.competencia_id);

    if (reqIds.length > 0) {
        const estQuery = 'SELECT competencia_id FROM estudiante_competencia WHERE estudiante_id = $1';
        const estResult = await db.query(estQuery, [estudiante_id]);
        const estIds = estResult.rows.map(r => r.competencia_id);

        const cumpleAlMenosUno = reqIds.some(id => estIds.includes(id));

        if (!cumpleAlMenosUno && !confirmarSinRequisitos) {
            return { requiereConfirmacion: true, mensaje: "No cumples con los requisitos técnicos de esta oferta." };
        }
    }

 
    let cvPath = cvSubidoPath;
    let cvCopiadoPath;
    if (!cvPath && cvPerfilPath) {
        const uploadsRoot = path.resolve(__dirname, '../../uploads/cvs');
        const sourcePath = path.resolve(__dirname, '../..', cvPerfilPath.replace(/^\/+/, ''));
        if (!sourcePath.startsWith(`${uploadsRoot}${path.sep}`) || !fs.existsSync(sourcePath)) {
            throw new Error('No se pudo encontrar el CV guardado en tu perfil. Sube uno para continuar.');
        }

        const destinationDir = path.resolve(__dirname, '../../uploads/postulaciones');
        await fs.promises.mkdir(destinationDir, { recursive: true });
        const fileName = `cv-${estudiante_id}-${oferta_id}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.pdf`;
        cvCopiadoPath = path.join(destinationDir, fileName);
        await fs.promises.copyFile(sourcePath, cvCopiadoPath);
        cvPath = `/uploads/postulaciones/${fileName}`;
    }

    if (!cvPath) {
        throw new Error('Debes adjuntar un CV en PDF para postular');
    }

    try {
        // Recheck at insert time in case the offer stopped being valid while
        // the application was being processed.
        const insertQuery = `
            INSERT INTO postulaciones (estudiante_id, oferta_id, estado, telefono, correo_contacto, cv_path)
            SELECT $1, o.id, $3, $4, $5, $6
            FROM ofertas o
            WHERE o.id = $2
              AND (${condicionOfertaVigente(7)})
            RETURNING *
        `;
        const values = [estudiante_id, oferta_id, 'Pendiente', telefonoLimpio, correoLimpio, cvPath, ZONA_HORARIA];
        const nuevaPostulacion = await db.query(insertQuery, values);
        if (nuevaPostulacion.rows.length === 0) {
            throw new Error('La oferta venció o dejó de estar vigente antes de guardar la postulación');
        }
        return { success: true, data: nuevaPostulacion.rows[0] };
    } catch (error) {
        if (cvCopiadoPath) await fs.promises.unlink(cvCopiadoPath).catch(() => {});
        throw error;
    }
};

// Update only pending applications. Preserve decided history and never delete
// records; the status makes the historical inconsistency visible.
const sanearPostulacionesInvalidas = async () => {
    const result = await db.query(`
        UPDATE postulaciones p
        SET estado = 'No válida: oferta vencida'
        FROM ofertas o
        WHERE p.oferta_id = o.id
          AND p.estado = 'Pendiente'
          AND p.fecha_postulacion::date > o.fecha_cierre::date
        RETURNING p.id
    `);

    return {
        totalActualizadas: result.rowCount,
        postulacionIds: result.rows.map(row => row.id)
    };
};

const decidirPostulacion = async (postulacionId, empresaId, estado) => {
    if (!['Aceptado', 'Rechazado'].includes(estado)) {
        const error = new Error('La decisión debe ser Aceptado o Rechazado');
        error.statusCode = 400;
        throw error;
    }

    // Conditional update makes the decision single-use, including concurrent requests.
    const updateResult = await db.query(`
        UPDATE postulaciones p
        SET estado = $3
        FROM ofertas o
        WHERE p.id = $1
          AND p.oferta_id = o.id
          AND o.empresa_id = $2
          AND p.estado = 'Pendiente'
          AND o.fecha_cierre::date + ($4::integer + 1) > (CURRENT_TIMESTAMP AT TIME ZONE $5)::date
        RETURNING p.id, p.estado
    `, [postulacionId, empresaId, estado, DIAS_ABANDONO_POSTULACION, ZONA_HORARIA]);

    if (updateResult.rows.length === 0) {
        const existingResult = await db.query(`
            SELECT p.estado,
                   o.fecha_cierre::date + ($3::integer + 1) <= (CURRENT_TIMESTAMP AT TIME ZONE $4)::date AS plazo_vencido
            FROM postulaciones p
            JOIN ofertas o ON o.id = p.oferta_id
            WHERE p.id = $1 AND o.empresa_id = $2
        `, [postulacionId, empresaId, DIAS_ABANDONO_POSTULACION, ZONA_HORARIA]);

        if (existingResult.rows.length === 0) {
            const error = new Error('Postulación no encontrada para una oferta de esta empresa');
            error.statusCode = 404;
            throw error;
        }

        if (existingResult.rows[0].estado === 'Pendiente' && existingResult.rows[0].plazo_vencido) {
            const error = new Error('El plazo de decisión de esta postulación ya venció');
            error.statusCode = 409;
            throw error;
        }

        const error = new Error(`La postulación ya no está pendiente; su estado actual es ${existingResult.rows[0].estado}`);
        error.statusCode = 409;
        throw error;
    }

    // The state is already committed before attempting email delivery.
    let details;
    try {
        const detailsResult = await db.query(`
            SELECT u.correo, e.nombres, o.titulo
            FROM postulaciones p
            JOIN estudiantes e ON e.id = p.estudiante_id
            JOIN usuarios u ON u.id = e.usuario_id
            JOIN ofertas o ON o.id = p.oferta_id
            WHERE p.id = $1
        `, [postulacionId]);
        details = detailsResult.rows[0];
    } catch (detailsError) {
        console.error('No se pudieron obtener los datos para notificar la decisión:', detailsError);
    }

    if (!details || !details.correo) {
        return {
            id: updateResult.rows[0].id,
            estado: updateResult.rows[0].estado,
            notificacionEnviada: false,
            advertencia: 'La decisión se guardó, pero no se encontró un correo del estudiante.'
        };
    }

    try {
        await enviarNotificacionDecision({
            correo: details.correo,
            nombreEstudiante: [details.nombres].filter(Boolean).join(' '),
            tituloOferta: details.titulo,
            estado
        });
        return {
            id: updateResult.rows[0].id,
            estado: updateResult.rows[0].estado,
            notificacionEnviada: true
        };
    } catch (emailError) {
        console.error('No se pudo enviar la notificación de decisión:', emailError);
        return {
            id: updateResult.rows[0].id,
            estado: updateResult.rows[0].estado,
            notificacionEnviada: false,
            advertencia: 'La decisión se guardó, pero no se pudo enviar el correo de notificación.'
        };
    }
};

const obtenerPostulacionesPorOferta = async (oferta_id, empresa_id) => {
    const oferta = await db.query('SELECT id FROM ofertas WHERE id = $1 AND empresa_id = $2', [oferta_id, empresa_id]);
    if (oferta.rows.length === 0) return null;

    const result = await db.query(`
        SELECT p.id, p.fecha_postulacion, p.estado, p.telefono, p.correo_contacto, p.cv_path,
               s.nombres, s.apellidos,
               (p.estado = 'Pendiente' AND o.fecha_cierre::date + ($2::integer + 1) > (CURRENT_TIMESTAMP AT TIME ZONE $3)::date) AS puede_decidir
        FROM postulaciones p
        JOIN estudiantes s ON p.estudiante_id = s.id
        JOIN ofertas o ON o.id = p.oferta_id
        WHERE p.oferta_id = $1
        ORDER BY p.fecha_postulacion DESC
    `, [oferta_id, DIAS_ABANDONO_POSTULACION, ZONA_HORARIA]);
    return result.rows;
};

const obtenerPostulacionesEstudiante = async (estudiante_id) => {
    const query = `
        SELECT p.id, p.fecha_postulacion, p.estado, o.id as oferta_id, o.titulo, e.nombre_empresa
        FROM postulaciones p
        JOIN ofertas o ON p.oferta_id = o.id
        JOIN empresas e ON o.empresa_id = e.id
        WHERE p.estudiante_id = $1
        ORDER BY p.fecha_postulacion DESC
    `;
    const result = await db.query(query, [estudiante_id]);
    return result.rows;
};

module.exports = {
    procesarPostulacion,
    sanearPostulacionesInvalidas,
    decidirPostulacion,
    obtenerPostulacionesEstudiante,
    obtenerPostulacionesPorOferta
};
