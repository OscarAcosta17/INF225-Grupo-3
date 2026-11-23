/**
 * Configuración de la IA para RS7 (convalidación).
 * Todo se controla por variables de entorno (ver docker-compose.yml).
 * La API de xAI (Grok) usa el mismo formato que OpenAI, por lo que
 * cambiar de proveedor es solo cambiar IA_BASE_URL / IA_MODEL / IA_API_KEY.
 */
module.exports = {
  API_KEY: process.env.XAI_API_KEY || process.env.IA_API_KEY || '',
  BASE_URL: (process.env.IA_BASE_URL || 'https://api.x.ai/v1').replace(/\/+$/, ''),
  // Revisa en tu consola de xAI el nombre exacto del modelo disponible para tu cuenta.
  MODEL: process.env.XAI_MODEL || process.env.IA_MODEL || 'grok-4',
  TIMEOUT_MS: parseInt(process.env.IA_TIMEOUT_MS || '90000', 10),

  // Si es 'true', al registrarse la evaluación del supervisor se genera la planilla
  // y la IA convalidadora decide automáticamente.
  AUTO_PROCESAR: (process.env.IA_AUTO_PROCESAR || 'true') === 'true',

  // Regla de la encuesta del supervisor (de 11 criterios, escala 1 a 5 estrellas):
  // se permite como MÁXIMO 2 criterios con 3 estrellas o menos. Con 3 o más criterios así, no se convalida.
  NOTA_BAJA_MAXIMA: parseInt(process.env.IA_NOTA_BAJA_MAXIMA || '3', 10),
  MAX_CRITERIOS_BAJOS: parseInt(process.env.IA_MAX_CRITERIOS_BAJOS || '2', 10),

  // Seguridad de la key / del gasto:
  // - Tope de llamadas a la IA por día (interruptor de emergencia contra abuso).
  MAX_LLAMADAS_DIA: parseInt(process.env.IA_MAX_LLAMADAS_DIA || '150', 10),
  // - Si se define, los endpoints manuales que gastan IA exigen el header x-admin-token.
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || ''
};
