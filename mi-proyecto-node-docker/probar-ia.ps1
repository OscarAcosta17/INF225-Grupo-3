# Prueba el flujo de IA del tramite 1 (datos de prueba). Uso (PowerShell, en esta carpeta):
#   .\probar-ia.ps1                       -> local, evaluacion con 0 criterios bajos
#   .\probar-ia.ps1 -Bajos 3              -> 3 criterios con 3 estrellas (debe RECHAZAR)
#   .\probar-ia.ps1 -Base https://TU-BACKEND.onrender.com -SinSql   -> contra Render
param(
  [string]$Base = "http://localhost:4000",
  [int]$Bajos = 0,          # cuantos criterios llevan 3 estrellas (el resto 5)
  [switch]$SinSql,          # no tocar la BD (usar contra Render)
  [switch]$HorasSuficientes # solo local: carga jornadas hasta superar las horas comprometidas
)

if ($HorasSuficientes -and -not $SinSql) {
  Write-Host "Cargando jornadas de prueba en la BD local..."
  $sql = "INSERT INTO bitacoras (estudiante_id, fecha, hora_inicio, hora_fin, horas_trabajadas, actividades) SELECT 1, d::date, '09:00', '18:00', 9, 'Desarrollo de funcionalidades web con React y Node; revision de codigo con el equipo.' FROM generate_series('2026-11-03'::date, '2027-01-15'::date, '1 day') d WHERE EXTRACT(ISODOW FROM d) < 6 ON CONFLICT DO NOTHING;"
  docker exec postgres_db psql -U user -d mydb -c $sql
}

$criterios = "capacidad","confianza","aplicacion_esfuerzo","adaptabilidad","iniciativa","trabajo_equipo","conocimientos","asistencia_puntualidad","resultados","comunicacion_efectiva","manejo_tic"
$body = @{ resumen_tareas = "Desarrollo web full-stack"; observaciones = "Buen desempeno general" }
for ($i = 0; $i -lt $criterios.Count; $i++) { $body[$criterios[$i]] = $(if ($i -lt $Bajos) { 3 } else { 5 }) }

Write-Host "Enviando evaluacion del supervisor ($Bajos criterios con 3 estrellas)..."
Invoke-RestMethod -Method Post -Uri "$Base/api/convalidacion/1/evaluacion-supervisor" -ContentType "application/json" -Body ($body | ConvertTo-Json) | Out-Null

Write-Host "La IA esta trabajando (planilla + decision)... espera ~30 segundos"
Start-Sleep -Seconds 30

$r = Invoke-RestMethod -Uri "$Base/api/convalidacion/1/planilla"
Write-Host ""
Write-Host "DECISION:    " $r.decision_ia.decision
Write-Host "OBSERVACION: " $r.decision_ia.observacion
Write-Host "Planilla Excel: $Base/api/convalidacion/1/planilla.xlsx"
