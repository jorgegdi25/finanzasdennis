# 🔍 Verificar que la Tabla Account Existe Correctamente

## Pasos para Verificar

### 1. Verificar en Supabase Dashboard

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **Table Editor** en el menú lateral
4. Deberías ver la tabla `Account` en la lista
5. Haz clic en ella para ver su estructura

### 2. Verificar la Estructura de la Tabla

La tabla `Account` debe tener estas columnas exactas:

- `id` (TEXT, Primary Key)
- `name` (TEXT, NOT NULL)
- `balance` (DOUBLE PRECISION, NOT NULL, DEFAULT 0)
- `userId` (TEXT, NOT NULL)
- `createdAt` (TIMESTAMP(3), NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- `updatedAt` (TIMESTAMP(3), NOT NULL)

### 3. Verificar el Foreign Key

1. En Supabase, ve a **Database** > **Foreign Keys**
2. Deberías ver una relación: `Account.userId` → `User.id`

### 4. Probar la Conexión

Ejecuta este comando para probar la conexión:

```bash
node test_accounts.js
```

O desde Prisma Studio:

```bash
npx prisma studio
```

Esto abrirá una interfaz web donde puedes ver y editar los datos.

## Problemas Comunes

### Si la tabla no aparece:
- Ejecuta el script SQL nuevamente en Supabase SQL Editor
- Verifica que estés en el proyecto correcto

### Si hay errores de tipo de datos:
- Asegúrate de que `balance` sea `DOUBLE PRECISION` (no `REAL` o `NUMERIC`)
- Asegúrate de que `createdAt` y `updatedAt` sean `TIMESTAMP(3)`

### Si el servidor no reconoce la tabla:
1. Reinicia el servidor de desarrollo: `npm run dev`
2. Regenera el cliente: `npx prisma generate`
3. Verifica que el `.env` tenga la URL correcta

## Recrear la Tabla (si es necesario)

Si necesitas recrear la tabla desde cero:

```sql
-- Eliminar la tabla si existe
DROP TABLE IF EXISTS "Account" CASCADE;

-- Crear la tabla nuevamente
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- Crear índice
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- Agregar foreign key
ALTER TABLE "Account" 
ADD CONSTRAINT "Account_userId_fkey" 
FOREIGN KEY ("userId") 
REFERENCES "User"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;
```
