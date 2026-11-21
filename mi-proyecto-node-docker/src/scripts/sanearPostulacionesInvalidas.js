const db = require('../../db');
const { sanearPostulacionesInvalidas } = require('../services/postulacionService');

const ejecutar = async () => {
    try {
        const resultado = await sanearPostulacionesInvalidas();
        console.log(`Postulaciones pendientes marcadas como inválidas: ${resultado.totalActualizadas}`);
        if (resultado.postulacionIds.length > 0) {
            console.log(`IDs actualizados: ${resultado.postulacionIds.join(', ')}`);
        }
    } catch (error) {
        console.error('No se pudieron sanear las postulaciones:', error.message);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
};

ejecutar();
