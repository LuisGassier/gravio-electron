-- ============================================================================
-- QUERIES DE VALIDACIÓN PARA REGISTROS VIRTUALES
-- ============================================================================
-- Este archivo contiene queries para validar la implementación de la tabla
-- registros_virtuales y el correcto funcionamiento del sistema de generación
-- de registros sintéticos para OOSLMP.
--
-- Ejecutar estas queries después de:
-- 1. Aplicar la migración 20241228_create_registros_virtuales.sql
-- 2. Desplegar la Edge Function actualizada
-- 3. Ejecutar el script de backfill
-- ============================================================================

-- ----------------------------------------------------------------------------
-- VALIDACIÓN 1: Verificar que la tabla existe
-- ----------------------------------------------------------------------------
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'registros_virtuales';
-- Esperado: 1 fila con table_name = 'registros_virtuales'


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 2: Verificar índices creados
-- ----------------------------------------------------------------------------
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'registros_virtuales'
ORDER BY indexname;
-- Esperado: 3 índices (idx_rv_fecha_entrada, idx_rv_clave_empresa, idx_rv_fecha_empresa)


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 3: Verificar que la vista existe
-- ----------------------------------------------------------------------------
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'view_registros_completos';
-- Esperado: 1 fila con table_type = 'VIEW'


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 4: Conteo inicial de registros virtuales
-- ----------------------------------------------------------------------------
SELECT COUNT(*) as total_registros_virtuales
FROM registros_virtuales
WHERE clave_empresa = 4;
-- Después del backfill: Debería mostrar el número de registros generados


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 5: Total de kg generados
-- ----------------------------------------------------------------------------
SELECT
  COUNT(*) as total_registros,
  SUM(peso_entrada) as kg_totales,
  AVG(peso_entrada) as kg_promedio,
  MIN(peso_entrada) as kg_minimo,
  MAX(peso_entrada) as kg_maximo
FROM registros_virtuales
WHERE clave_empresa = 4
  AND fecha_entrada >= '2024-12-01'
  AND fecha_entrada < '2024-12-28';
-- Esperado después del backfill:
-- - total_registros: variable (depende de días trabajados)
-- - kg_totales: ~350,000 kg (±10%)
-- - kg_promedio: ~2,500-4,000 kg
-- - kg_minimo: >= 200 kg
-- - kg_maximo: razonable (< 10,000 kg)


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 6: Distribución por día (debe ser 9-11 registros totales)
-- ----------------------------------------------------------------------------
SELECT
  DATE(fecha_entrada) as dia,
  COUNT(*) as registros_virtuales,
  SUM(peso_entrada) as kg_dia
FROM registros_virtuales
WHERE clave_empresa = 4
  AND fecha_entrada >= '2024-12-01'
  AND fecha_entrada < '2024-12-28'
GROUP BY DATE(fecha_entrada)
ORDER BY dia;
-- Esperado: Cada día debe tener registros (combinado con físicos = 9-11 total)


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 7: Comparación físicos vs virtuales por día
-- ----------------------------------------------------------------------------
SELECT
  DATE(fecha_entrada) as dia,
  tipo_registro,
  COUNT(*) as total,
  SUM(peso_entrada) as kg
FROM view_registros_completos
WHERE clave_empresa = 4
  AND fecha_entrada >= '2024-12-01'
  AND fecha_entrada < '2024-12-28'
GROUP BY DATE(fecha_entrada), tipo_registro
ORDER BY dia, tipo_registro;
-- Esperado: Para cada día, suma de físicos + virtuales debe ser 9-11


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 8: Total combinado por día (físicos + virtuales)
-- ----------------------------------------------------------------------------
SELECT
  DATE(fecha_entrada) as dia,
  COUNT(*) as total_registros,
  SUM(CASE WHEN tipo_registro = 'fisico' THEN 1 ELSE 0 END) as fisicos,
  SUM(CASE WHEN tipo_registro = 'virtual' THEN 1 ELSE 0 END) as virtuales,
  SUM(peso_entrada) as kg_total
FROM view_registros_completos
WHERE clave_empresa = 4
  AND fecha_entrada >= '2024-12-01'
  AND fecha_entrada < '2024-12-28'
GROUP BY DATE(fecha_entrada)
ORDER BY dia;
-- Esperado: total_registros entre 9 y 11 para cada día con actividad


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 9: Verificar NO hay violaciones de ventanas de domingo
-- ----------------------------------------------------------------------------
-- Los domingos solo se permiten registros entre 00:00-07:00 y 16:00-23:59
-- NO debe haber registros entre 07:00-15:59
SELECT
  COUNT(*) as violaciones,
  MIN(fecha_entrada) as primera_violacion,
  MAX(fecha_entrada) as ultima_violacion
FROM registros_virtuales
WHERE clave_empresa = 4
  AND EXTRACT(DOW FROM fecha_entrada) = 0  -- Domingo
  AND EXTRACT(HOUR FROM fecha_entrada) BETWEEN 7 AND 15;
-- Esperado: violaciones = 0


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 10: Verificar ventanas de lunes-sábado (7am-5pm)
-- ----------------------------------------------------------------------------
-- De lunes a sábado solo se permiten registros entre 07:00-16:59
SELECT
  COUNT(*) as registros_fuera_ventana
FROM registros_virtuales
WHERE clave_empresa = 4
  AND EXTRACT(DOW FROM fecha_entrada) BETWEEN 1 AND 6  -- Lunes a sábado
  AND (EXTRACT(HOUR FROM fecha_entrada) < 7 OR EXTRACT(HOUR FROM fecha_entrada) >= 17);
-- Esperado: 0 (todos los registros deben estar en ventana 7-17h)


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 11: Verificar marcador registrado_por
-- ----------------------------------------------------------------------------
SELECT
  registrado_por,
  COUNT(*) as total
FROM registros_virtuales
WHERE clave_empresa = 4
GROUP BY registrado_por;
-- Esperado después del backfill:
-- - 'SYSTEM_GENERATED_OOSLMP_BACKFILL': registros históricos
-- - 'SYSTEM_GENERATED_OOSLMP': registros en tiempo real (si ya se activó la función)


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 12: Detectar posibles colisiones (< 8 minutos de diferencia)
-- ----------------------------------------------------------------------------
-- Esta query busca registros (físicos o virtuales) que estén muy cercanos
WITH all_records AS (
  SELECT fecha_entrada FROM registros WHERE clave_empresa = 4
  UNION ALL
  SELECT fecha_entrada FROM registros_virtuales WHERE clave_empresa = 4
),
ordered_records AS (
  SELECT
    fecha_entrada,
    LAG(fecha_entrada) OVER (ORDER BY fecha_entrada) as prev_fecha
  FROM all_records
)
SELECT
  COUNT(*) as posibles_colisiones,
  MIN(EXTRACT(EPOCH FROM (fecha_entrada - prev_fecha)) / 60) as min_minutos_entre_registros
FROM ordered_records
WHERE prev_fecha IS NOT NULL
  AND EXTRACT(EPOCH FROM (fecha_entrada - prev_fecha)) / 60 < 8;
-- Esperado: posibles_colisiones = 0 o muy pocas (idealmente 0)


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 13: Distribución de pesos (debe seguir distribución normal)
-- ----------------------------------------------------------------------------
SELECT
  CASE
    WHEN peso_entrada < 1000 THEN '0-1000 kg'
    WHEN peso_entrada < 2000 THEN '1000-2000 kg'
    WHEN peso_entrada < 3000 THEN '2000-3000 kg'
    WHEN peso_entrada < 4000 THEN '3000-4000 kg'
    WHEN peso_entrada < 5000 THEN '4000-5000 kg'
    ELSE '5000+ kg'
  END as rango_peso,
  COUNT(*) as cantidad,
  ROUND(AVG(peso_entrada), 2) as promedio_rango
FROM registros_virtuales
WHERE clave_empresa = 4
GROUP BY rango_peso
ORDER BY rango_peso;
-- Esperado: Distribución tipo campana (más registros en rangos medios)


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 14: Verificar que hay datos en todos los catálogos relacionados
-- ----------------------------------------------------------------------------
SELECT
  'Operadores' as catalogo,
  COUNT(DISTINCT operador) as valores_distintos
FROM registros_virtuales WHERE clave_empresa = 4
UNION ALL
SELECT
  'Vehículos',
  COUNT(DISTINCT placa_vehiculo)
FROM registros_virtuales WHERE clave_empresa = 4
UNION ALL
SELECT
  'Rutas',
  COUNT(DISTINCT ruta)
FROM registros_virtuales WHERE clave_empresa = 4
UNION ALL
SELECT
  'Conceptos',
  COUNT(DISTINCT clave_concepto)
FROM registros_virtuales WHERE clave_empresa = 4;
-- Esperado: Cada catálogo debe tener al menos 1 valor distinto


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 15: Registros por día de la semana
-- ----------------------------------------------------------------------------
SELECT
  CASE EXTRACT(DOW FROM fecha_entrada)
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Lunes'
    WHEN 2 THEN 'Martes'
    WHEN 3 THEN 'Miércoles'
    WHEN 4 THEN 'Jueves'
    WHEN 5 THEN 'Viernes'
    WHEN 6 THEN 'Sábado'
  END as dia_semana,
  COUNT(*) as total_registros,
  SUM(peso_entrada) as kg_total
FROM registros_virtuales
WHERE clave_empresa = 4
  AND fecha_entrada >= '2024-12-01'
  AND fecha_entrada < '2024-12-28'
GROUP BY EXTRACT(DOW FROM fecha_entrada)
ORDER BY EXTRACT(DOW FROM fecha_entrada);
-- Esperado: Distribución razonable según días trabajados


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 16: Verificar que NO hay registros duplicados
-- ----------------------------------------------------------------------------
SELECT
  fecha_entrada,
  placa_vehiculo,
  peso_entrada,
  COUNT(*) as duplicados
FROM registros_virtuales
WHERE clave_empresa = 4
GROUP BY fecha_entrada, placa_vehiculo, peso_entrada
HAVING COUNT(*) > 1;
-- Esperado: 0 filas (no debe haber duplicados exactos)


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 17: Verificar campos obligatorios NO nulos
-- ----------------------------------------------------------------------------
SELECT
  'placa_vehiculo' as campo,
  COUNT(*) as registros_nulos
FROM registros_virtuales
WHERE clave_empresa = 4 AND placa_vehiculo IS NULL
UNION ALL
SELECT 'peso_entrada', COUNT(*)
FROM registros_virtuales
WHERE clave_empresa = 4 AND peso_entrada IS NULL
UNION ALL
SELECT 'fecha_entrada', COUNT(*)
FROM registros_virtuales
WHERE clave_empresa = 4 AND fecha_entrada IS NULL
UNION ALL
SELECT 'tipo_pesaje', COUNT(*)
FROM registros_virtuales
WHERE clave_empresa = 4 AND tipo_pesaje IS NULL;
-- Esperado: registros_nulos = 0 para todos los campos


-- ----------------------------------------------------------------------------
-- VALIDACIÓN 18: Resumen general final
-- ----------------------------------------------------------------------------
SELECT
  'RESUMEN GENERAL' as tipo,
  COUNT(*) as total_registros_virtuales,
  MIN(fecha_entrada) as fecha_primer_registro,
  MAX(fecha_entrada) as fecha_ultimo_registro,
  SUM(peso_entrada) as kg_totales,
  AVG(peso_entrada) as kg_promedio,
  COUNT(DISTINCT DATE(fecha_entrada)) as dias_con_registros
FROM registros_virtuales
WHERE clave_empresa = 4
  AND fecha_entrada >= '2024-12-01'
  AND fecha_entrada < '2024-12-28';
-- Esperado después del backfill:
-- - total_registros_virtuales: depende de días trabajados
-- - fecha_primer_registro: 2024-12-01 (o primer día con actividad)
-- - fecha_ultimo_registro: 2024-12-27 (o último día con actividad)
-- - kg_totales: ~350,000 kg
-- - kg_promedio: razonable
-- - dias_con_registros: igual al número de días trabajados en diciembre


-- ============================================================================
-- QUERIES DE MANTENIMIENTO / LIMPIEZA
-- ============================================================================

-- Eliminar TODOS los registros virtuales de diciembre (¡CUIDADO! No hay UNDO)
-- Descomentar solo si necesitas limpiar y volver a correr el backfill
-- DELETE FROM registros_virtuales
-- WHERE clave_empresa = 4
--   AND fecha_entrada >= '2024-12-01'
--   AND fecha_entrada < '2024-12-28';

-- Eliminar registros virtuales de un día específico
-- DELETE FROM registros_virtuales
-- WHERE clave_empresa = 4
--   AND DATE(fecha_entrada) = '2024-12-15';

-- Ver últimos 10 registros insertados
SELECT *
FROM registros_virtuales
WHERE clave_empresa = 4
ORDER BY created_at DESC
LIMIT 10;
