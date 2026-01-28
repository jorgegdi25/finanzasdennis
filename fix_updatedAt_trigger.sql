-- Script para agregar trigger que actualice updatedAt automáticamente
-- Ejecuta esto en Supabase SQL Editor si updatedAt no se actualiza automáticamente

-- Crear función para actualizar updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para la tabla Account (si no existe)
DROP TRIGGER IF EXISTS update_account_updated_at ON "Account";
CREATE TRIGGER update_account_updated_at
    BEFORE UPDATE ON "Account"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- También asegurar que updatedAt tenga un valor por defecto
ALTER TABLE "Account" 
ALTER COLUMN "updatedAt" 
SET DEFAULT CURRENT_TIMESTAMP;
