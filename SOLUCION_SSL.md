# Solución para el Error de Certificado SSL

## El Problema
El error "bad certificate format" ocurre porque Prisma tiene problemas con los certificados SSL cuando se usa el pooler de Supabase.

## Solución Recomendada: Usar Conexión Directa

### Paso 1: Obtener la URL de Conexión Directa desde Supabase

1. Ve a tu dashboard de Supabase: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **Settings** (⚙️) en el menú lateral
4. Haz clic en **Database**
5. Busca la sección **Connection string**
6. Selecciona la pestaña **URI** (NO la de "Session pooler" o "Transaction pooler")
7. Copia la URL que aparece (debe ser algo como):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
8. Reemplaza `[YOUR-PASSWORD]` con tu contraseña de base de datos

### Paso 2: Actualizar el archivo .env

Reemplaza la línea `DATABASE_URL` en tu archivo `.env` con la URL directa que copiaste, agregando el parámetro SSL:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
```

### Paso 3: Reiniciar el servidor

```bash
# Detén el servidor (Ctrl+C) y reinícialo
npm run dev
```

## Alternativa: Si debes usar el Pooler

Si necesitas usar el pooler por alguna razón, prueba con esta configuración en `.env`:

```env
DATABASE_URL="postgresql://postgres.gonreeircfqehvomnufd:faske6-dozxed-jYgzaz@aws-0-us-west-2.pooler.supabase.com:6543/postgres?sslmode=prefer&pgbouncer=true&connect_timeout=30"
```

Y luego reinicia el servidor.

## Nota Importante

- La conexión directa (puerto 5432) es más compatible con Prisma
- El pooler (puerto 6543) puede tener problemas con certificados SSL en algunos casos
- Para producción, siempre usa `sslmode=require` o configura los certificados correctamente
