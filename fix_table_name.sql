-- Script para corregir el nombre de la tabla si se creó en minúsculas
-- Ejecuta esto en Supabase SQL Editor si tu tabla se llama "account" (minúscula)

-- Verificar qué tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%account%';

-- Si la tabla se llama "account" (minúscula), renombrarla a "Account"
-- Descomenta las siguientes líneas si necesitas renombrar:

-- ALTER TABLE IF EXISTS account RENAME TO "Account";

-- Si necesitas renombrar las columnas también (si están en minúsculas):
-- ALTER TABLE "Account" RENAME COLUMN IF EXISTS "userid" TO "userId";
-- ALTER TABLE "Account" RENAME COLUMN IF EXISTS "createdat" TO "createdAt";
-- ALTER TABLE "Account" RENAME COLUMN IF EXISTS "updatedat" TO "updatedAt";
