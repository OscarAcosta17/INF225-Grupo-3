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
  ZONA_HORARIA
} = require('../config/systemLimits');

/**
 * Ejecuta el proceso de caducidad en la base de datos
 * @returns {Promise<{totalCaducadas: number, ofertas: Array}>}
 */
const caducarOfertasVencidas = async () => {
  const timestamp = new Date().toLocaleString('es-CL', { timeZone: ZONA_HORARIA });
  try {
    const query = `
      UPDATE ofertas
      SET activa = FALSE
      WHERE (fecha_cierre < CURRENT_TIMESTAMP OR fecha_cierre::date < CURRENT_DATE)
        AND (activa IS TRUE OR activa IS NULL)
      RETURNING id, titulo, fecha_cierre;
    `;

    const result = await pool.query(query);

    if (result.rowCount > 0) {
      console.log(`[RS6a - Caducidad Automática | ${timestamp}] Se caducaron ${result.rowCount} oferta(s) vencida(s):`);
      result.rows.forEach(o => {
        console.log(`  - Oferta #${o.id} "${o.titulo}" (Fecha límite: ${o.fecha_cierre})`);
      });
    } else {
      console.log(`[RS6a - Caducidad Automática | ${timestamp}] Chequeo completado: no hay ofertas nuevas que caducar.`);
    }

    return {
      totalCaducadas: result.rowCount,
      ofertas: result.rows,
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
