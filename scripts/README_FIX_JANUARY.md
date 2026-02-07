# Scripts de Corrección de Registros - Enero 2026

Este documento explica cómo usar los scripts para diagnosticar y corregir problemas específicos en los registros de Enero 2026 para OOSLMP (empresa clave 4).

## Problemas a Corregir

1. **Folios duplicados con mismo peso el mismo día** (~4 pares)
2. **Peso de carga mayor que peso del camión** (~64 registros)
3. **Placas y número económico incompatibles** (~63 registros)
4. **Tiempos de permanencia menores a 10 minutos** (promedio esperado: 10-25 min)

## Scripts Disponibles

### 1. `diagnose_january_issues.ts` - Diagnóstico

Genera un reporte detallado de todos los problemas encontrados sin modificar la base de datos.

**Uso:**
```bash
SUPABASE_URL=<tu_url> SUPABASE_SERVICE_ROLE_KEY=<tu_key> npx ts-node scripts/diagnose_january_issues.ts
```

**Salida:**
- Lista de todos los folios duplicados agrupados por día y peso
- Registros con pesos inválidos (carga > camión)
- Registros con placas y números económicos incompatibles
- Resumen de problemas encontrados

**Recomendación:** Ejecuta primero este script para entender la magnitud del problema.

### 2. `fix_january_issues.ts` - Correcciones

Aplica correcciones automáticas a los problemas detectados.

**Modo Dry Run (sin modificar):**
```bash
DRY_RUN=true SUPABASE_URL=<tu_url> SUPABASE_SERVICE_ROLE_KEY=<tu_key> npx ts-node scripts/fix_january_issues.ts
```

**Modo Live (aplicar cambios):**
```bash
DRY_RUN=false SUPABASE_URL=<tu_url> SUPABASE_SERVICE_ROLE_KEY=<tu_key> npx ts-node scripts/fix_january_issues.ts
```

## Estrategias de Corrección

### 1. Folios Duplicados
- **Detección:** Agrupa registros por día (México UTC-6) y peso exacto
- **Corrección:** Mantiene el primer registro sin cambios, ajusta el peso de los demás
- **Variación:** ±100 kg usando la función `avoidExactPeso()` para evitar múltiplos de 500/1000
- **Restricciones:** Respeta los límites de capacidad del vehículo

### 2. Pesos Inválidos
- **Detección:**
  - `peso_carga > peso_entrada` (físicamente imposible)
  - `peso_salida > peso_entrada` (error de registro)
- **Corrección:**
  - Regenera `peso_salida` dentro del rango del vehículo (usando distribución truncada normal)
  - Regenera `peso_carga` (RSU) dentro de la capacidad del vehículo
  - Recalcula `peso_entrada = peso_salida + peso_carga`
- **Respeta:** Especificaciones del vehículo según [REGLAS MES DE ENERO 2026.csv](../docs/REGLAS%20MES%20DE%20ENERO%202026.csv)

### 3. Placas y Número Económico Incompatibles

- **Identificador único:** La **placa** es el identificador más confiable
- **Nota importante:** Algunos números económicos se repiten:
  - `2013` tiene dos placas: `SN43215`, `SN46198`
  - `2012` tiene tres placas: `SN31022`, `SN31025`, `SN43220`
- **Corrección:**
  - Si se encuentra el vehículo por placa: corrige el número económico
  - Si se encuentra por número económico: corrige la placa
  - Si no se encuentra: asigna vehículo basado en el peso de carga

### 4. Tiempos de Permanencia Cortos

- **Detección:** Registros donde `fecha_salida - fecha_entrada < 10 minutos`
- **Corrección:** Ajusta `fecha_salida` para tener una duración entre 10-25 minutos
- **Distribución:** Usa distribución normal truncada (media: 17.5 min, rango: 10-25 min)
- **Preserva:** La `fecha_entrada` original, solo modifica `fecha_salida`

## Especificaciones de Vehículos (OOSLMP)

### Compactadores de 2 ejes (2 unidades)
| Número Económico | Placa   | Peso Vehículo (kg) | Capacidad RSU (kg) | Peso Bruto (kg) |
|-----------------|---------|--------------------|--------------------|-----------------|
| 2017            | SP85738 | 13,200 - 15,500    | 13,000 - 14,000    | 26,200 - 29,500 |
| 2018            | SP85739 | 13,200 - 15,500    | 13,000 - 14,000    | 26,200 - 29,500 |

### Compactadores de 1 eje (3 unidades)
| Número Económico | Placa   | Peso Vehículo (kg) | Capacidad RSU (kg) | Peso Bruto (kg) |
|-----------------|---------|--------------------|--------------------|-----------------|
| 2013            | SN43215 | 10,200 - 11,700    | 9,000 - 10,000     | 19,200 - 21,700 |
| 2013            | SN46198 | 10,200 - 11,700    | 9,000 - 10,000     | 19,200 - 21,700 |
| 2010            | SM02293 | 10,200 - 11,700    | 9,000 - 10,000     | 19,200 - 21,700 |

### Vehículos tipo Volteo (4 unidades)
| Número Económico | Placa   | Peso Vehículo (kg) | Capacidad RSU (kg) | Peso Bruto (kg) |
|-----------------|---------|--------------------|--------------------|-----------------|
| 2015            | SP81281 | 6,000 - 7,500      | 5,500 - 6,500      | 11,500 - 14,000 |
| 2012            | SN31022 | 6,000 - 7,500      | 5,500 - 6,500      | 11,500 - 14,000 |
| 2012            | SN31025 | 6,000 - 7,500      | 5,500 - 6,500      | 11,500 - 14,000 |
| 2012            | SN43220 | 6,000 - 7,500      | 5,500 - 6,500      | 11,500 - 14,000 |

## Workflow Recomendado

```bash
# Paso 1: Diagnosticar problemas
npx ts-node scripts/diagnose_january_issues.ts

# Paso 2: Revisar el reporte y entender los problemas

# Paso 3: Ejecutar correcciones en modo dry run
DRY_RUN=true npx ts-node scripts/fix_january_issues.ts

# Paso 4: Si todo se ve bien, aplicar cambios
DRY_RUN=false npx ts-node scripts/fix_january_issues.ts

# Paso 5: (Opcional) Volver a diagnosticar para verificar
npx ts-node scripts/diagnose_january_issues.ts
```

## Variables de Entorno

Ambos scripts requieren:
- `SUPABASE_URL`: URL del proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (no anon key)

El script de corrección también acepta:
- `DRY_RUN`: `true` para simular, `false` para aplicar cambios (default: `true`)

**Tip:** Puedes crear un archivo `.env` en la raíz del proyecto con estas variables:
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## Notas Importantes

1. **Siempre ejecuta el diagnóstico primero** para entender qué se va a modificar
2. **Usa DRY_RUN=true** para verificar los cambios antes de aplicarlos
3. Los scripts trabajan específicamente con:
   - Empresa: OOSLMP (clave_empresa = 4)
   - Periodo: Enero 2026 (hora México UTC-6)
4. Las correcciones respetan:
   - Capacidades de vehículos
   - Distribuciones realistas de pesos
   - Evita múltiplos exactos de 500/1000 kg

## Funciones Auxiliares

### `avoidExactPeso(value, min, max)`
Genera variación realista en pesos, evitando múltiplos exactos de 500 y 1000 kg.

### `sampleTruncatedNormal(mean, std, min, max)`
Genera valores con distribución normal truncada, más realista que distribución uniforme.

### `roundToNearestTen(value)`
Redondea a la decena más cercana con variación (±40 kg).

## Troubleshooting

**Error: "No se pudo encontrar vehículo"**
- Verifica que las placas y números económicos en la base de datos coincidan con las especificaciones
- Revisa el archivo [REGLAS MES DE ENERO 2026.csv](../docs/REGLAS%20MES%20DE%20ENERO%202026.csv)

**Error: "Cannot update record"**
- Verifica que tengas permisos de service role en Supabase
- Verifica que RLS policies permitan updates para service role

**Muchos vehículos "desconocidos"**
- Es normal si hubo errores en el backfill original
- El script intentará mapear basado en el peso de carga
- Revisa manualmente si es necesario

## Contacto

Para más información sobre el sistema de backfill, consulta:
- [backfill_ooslmp.ts](./backfill_ooslmp.ts) - Script original de generación
- [CLAUDE.md](../CLAUDE.md) - Guía general del proyecto
