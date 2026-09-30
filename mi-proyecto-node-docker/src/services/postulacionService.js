const db = require('../../db'); 

const procesarPostulacion = async (estudiante_id, oferta_id, confirmarSinRequisitos = false) => {
    if (!estudiante_id || !oferta_id) {
        throw new Error("Faltan datos para la postulación");
    }

    // Verificar si ya existe
    const checkQuery = 'SELECT * FROM postulaciones WHERE estudiante_id = $1 AND oferta_id = $2';
    const checkResult = await db.query(checkQuery, [estudiante_id, oferta_id]);
    
    if (checkResult.rows.length > 0) {
        throw new Error("Ya has postulado a esta oferta anteriormente");
    }

    // HU001: Validar requisitos
    const reqQuery = 'SELECT competencia_id FROM oferta_competencia WHERE oferta_id = $1';
    const reqResult = await db.query(reqQuery, [oferta_id]);
    const reqIds = reqResult.rows.map(r => r.competencia_id);

    if (reqIds.length > 0) {
        const estQuery = 'SELECT competencia_id FROM estudiante_competencia WHERE estudiante_id = $1';
        const estResult = await db.query(estQuery, [estudiante_id]);
        const estIds = estResult.rows.map(r => r.competencia_id);

        const cumpleAlMenosUno = reqIds.some(id => estIds.includes(id));

        if (!cumpleAlMenosUno && !confirmarSinRequisitos) {
            // Criterio de aceptación 2: Notificar que no cumple y pedir confirmación
            return { requiereConfirmacion: true, mensaje: "No cumples con los requisitos técnicos de esta oferta." };
        }
    }

    const insertQuery = 'INSERT INTO postulaciones (estudiante_id, oferta_id, estado) VALUES ($1, $2, $3) RETURNING *';
    const values = [estudiante_id, oferta_id, 'Pendiente'];
    
    const nuevaPostulacion = await db.query(insertQuery, values);

    return { success: true, data: nuevaPostulacion.rows[0] };
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

module.exports = { procesarPostulacion, obtenerPostulacionesEstudiante };
