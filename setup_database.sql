-- Script SQL para crear las tablas manualmente en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Crear la tabla User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Crear índice para email (ya está como UNIQUE, pero esto ayuda con búsquedas)
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- Verificar que se creó correctamente
SELECT * FROM "User" LIMIT 1;
