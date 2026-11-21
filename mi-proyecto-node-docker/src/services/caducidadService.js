/**
 * RS6a: Servicio Autónomo de Caducidad de Ofertas
 * Responsable: Oscar Acosta
 * 
 * Tarea periódica programada que identifica ofertas cuya fecha límite ya pasó
 * y actualiza su estado a activa = false de forma idempotente y segura.
 */

const pool = require('../../db');
const {
  CADUCIDAD_CHECK_INTERVAL_MS,
  CADUCIDAD_CHECK_INTERVAL_MINUTOS,
  DIAS_ABANDONO_POSTULACION,
  ZONA_HORARIA
} = require('../config/systemLimits');

/**
 * Ejecuta el proceso de caducidad en la base de datos
 * @returns {Promise<{totalCaducadas: number, ofertas: Array, totalPostulacionesSinRespuesta: number}>}
 */
const caducarOfertasVencidas = async () => {
  const timestamp = new Date().toLocaleString('es-CL', { timeZone: ZONA_HORARIA });
  try {
    const query = `
      UPDATE ofertas
      SET activa = FALSE
      WHERE fecha_cierre::date < (CURRENT_TIMESTAMP AT TIME ZONE $1)::date
        AND (activa IS TRUE OR activa IS NULL)
      RETURNING id, titulo, fecha_cierre;
    `;

    const result = await pool.query(query, [ZONA_HORARIA]);

    // Keep pending applications available to the company for seven configured
    // calendar days after the offer's closing date has ended.
    const postulacionesResult = await pool.query(`
      UPDATE postulaciones p
      SET estado = 'Sin respuesta oferta caducada'
      FROM ofertas o
      WHERE p.oferta_id = o.id
        AND p.estado = 'Pendiente'
        AND o.fecha_cierre::date + ($1::integer + 1) <= (CURRENT_TIMESTAMP AT TIME ZONE $2)::date
      RETURNING p.id, p.oferta_id;
    `, [DIAS_ABANDONO_POSTULACION, ZONA_HORARIA]);

    if (result.rowCount > 0) {
      console.log(`[RS6a - Caducidad Automática | ${timestamp}] Se caducaron ${result.rowCount} oferta(s) vencida(s):`);
      result.rows.forEach(o => {
        console.log(`  - Oferta #${o.id} "${o.titulo}" (Fecha límite: ${o.fecha_cierre})`);
      });
    } else {
      console.log(`[RS6a - Caducidad Automática | ${timestamp}] Chequeo completado: no hay ofertas nuevas que caducar.`);
    }

    if (postulacionesResult.rowCount > 0) {
      console.log(`[RS6b - Pending applications | ${timestamp}] Updated ${postulacionesResult.rowCount} pending application(s) after the grace period.`);
    }

    return {
      totalCaducadas: result.rowCount,
      ofertas: result.rows,
      totalPostulacionesSinRespuesta: postulacionesResult.rowCount,
      postulacionesSinRespuesta: postulacionesResult.rows,
      ejecutadoEn: timestamp
    };
  } catch (error) {
    console.error(`[RS6a - Caducidad Automática | ${timestamp}] Error al procesar caducidad:`, error);
    throw error;
  }
};

/**
 * Inicia el temporizador autónomo en segundo plano
 */
const iniciarServicioCaducidad = () => {
  console.log(`[RS6a] Iniciando servicio autónomo de caducidad de ofertas...`);
  console.log(`[RS6a] Intervalo configurado (RS11): cada ${CADUCIDAD_CHECK_INTERVAL_MINUTOS} minutos (${CADUCIDAD_CHECK_INTERVAL_MS} ms)`);

  // 1. Ejecutar de inmediato al arrancar el servidor
  caducarOfertasVencidas().catch(err => {
    console.error('[RS6a] Error en la primera ejecución de caducidad:', err);
  });

  // 2. Programar ejecución periódica
  const timer = setInterval(() => {
    caducarOfertasVencidas().catch(err => {
      console.error('[RS6a] Error en ejecución periódica de caducidad:', err);
    });
  }, CADUCIDAD_CHECK_INTERVAL_MS);

  // Evitar que el timer impida el apagado limpio del proceso
  if (timer.unref) {
    timer.unref();
  }

  return timer;
};

module.exports = {
  caducarOfertasVencidas,
  iniciarServicioCaducidad
};
