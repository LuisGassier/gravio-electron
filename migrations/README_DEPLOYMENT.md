# Guía de Despliegue: Registros Virtuales OOSLMP

Esta guía contiene los pasos para desplegar la nueva funcionalidad de separación de registros virtuales y el backfill histórico de diciembre 2024.

## 📋 Resumen de Cambios

### Archivos Creados/Modificados

**✅ Nuevos:**
- `migrations/20241228_create_registros_virtuales.sql` - Migración de base de datos
- `scripts/backfill_ooslmp_december_2024.ts` - Script de backfill histórico
- `migrations/VALIDACION_registros_virtuales.sql` - Queries de validación

**✏️ Modificados:**
- `supabase_functions/ooslmp_generator/index.ts` - Edge Function actualizada
- `supabase_functions/ooslmp_generator/README.md` - Documentación actualizada

### Cambios Principales

1. **Nueva tabla `registros_virtuales`** (cloud-only, solo Supabase)
2. **Vista unificada `view_registros_completos`** (combina físicos + virtuales)
3. **Edge Function actualizada** para insertar en la nueva tabla
4. **Script de backfill** para generar datos históricos de dic 1-27, 2024

---

## 🚀 Pasos de Despliegue

### Paso 1: Aplicar Migración SQL en Supabase

**Opción A: Via Supabase Dashboard (Recomendado para primera vez)**

1. Ir a [Supabase Dashboard](https://app.supabase.com)
2. Seleccionar el proyecto
3. Ir a **SQL Editor**
4. Crear una nueva query
5. Copiar el contenido de `migrations/20241228_create_registros_virtuales.sql`
6. Pegar y ejecutar (botón "Run")
7. Verificar que no hay errores

**Opción B: Via Supabase CLI**

```bash
# Desde el directorio raíz del proyecto
supabase db push
```

**✅ Validación:**

Ejecutar esta query para verificar que la tabla existe:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'registros_virtuales';
```

Debe retornar 1 fila.

---

### Paso 2: Desplegar Edge Function Actualizada

**Requisitos:**
- Tener instalado Supabase CLI: `npm install -g supabase`
- Estar autenticado: `supabase login`

**Desplegar función:**

```bash
# Desde el directorio raíz del proyecto
cd supabase_functions

# Desplegar función actualizada
supabase functions deploy ooslmp_generator

# Configurar variables de entorno (si no están ya configuradas)
supabase secrets set DRY_RUN=true  # Mantener en true hasta validar
```

**✅ Validación:**

Probar la función vía HTTP:

```bash
curl -X POST https://TU-PROYECTO.supabase.co/functions/v1/ooslmp_generator \
  -H "Authorization: Bearer TU-ANON-KEY" \
  -H "Content-Type: application/json"
```

Debe retornar un JSON con `dry_run: true` y un registro candidato.

---

### Paso 3: Ejecutar Backfill Histórico

**⚠️ IMPORTANTE: Ejecutar primero en modo DRY_RUN**

```bash
# Desde el directorio raíz del proyecto
cd scripts

# DRY RUN (no inserta nada, solo muestra lo que haría)
SUPABASE_URL=https://TU-PROYECTO.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=TU-SERVICE-ROLE-KEY \
npx ts-node backfill_ooslmp_december_2024.ts
```

**Revisar el output:**
- ✅ Número de días con actividad detectados
- ✅ Registros virtuales a crear por día
- ✅ Total de kg a generar (~350,000 kg)
- ✅ No debe haber warnings de colisiones

**Si todo se ve correcto, ejecutar en modo LIVE:**

```bash
DRY_RUN=false \
SUPABASE_URL=https://TU-PROYECTO.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=TU-SERVICE-ROLE-KEY \
npx ts-node backfill_ooslmp_december_2024.ts
```

**✅ Validación:**

Ejecutar queries de [VALIDACION_registros_virtuales.sql](./VALIDACION_registros_virtuales.sql):

```sql
-- Total de registros virtuales insertados
SELECT COUNT(*) FROM registros_virtuales WHERE clave_empresa = 4;

-- Kg totales (debe estar cerca de 350,000 kg)
SELECT SUM(peso_entrada) FROM registros_virtuales WHERE clave_empresa = 4;

-- Distribución por día (debe ser 9-11 registros totales)
SELECT DATE(fecha_entrada) as dia, COUNT(*) as registros
FROM view_registros_completos
WHERE clave_empresa = 4 AND fecha_entrada >= '2024-12-01'
GROUP BY DATE(fecha_entrada) ORDER BY dia;
```

---

### Paso 4: Activar Edge Function en Modo LIVE

**Solo después de validar el backfill:**

```bash
# Cambiar DRY_RUN a false para que la función inserte registros reales
supabase secrets set DRY_RUN=false
```

**✅ Validación:**

Esperar 30 minutos y verificar que se creó un nuevo registro virtual:

```sql
SELECT * FROM registros_virtuales
WHERE clave_empresa = 4
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

### Paso 5: Programar Ejecución Periódica

**Opción A: Supabase Cron (Recomendado)**

Crear un Edge Function scheduler en Supabase Dashboard:
- Ir a **Edge Functions** → **Cron Jobs**
- Crear nuevo job
- Función: `ooslmp_generator`
- Frecuencia: `*/20 * * * *` (cada 20 minutos)

**Opción B: Cron externo**

```bash
# En crontab -e
*/20 * * * * curl -X POST https://TU-PROYECTO.supabase.co/functions/v1/ooslmp_generator -H "Authorization: Bearer TU-ANON-KEY" >> /var/log/ooslmp_generator.log 2>&1
```

---

## 📊 Validación Post-Despliegue

### Checklist de Validación (ejecutar 24-48 horas después)

- [ ] La tabla `registros_virtuales` existe y tiene índices
- [ ] El backfill insertó ~350,000 kg total para dic 1-27
- [ ] Cada día trabajado tiene 9-11 registros totales (físicos + virtuales)
- [ ] No hay registros en ventanas prohibidas (domingos 7am-4pm)
- [ ] No hay colisiones (< 8 minutos entre registros)
- [ ] La Edge Function está generando registros nuevos cada 20-30 minutos
- [ ] Los registros nuevos usan `registrado_por = 'SYSTEM_GENERATED_OOSLMP'`
- [ ] Los registros del backfill usan `registrado_por = 'SYSTEM_GENERATED_OOSLMP_BACKFILL'`

### Queries de Monitoreo Diario

```sql
-- Ver registros generados hoy
SELECT COUNT(*), SUM(peso_entrada) FROM registros_virtuales
WHERE clave_empresa = 4 AND DATE(fecha_entrada) = CURRENT_DATE;

-- Ver últimos 5 registros generados
SELECT fecha_entrada, peso_entrada, registrado_por, created_at
FROM registros_virtuales
WHERE clave_empresa = 4
ORDER BY created_at DESC LIMIT 5;

-- Tendencia semanal
SELECT
  DATE_TRUNC('week', fecha_entrada) as semana,
  COUNT(*) as registros,
  SUM(peso_entrada) as kg
FROM registros_virtuales
WHERE clave_empresa = 4
GROUP BY semana ORDER BY semana;
```

---

## 🔧 Troubleshooting

### Problema: El backfill no detecta días con actividad

**Solución:**
```sql
-- Verificar que existen registros físicos en diciembre
SELECT COUNT(*), MIN(fecha_entrada), MAX(fecha_entrada)
FROM registros
WHERE clave_empresa = 4
  AND fecha_entrada >= '2024-12-01'
  AND fecha_entrada < '2024-12-28';
```

Si retorna 0, significa que no hay registros físicos en ese rango. Ajustar las fechas del backfill.

### Problema: Edge Function retorna error 500

**Solución:**
1. Verificar logs en Supabase Dashboard → Edge Functions → Logs
2. Verificar que `generated_records_audit` existe
3. Verificar que las variables de entorno están configuradas

### Problema: Hay demasiadas colisiones

**Solución:**
```sql
-- Eliminar registros virtuales de un día específico
DELETE FROM registros_virtuales
WHERE clave_empresa = 4 AND DATE(fecha_entrada) = '2024-12-15';
```

Luego ajustar `COLLISION_BUFFER_MINUTES` en el script de backfill (aumentar a 10-12) y volver a ejecutar.

### Problema: Quiero limpiar todo y empezar de nuevo

**Solución:**
```sql
-- ⚠️ CUIDADO: Esto elimina TODOS los registros virtuales de diciembre
DELETE FROM registros_virtuales
WHERE clave_empresa = 4
  AND fecha_entrada >= '2024-12-01'
  AND fecha_entrada < '2024-12-28';
```

Luego volver a ejecutar el backfill.

---

## 📝 Notas Importantes

1. **Registros virtuales son cloud-only**: NO se sincronizan a SQLite local del app Electron
2. **No afectan registros físicos**: Los registros físicos permanecen intactos en la tabla `registros`
3. **Fácil rollback**: Si algo sale mal, simplemente eliminar de `registros_virtuales`
4. **Vista unificada**: Para reportes que necesiten ambos tipos, usar `view_registros_completos`

---

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Revisar logs de Supabase Edge Functions
2. Ejecutar queries de validación en [VALIDACION_registros_virtuales.sql](./VALIDACION_registros_virtuales.sql)
3. Verificar que todas las variables de entorno están configuradas
4. Revisar la documentación en [supabase_functions/ooslmp_generator/README.md](../supabase_functions/ooslmp_generator/README.md)

---

**Fecha de creación:** 2024-12-28
**Versión:** 1.0
**Autor:** Claude Code
