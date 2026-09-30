const db = require('../../db'); 

const procesarPostulacion = async (id_estudiante, id_oferta) => {
    if (!id_estudiante || !id_oferta) {
        throw new Error("Faltan datos para la postulación");
    }

    const checkQuery = 'SELECT * FROM postulaciones WHERE id_estudiante = $1 AND id_oferta = $2';
    const checkResult = await db.query(checkQuery, [id_estudiante, id_oferta]);
    
    if (checkResult.rows.length > 0) {
        throw new Error("El estudiante ya tiene una postulación activa en esta oferta");
    }

    const insertQuery = 'INSERT INTO postulaciones (id_estudiante, id_oferta, estado) VALUES ($1, $2, $3) RETURNING *';
    const values = [id_estudiante, id_oferta, 'Pendiente'];
    
    const nuevaPostulacion = await db.query(insertQuery, values);

    return nuevaPostulacion.rows[0];
};

module.exports = { procesarPostulacion };