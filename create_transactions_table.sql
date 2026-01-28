-- Script SQL para crear la tabla Transaction en Supabase
-- Ejecuta este script en Supabase Dashboard > SQL Editor

-- Crear la tabla Transaction
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "accountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_accountId_idx" ON "Transaction"("accountId");

-- Agregar foreign key constraints
DO $$ 
BEGIN
    -- Foreign key para Account
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Transaction_accountId_fkey'
    ) THEN
        ALTER TABLE "Transaction" 
        ADD CONSTRAINT "Transaction_accountId_fkey" 
        FOREIGN KEY ("accountId") 
        REFERENCES "Account"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;

    -- Foreign key para User
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Transaction_userId_fkey'
    ) THEN
        ALTER TABLE "Transaction" 
        ADD CONSTRAINT "Transaction_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "User"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;
