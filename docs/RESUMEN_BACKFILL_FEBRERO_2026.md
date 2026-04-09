# Resumen de trabajo: Backfill Febrero 2026 (clave_empresa = 4)

## Objetivo
- Limpiar registros de febrero 2026 para la empresa 4 y regenerar datos virtuales con objetivo de tonelaje.
- Corregir falsos “día no laborable” (incluyendo domingos específicos reportados).
- Alinear folios OOSL y reglas operativas de calidad de datos.

## Problemas encontrados
- Configuración de entorno inconsistente (`.env.local` vs `.env.backfill`).
- Fallos por ESM (`__dirname`) en scripts ejecutados con `ts-node`.
- Colisiones de folio por índice único (`idx_registros_folio_unico`).
- Desfase de límites de mes por zona horaria (MX local vs UTC).
- Registros residuales fuera de rango local del mes.
- Verificación integral marcó incumplimientos de rango RSU y horarios.

## Cambios implementados
- Se estandarizó ejecución con `.env.backfill`.
- Se corrigió el cálculo de límites de mes en UTC para respetar mes local de México.
- Se endureció la generación de RSU por vehículo a rangos oficiales (sin expansión 85–110%).
- Se añadió guardia para descartar registros generados fuera de rango RSU.
- Se robusteció la asignación de folios:
  - base por empresa,
  - manejo de colisiones,
  - folios temporales seguros para inserción en lote.
- Se reforzó control para evitar desbordes de turnos nocturnos al mes siguiente.
- Se ajustó generación/corrección para duración objetivo (10–20 min).

## Scripts involucrados
- `scripts/backfill_ooslmp.ts` (pipeline principal de backfill mensual).
- `scripts/verify_rules_general_comprehensive.ts` (verificación integral parametrizada por mes/año).
- `scripts/fix_february_2026_rules.ts` (correcciones en sitio para febrero, preservando total RSU).

## Correcciones de datos aplicadas en febrero
- Limpieza de registros del mes para empresa 4.
- Re-ejecución de backfill con target mensual.
- Corrección de violaciones detectadas por verificador:
  - RSU fuera de rango,
  - horarios fuera de ventana,
  - consistencia de campos de peso (`peso`, `peso_entrada`, `peso_salida`).
- Ajustes de folios solicitados por negocio (incluyendo renumeraciones específicas).

## Estado final de febrero
- Verificación integral en verde (“TODO CORRECTO”) para febrero 2026.
- Sin violaciones activas de:
  - vehículos desconocidos/coherencia placa–económico,
  - rangos de peso,
  - horarios,
  - límites/frecuencia de viajes,
  - secuencia de folios.
- Total mensual preservado conforme objetivo configurado.

## Lecciones para meses siguientes
- Siempre ejecutar con `.env.backfill` explícito.
- Limpiar datos del mes por ventana local MX antes de regenerar.
- Validar al final con `verify_rules_general_comprehensive.ts`.
- Si hay desviaciones, aplicar script de fixes del mes preservando total objetivo.
