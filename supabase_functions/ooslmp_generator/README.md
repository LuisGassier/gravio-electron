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
- `TARGET_MONTH_TOTAL_KG` (por defecto `380000`)
- `TARGET_MONTH_VARIATION` (por defecto `10000`)
- `TARGET_DAILY_COUNT_MEAN` (por defecto `10`)
- `DRY_RUN` (por defecto `true`) — cuando `true` no hace insert en la DB, solo devuelve el registro candidato

Comportamiento de ejecución

- La función se puede programar cada 10-30 minutos.
- En cada ejecución la función calcula el objetivo diario (9–11 registros) y cuántos ya existen hoy para `clave_empresa = 4`.
- Si la cantidad restante para hoy es 0 la ejecución se salta.
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
