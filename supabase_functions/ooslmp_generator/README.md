# OOSLMP Generator (Edge Function)

Descripción

Esta Edge Function genera registros sintéticos para la empresa OOSLMP (`clave_empresa = 4`). Está diseñada para ejecutarse periódicamente durante el día (por ejemplo cada 10-30 minutos). No inserta necesariamente un registro por ejecución: decide dinámicamente si debe insertar o saltarse la ejecución para asegurar un buen espaciamiento de camiones durante el día y mantener los promedios diarios.

Archivos

- `index.ts`: lógica principal de generación. Modo `DRY_RUN=true` por defecto.

Variables de entorno necesarias

- `SUPABASE_URL` - URL del proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key (con permisos para insertar en `registros` y escribir en `generated_records_audit`)

Variables de entorno opcionales / configuración

- `CLAVE_EMPRESA` (por defecto `4`)
- `COLLISION_BUFFER_MINUTES` (por defecto `8`)
- `TIMEZONE` (por defecto `America/Mexico_City`)
- `ALLOW_BACKFILL` (por defecto `false`)
- `TARGET_MONTH_TOTAL_KG` (por defecto `2500-3000 toneladas por mes`)
- `TARGET_MONTH_VARIATION` (por defecto `10000`)
- `TARGET_DAILY_COUNT_MEAN` (por defecto `10`)
- `DRY_RUN` (por defecto `true`) — cuando `true` no hace insert en la DB, solo devuelve el registro candidato
- `PHYSICAL_COOLDOWN_MINUTES` (por defecto `30`) — número de minutos tras un registro físico durante los cuales la función evita generar un registro nuevo. Prioriza no generar si hubo un pesaje físico recientemente.
- `PHYSICAL_OVERRIDE_PROB` (por defecto `0.05`) — probabilidad de ignorar el cooldown (útil para situaciones excepcionales).

Comportamiento de ejecución

- La función se puede programar cada 10-30 minutos.
- En cada ejecución la función calcula el objetivo diario (9–11 registros) y cuántos ya existen hoy para `clave_empresa = 4`.
- Si la cantidad restante para hoy es 0 la ejecución se salta.
- La función diferencia registros "físicos" (registrados por el sistema/humano cuando el camión pasó por la báscula) de registros generados automáticamente por esta función mediante el campo `registrado_por`.
- El objetivo diario (9–11) se aplica al total: "físicos" + "generados". Por tanto, si ya hay, por ejemplo, 7 registros físicos hoy la función solo generará hasta completar el total objetivo.
- Si hay registros pendientes para el día, la función calcula los minutos restantes en las ventanas válidas del día y un intervalo esperado entre registros. Inserta sólo si el tiempo transcurrido desde el último registro de OOSLMP es compatible con ese intervalo o por una pequeña probabilidad aleatoria (para evitar un patrón demasiado rígido).
- Esto asegura que la función puede ejecutarse frecuentemente (cada 10–30 min) sin crear un registro en cada invocación, logrando un reparto natural de eventos.

Permisos y RLS

- Configurar políticas RLS de forma que la función (usando la service role key) pueda escribir únicamente `clave_empresa = 4` o crear una policy que permita a la función realizar las inserciones.

Despliegue

Puedes empaquetar/compilar `index.ts` y desplegarlo como una Supabase Edge Function usando las herramientas oficiales de Supabase o convertirla en una función programada en tu infraestructura (Cloud Run, cron + curl, etc.).

Modo de ejecución local (dry-run)

1. Copia `.env.example` y ajusta vars mínimas
2. Ejecuta con `ts-node` o compilar con `tsc` y ejecutar con `node`.

**IMPORTANTE:** Antes de ejecutar en modo `live`, probar exhaustivamente en `DRY_RUN=true` y revisar la tabla `generated_records_audit` y los registros insertados.

## Tabla de Registros Virtuales

### Separación de Datos

A partir de diciembre 2024, los registros sintéticos generados por esta función se almacenan en una tabla separada:

- **`registros`**: Solo registros físicos (camiones reales pesados en báscula)
- **`registros_virtuales`**: Solo registros sintéticos generados automáticamente

### Características Importantes

1. **Cloud-only**: Los registros virtuales NO se sincronizan a SQLite local, solo existen en Supabase
2. **Diferenciación clara**: Permite eliminar registros virtuales incorrectos sin afectar datos reales
3. **Vista unificada**: `view_registros_completos` combina ambas tablas para reportes

### Campo Marcador

- `registrado_por = 'SYSTEM_GENERATED_OOSLMP'`: Registros del generador en tiempo real
- `registrado_por = 'SYSTEM_GENERATED_OOSLMP_BACKFILL'`: Registros históricos del script de backfill

### Consultas Útiles

```sql
-- Ver registros virtuales del mes actual
SELECT * FROM registros_virtuales
WHERE clave_empresa = 4
  AND fecha_entrada >= date_trunc('month', CURRENT_DATE);

-- Comparar físicos vs virtuales por día
SELECT
  DATE(fecha_entrada) as dia,
  tipo_registro,
  COUNT(*) as total,
  SUM(peso_entrada) as kg
FROM view_registros_completos
WHERE clave_empresa = 4
  AND fecha_entrada >= '2024-12-01'
GROUP BY DATE(fecha_entrada), tipo_registro
ORDER BY dia, tipo_registro;

-- Verificar distribución diaria (debe estar entre 9-11 registros totales)
SELECT
  DATE(fecha_entrada) as dia,
  COUNT(*) as total_registros,
  SUM(CASE WHEN tipo_registro = 'fisico' THEN 1 ELSE 0 END) as fisicos,
  SUM(CASE WHEN tipo_registro = 'virtual' THEN 1 ELSE 0 END) as virtuales,
  SUM(peso_entrada) as kg_total
FROM view_registros_completos
WHERE clave_empresa = 4
  AND fecha_entrada >= '2024-12-01'
GROUP BY DATE(fecha_entrada)
ORDER BY dia;

-- Eliminar registros virtuales de un día específico (si están mal)
DELETE FROM registros_virtuales
WHERE clave_empresa = 4
  AND DATE(fecha_entrada) = '2024-12-15';

-- Verificar que no hay violaciones de ventanas de domingo (7am-4pm)
SELECT COUNT(*) as violaciones FROM registros_virtuales
WHERE EXTRACT(DOW FROM fecha_entrada) = 0
  AND EXTRACT(HOUR FROM fecha_entrada) BETWEEN 7 AND 15;
-- Debe retornar 0
```

## Script de Backfill Histórico

Para generar registros históricos de diciembre 1-27, 2024, existe un script standalone que:

1. Identifica días con actividad real (registros físicos)
2. Completa cada día hasta 9-11 registros totales (físicos + virtuales)
3. Distribuye ~350,000 kg entre todos los registros virtuales creados
4. Respeta ventanas de tiempo (lun-sáb 7-17h, dom 0-7h + 16-24h)
5. Evita colisiones con buffer de 8 minutos entre registros

### Uso del Script

```bash
# Ejecutar en modo DRY_RUN (por defecto, no inserta nada)
cd scripts
SUPABASE_URL=https://tu-proyecto.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=tu-service-key \
npx ts-node backfill_ooslmp_december_2024.ts

# Ejecutar en modo LIVE (inserta en la base de datos)
DRY_RUN=false \
SUPABASE_URL=https://tu-proyecto.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=tu-service-key \
npx ts-node backfill_ooslmp_december_2024.ts
```

### Validación Post-Backfill

Después de ejecutar el backfill, verificar:

```sql
-- Total de registros virtuales insertados
SELECT COUNT(*) FROM registros_virtuales WHERE clave_empresa = 4;

-- Kg totales generados (debe estar cerca de 350,000 kg)
SELECT SUM(peso_entrada) FROM registros_virtuales WHERE clave_empresa = 4;

-- Distribución por día (debe mostrar 9-11 registros totales por día trabajado)
SELECT
  DATE(fecha_entrada) as dia,
  COUNT(*) as registros,
  SUM(peso_entrada) as kg
FROM registros_virtuales
WHERE clave_empresa = 4
  AND fecha_entrada >= '2024-12-01'
  AND fecha_entrada < '2024-12-28'
GROUP BY DATE(fecha_entrada)
ORDER BY dia;
```

## Migración a Producción

### Paso 1: Aplicar Migración SQL

Aplicar la migración `migrations/20241228_create_registros_virtuales.sql` en Supabase:

```bash
# Opción 1: Via Supabase Dashboard
# - Ir a SQL Editor
# - Copiar y ejecutar el contenido de la migración

# Opción 2: Via Supabase CLI
supabase db push
```

### Paso 2: Desplegar Edge Function Actualizada

Desplegar la versión actualizada de `ooslmp_generator` que ahora inserta en `registros_virtuales`:

```bash
supabase functions deploy ooslmp_generator
```

### Paso 3: Ejecutar Backfill Histórico

Ejecutar el script de backfill primero en modo DRY_RUN para validar, luego en modo LIVE:

```bash
# Validar primero
npx ts-node scripts/backfill_ooslmp_december_2024.ts

# Si todo se ve bien, ejecutar inserción real
DRY_RUN=false npx ts-node scripts/backfill_ooslmp_december_2024.ts
```

### Paso 4: Activar Función en Modo LIVE

Cambiar la variable de entorno `DRY_RUN=false` en Supabase para que la función comience a insertar registros reales.

### Paso 5: Programar Ejecución Periódica

Configurar un cron job o trigger para ejecutar la función cada 15-30 minutos:

```bash
# Ejemplo usando cron (cada 20 minutos)
*/20 * * * * curl -X POST https://tu-proyecto.supabase.co/functions/v1/ooslmp_generator \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```
