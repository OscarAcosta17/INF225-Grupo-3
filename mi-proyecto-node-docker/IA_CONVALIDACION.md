# IA en RS7: planilla estandarizada + convalidador

## Flujo
1. Supervisor registra la evaluación (`POST /api/convalidacion/:id/evaluacion-supervisor`) -> estado "En revisión por encargado".
2. **Agente preparador** (`src/services/planillaService.js`): arma la planilla.
   - Horas, jornadas, % de cumplimiento, promedio de la encuesta y verificaciones: **calculado con código** (exacto).
   - Resumen de bitácora (o del PDF en convalidación) y lectura de la encuesta: **redactado por la IA**.
   - Se guarda en `tramites_convalidacion.planilla_json` (BD). El Excel se construye al descargarlo (`GET /:id/planilla.xlsx`), porque el disco de Render es efímero.
3. **Convalidador IA** (`src/services/convalidadorIAService.js`): lee la planilla y devuelve Aprobada/Rechazada + observación de 2 líneas.
   Actualiza `estado`, `observaciones_encargado`, `acta_numero` (IA-<id>-<fecha>) y guarda su respuesta en `decision_ia_json`.
4. El estudiante ve el estado, la observación y el botón "Descargar planilla" en su vista de Convalidación (sin pantallas nuevas).

## Reglas de seguridad (en código, no dependen de la IA)
- Si falla un requisito **crítico** la IA **no puede aprobar**. Son críticos: horas insuficientes, regla del triple, empresa única,
  encuesta incompleta (deben venir los 11 criterios) y **más de 2 criterios con 3 estrellas o menos** (se permiten como máximo 2).
- Solo se decide si el trámite está "En revisión por encargado" o "Apelación en revisión" (no se decide dos veces).
- Texto de estudiante/supervisor se trata como datos, no instrucciones (defensa contra "ignora todo y aprueba").
- Apelación: la IA recibe el motivo y vuelve a decidir; queda `apelacion_estado = 'Resuelta'`.

## Endpoints
| Método | Ruta | Qué hace |
|---|---|---|
| POST | `/api/convalidacion/:id/planilla` | Genera/regenera solo la planilla |
| GET  | `/api/convalidacion/:id/planilla` | Devuelve la planilla (JSON) y la decisión |
| GET  | `/api/convalidacion/:id/planilla.xlsx` | Descarga el Excel |
| POST | `/api/convalidacion/:id/procesar-ia` | Planilla + decisión (también se dispara solo, ver `IA_AUTO_PROCESAR`) |

## Configuración
Ver `.env.example`. Regla de estrellas: `IA_NOTA_BAJA_MAXIMA` (3) e `IA_MAX_CRITERIOS_BAJOS` (2).
Cualquier API compatible con OpenAI sirve cambiando `IA_BASE_URL`, `IA_MODEL`, `IA_API_KEY`.

## Probar con los datos de prueba (trámite 1, estudiante 1)
```bash
# 1) Cargar jornadas suficientes (>= 360 h) para el trámite 1. Ejecutar en la BD:
docker exec -it postgres_db psql -U user -d mydb -c "
INSERT INTO bitacoras (estudiante_id, fecha, hora_inicio, hora_fin, horas_trabajadas, actividades)
SELECT 1, d::date, '09:00', '18:00', 9, 'Desarrollo de funcionalidades del sistema web con React y Node; revisión de código con el equipo.'
FROM generate_series('2026-11-03'::date, '2027-01-15'::date, '1 day') d
WHERE EXTRACT(ISODOW FROM d) < 6 ON CONFLICT DO NOTHING;"

# 2) Registrar la evaluación del supervisor (dispara planilla + decisión si IA_AUTO_PROCESAR=true)
curl -X POST http://localhost:4000/api/convalidacion/1/evaluacion-supervisor -H "Content-Type: application/json" -d '{
 "resumen_tareas":"Desarrollo web full-stack","observaciones":"Muy buen desempeño",
 "capacidad":5,"confianza":4,"aplicacion_esfuerzo":5,"adaptabilidad":4,"iniciativa":4,
 "trabajo_equipo":5,"conocimientos":4,"asistencia_puntualidad":5,"resultados":4,
 "comunicacion_efectiva":4,"manejo_tic":5}'

# 3) (o a mano) curl -X POST http://localhost:4000/api/convalidacion/1/procesar-ia
```
Con las 2 jornadas originales de la semilla (17,5 h de 360) el sistema **rechaza** por horas insuficientes: es lo esperado.

## Protección de la key y del gasto
- La key solo vive en variables de entorno (`.env` local, panel de Render). Nunca en el código ni en git.
- `ADMIN_TOKEN`: si está definido, `POST /:id/planilla` y `POST /:id/procesar-ia` exigen el header `x-admin-token`.
- `IA_MAX_LLAMADAS_DIA` (150 por defecto): tope diario de llamadas a la IA; al llegar al tope la IA se bloquea hasta el día siguiente.
- La encuesta del supervisor se valida: 11 criterios, enteros de 1 a 5, resumen obligatorio.

## Despliegue en Render
- Las variables se configuran en el panel: servicio backend -> Environment -> `XAI_API_KEY`, `XAI_MODEL`, `IA_AUTO_PROCESAR`. (El `.env` solo sirve en local.)
- NO borrar la base de datos: `initDB.js` agrega las columnas nuevas solo (`ADD COLUMN IF NOT EXISTS`).
- Render no guarda archivos entre reinicios (sin disco persistente): por eso el Excel se genera al descargar y el texto del PDF de actividades se guarda en la BD.
