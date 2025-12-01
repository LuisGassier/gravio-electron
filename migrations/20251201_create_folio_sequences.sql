-- Migración: Crear tabla folio_sequences para generación offline de folios
-- Fecha: 2025-12-01
-- Propósito: Permitir generación de folios offline y sincronización con Supabase

-- Crear tabla folio_sequences
CREATE TABLE IF NOT EXISTS public.folio_sequences (
  id TEXT PRIMARY KEY,
  clave_empresa INTEGER UNIQUE NOT NULL,
  prefijo_empresa VARCHAR(4) NOT NULL,
  ultimo_numero INTEGER NOT NULL DEFAULT 0,
  sincronizado BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Foreign key a empresa
  CONSTRAINT fk_folio_sequences_empresa 
    FOREIGN KEY (clave_empresa) 
    REFERENCES public.empresa(clave_empresa)
    ON DELETE CASCADE
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_folio_sequences_clave_empresa 
  ON public.folio_sequences(clave_empresa);

CREATE INDEX IF NOT EXISTS idx_folio_sequences_sincronizado 
  ON public.folio_sequences(sincronizado) 
  WHERE sincronizado = false;

-- Comentarios para documentación
COMMENT ON TABLE public.folio_sequences IS 
  'Contadores de folios por empresa para generación offline';

COMMENT ON COLUMN public.folio_sequences.clave_empresa IS 
  'Clave única de la empresa';

COMMENT ON COLUMN public.folio_sequences.prefijo_empresa IS 
  'Prefijo de 4 letras para los folios (ej: GRAV)';

COMMENT ON COLUMN public.folio_sequences.ultimo_numero IS 
  'Último número de folio generado';

COMMENT ON COLUMN public.folio_sequences.sincronizado IS 
  'Indica si la secuencia está sincronizada con la tabla registros';

COMMENT ON COLUMN public.folio_sequences.updated_at IS 
  'Última actualización de la secuencia';

-- Función para sincronizar secuencias desde registros existentes
-- Útil para inicializar las secuencias basándose en los folios ya generados
CREATE OR REPLACE FUNCTION public.sync_folio_sequence_from_registros(p_clave_empresa INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_max_numero INTEGER;
  v_prefijo VARCHAR(4);
  v_sequence_id TEXT;
BEGIN
  -- Obtener prefijo de la empresa
  SELECT prefijo INTO v_prefijo
  FROM empresa
  WHERE clave_empresa = p_clave_empresa;
  
  IF v_prefijo IS NULL THEN
    RAISE EXCEPTION 'Empresa % no encontrada', p_clave_empresa;
  END IF;
  
  -- Obtener máximo número de folio de registros
  SELECT COALESCE(MAX(CAST(SPLIT_PART(folio, '-', 2) AS INTEGER)), 0)
  INTO v_max_numero
  FROM registros
  WHERE clave_empresa = p_clave_empresa
  AND folio ~ '^[A-Z]{4}-[0-9]{7}$';
  
  -- Crear o actualizar secuencia
  v_sequence_id := 'seq-' || p_clave_empresa;
  
  INSERT INTO folio_sequences (
    id, 
    clave_empresa, 
    prefijo_empresa, 
    ultimo_numero, 
    sincronizado, 
    updated_at
  )
  VALUES (
    v_sequence_id,
    p_clave_empresa,
    v_prefijo,
    v_max_numero,
    true,
    NOW()
  )
  ON CONFLICT (clave_empresa)
  DO UPDATE SET
    ultimo_numero = GREATEST(folio_sequences.ultimo_numero, EXCLUDED.ultimo_numero),
    sincronizado = true,
    updated_at = NOW();
  
  RETURN v_max_numero;
END;
$$;

COMMENT ON FUNCTION public.sync_folio_sequence_from_registros IS 
  'Sincroniza la secuencia de folios de una empresa basándose en los registros existentes';

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_folio_sequence_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_folio_sequence_timestamp
  BEFORE UPDATE ON public.folio_sequences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_folio_sequence_timestamp();

-- RLS (Row Level Security) - solo admin puede modificar
ALTER TABLE public.folio_sequences ENABLE ROW LEVEL SECURITY;

-- Política: Cualquier usuario autenticado puede leer
CREATE POLICY "Usuarios autenticados pueden leer secuencias"
  ON public.folio_sequences
  FOR SELECT
  USING (true);

-- Política: Solo admin puede insertar/actualizar/eliminar
CREATE POLICY "Solo admin puede modificar secuencias"
  ON public.folio_sequences
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE r.nombre = 'admin'
    )
  );

-- Inicializar secuencias para empresas existentes (ejecutar una vez)
-- Esto se puede ejecutar manualmente o desde la aplicación
-- SELECT sync_folio_sequence_from_registros(clave_empresa) FROM empresa;
