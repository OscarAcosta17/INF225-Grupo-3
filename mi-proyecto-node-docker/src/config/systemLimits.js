/**
 * RS11: Configuración Centralizada de Límites de Tiempo Estrictos
 * Responsable: Oscar Acosta (coordinado con Adrian para RS6b)
 * 
 * Este módulo actúa como Fuente Única de Verdad (SSOT) para todos los plazos
 * temporales del sistema, eliminando constantes duplicadas ("magic numbers").
 */

// 1. Plazo por defecto de vigencia de una oferta (en días) si no se especifica
const DIAS_VIGENCIA_OFERTA_DEFAULT = parseInt(process.env.DIAS_VIGENCIA_OFERTA_DEFAULT || '30', 10);

// 2. Plazo máximo de inactividad de una postulación antes de pasar a 'Sin respuesta' (RS6b)
// Consumido por Adrian en el servicio de postulaciones
const DIAS_ABANDONO_POSTULACION = parseInt(process.env.DIAS_ABANDONO_POSTULACION || '15', 10);

// 3. Frecuencia del proceso autónomo de caducidad en minutos (RS6a)
const CADUCIDAD_CHECK_INTERVAL_MINUTOS = parseInt(process.env.CADUCIDAD_CHECK_MINUTOS || '10', 10);
const CADUCIDAD_CHECK_INTERVAL_MS = CADUCIDAD_CHECK_INTERVAL_MINUTOS * 60 * 1000;

// 4. Zona horaria de referencia para la comparación uniforme de fechas
const ZONA_HORARIA = process.env.TZ || 'America/Santiago';

/**
 * Determina si una fecha límite de oferta ya expiró
 * @param {string|Date} fechaCierre 
 * @returns {boolean}
 */
const esOfertaVencida = (fechaCierre) => {
  if (!fechaCierre) return false;
  const fecha = new Date(fechaCierre);
  // Se considera vigente hasta el final del día fijado
  fecha.setHours(23, 59, 59, 999);
  return fecha < new Date();
};

/**
 * Determina si una postulación superó el plazo máximo sin respuesta de la empresa
 * Función compartida para que Adrian la utilice en RS6b
 * @param {string|Date} fechaPostulacion 
 * @param {number} diasLimite - Por defecto DIAS_ABANDONO_POSTULACION
 * @returns {boolean}
 */
const esPostulacionAbandonada = (fechaPostulacion, diasLimite = DIAS_ABANDONO_POSTULACION) => {
  if (!fechaPostulacion) return false;
  const fechaPost = new Date(fechaPostulacion);
  const milisegundosLimite = diasLimite * 24 * 60 * 60 * 1000;
  return (new Date() - fechaPost) > milisegundosLimite;
};

/**
 * Calcula la fecha de corte límite para consultas SQL de abandono
 * @param {number} diasLimite 
 * @returns {Date}
 */
const obtenerFechaCorteAbandono = (diasLimite = DIAS_ABANDONO_POSTULACION) => {
  const corte = new Date();
  corte.setDate(corte.getDate() - diasLimite);
  return corte;
};

module.exports = {
  DIAS_VIGENCIA_OFERTA_DEFAULT,
  DIAS_ABANDONO_POSTULACION,
  CADUCIDAD_CHECK_INTERVAL_MINUTOS,
  CADUCIDAD_CHECK_INTERVAL_MS,
  ZONA_HORARIA,
  esOfertaVencida,
  esPostulacionAbandonada,
  obtenerFechaCorteAbandono
};
