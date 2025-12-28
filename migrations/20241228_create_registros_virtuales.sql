-- Migration: Create registros_virtuales table for synthetic/generated records
-- Date: 2024-12-28
-- Purpose: Separate virtual records from physical records for OOSLMP (clave_empresa = 4)

-- Tabla para registros sintéticos/virtuales (cloud-only, no se sincroniza a SQLite local)
CREATE TABLE IF NOT EXISTS public.registros_virtuales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_ruta INTEGER,
  placa_vehiculo TEXT NOT NULL,
  numero_economico TEXT,
  clave_operador INTEGER,
  operador TEXT,
  ruta TEXT,
  peso NUMERIC,
  peso_entrada NUMERIC,
  peso_salida NUMERIC,
  fecha_entrada TIMESTAMP WITH TIME ZONE,
  fecha_salida TIMESTAMP WITH TIME ZONE,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tipo_pesaje TEXT DEFAULT 'entrada',
  folio TEXT,
  clave_concepto INTEGER,
  concepto_id TEXT,
  clave_empresa INTEGER NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  registrado_por TEXT DEFAULT 'SYSTEM_GENERATED_OOSLMP',
  generated_by_run_id TEXT REFERENCES generated_records_audit(id) ON DELETE SET NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rv_fecha_entrada ON registros_virtuales(fecha_entrada);
CREATE INDEX IF NOT EXISTS idx_rv_clave_empresa ON registros_virtuales(clave_empresa);
CREATE INDEX IF NOT EXISTS idx_rv_fecha_empresa ON registros_virtuales(clave_empresa, fecha_entrada);

-- Comentarios en tabla y columnas importantes
COMMENT ON TABLE registros_virtuales IS 'Registros sintéticos generados automáticamente para completar objetivos mensuales. Solo existe en Supabase (cloud-only), no se sincroniza a SQLite local.';
COMMENT ON COLUMN registros_virtuales.registrado_por IS 'Marcador para identificar origen: SYSTEM_GENERATED_OOSLMP (tiempo real) o SYSTEM_GENERATED_OOSLMP_BACKFILL (histórico)';
COMMENT ON COLUMN registros_virtuales.generated_by_run_id IS 'Foreign key a generated_records_audit para rastrear qué ejecución generó este registro';

-- Trigger para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_rv_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rv_timestamp
  BEFORE UPDATE ON registros_virtuales
  FOR EACH ROW
  EXECUTE FUNCTION update_rv_timestamp();

-- Row Level Security (RLS)
ALTER TABLE registros_virtuales ENABLE ROW LEVEL SECURITY;

-- Service role tiene acceso completo
CREATE POLICY "Service role full access to virtual records"
  ON registros_virtuales FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Usuarios autenticados pueden leer todos los registros virtuales
CREATE POLICY "Authenticated users can read virtual records"
  ON registros_virtuales FOR SELECT
  TO authenticated
  USING (true);

-- Vista unificada para reportes (combina registros físicos + virtuales)
CREATE OR REPLACE VIEW view_registros_completos AS
  SELECT
    id, clave_ruta, placa_vehiculo, numero_economico, clave_operador,
    operador, ruta, peso, peso_entrada, peso_salida, fecha_entrada,
    fecha_salida, fecha_registro, tipo_pesaje, folio, clave_concepto,
    concepto_id, clave_empresa, observaciones, created_at, updated_at,
    registrado_por,
    'fisico'::text as tipo_registro,
    NULL::text as generated_by_run_id
  FROM registros
  UNION ALL
  SELECT
    id, clave_ruta, placa_vehiculo, numero_economico, clave_operador,
    operador, ruta, peso, peso_entrada, peso_salida, fecha_entrada,
    fecha_salida, fecha_registro, tipo_pesaje, folio, clave_concepto,
    concepto_id, clave_empresa, observaciones, created_at, updated_at,
    registrado_por,
    'virtual'::text as tipo_registro,
    generated_by_run_id
  FROM registros_virtuales;

COMMENT ON VIEW view_registros_completos IS 'Vista unificada que combina registros físicos y virtuales, útil para reportes completos. Incluye columna tipo_registro para diferenciar origen.';
