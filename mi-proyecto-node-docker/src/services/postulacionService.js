const db = require('../../db'); 
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
        const insertQuery = 'INSERT INTO postulaciones (estudiante_id, oferta_id, estado, telefono, correo_contacto, cv_path) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const values = [estudiante_id, oferta_id, 'Pendiente', telefonoLimpio, correoLimpio, cvPath];
        const nuevaPostulacion = await db.query(insertQuery, values);
        return { success: true, data: nuevaPostulacion.rows[0] };
    } catch (error) {
        if (cvCopiadoPath) await fs.promises.unlink(cvCopiadoPath).catch(() => {});
        throw error;
    }
};

const obtenerPostulacionesPorOferta = async (oferta_id, empresa_id) => {
    const oferta = await db.query('SELECT id FROM ofertas WHERE id = $1 AND empresa_id = $2', [oferta_id, empresa_id]);
    if (oferta.rows.length === 0) return null;

    const result = await db.query(`
        SELECT p.id, p.fecha_postulacion, p.estado, p.telefono, p.correo_contacto, p.cv_path,
               s.nombres, s.apellidos
        FROM postulaciones p
        JOIN estudiantes s ON p.estudiante_id = s.id
        WHERE p.oferta_id = $1
        ORDER BY p.fecha_postulacion DESC
    `, [oferta_id]);
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

module.exports = { procesarPostulacion, obtenerPostulacionesEstudiante, obtenerPostulacionesPorOferta };
